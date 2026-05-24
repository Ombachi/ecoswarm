import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Cron auth: require CRON_SECRET or service-role key if configured
  const cronSecret = Deno.env.get("CRON_SECRET");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
  const providedSecret =
    new URL(req.url).searchParams.get("secret") || req.headers.get("x-cron-secret");
  const isAuthed =
    (cronSecret && providedSecret === cronSecret) ||
    (serviceKey && authHeader === serviceKey);
  if (!isAuthed) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const weekEnd = new Date(now);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const startISO = weekStart.toISOString();
    const endISO = weekEnd.toISOString();
    const startStr = weekStart.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
    const endStr = weekEnd.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });

    // Check for duplicate (only 1 per week)
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .contains("tags", ["weekly_report"])
      .gte("created_at", startISO)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ message: "Weekly report already posted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // New warriors this week
    const { count: newWarriors } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startISO);

    // Courses completed
    const { count: coursesCompleted } = await supabase
      .from("course_completions")
      .select("id", { count: "exact", head: true })
      .gte("completed_at", startISO);

    // Letters sent (posts with EcoLetter tag)
    const { count: lettersSent } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .contains("tags", ["EcoLetter"])
      .gte("created_at", startISO);

    // Products sold
    const { count: productsSold } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", startISO);

    // Total EcoPoints earned (sum of points added – approximate via profile changes)
    const { data: leaderboard } = await supabase
      .from("leaderboard")
      .select("name, eco_points, user_id")
      .order("eco_points", { ascending: false })
      .limit(3);

    const top3 = leaderboard?.map((u) => u.name).filter(Boolean) || [];
    const totalPoints = leaderboard?.reduce((sum, u) => sum + (u.eco_points || 0), 0) || 0;

    const content = `🐝 **The Weekly Swarm Report: ${startStr} – ${endStr}**

📊 Here's how the swarm moved this week:

👥 New Warriors: **${newWarriors || 0}** joined the movement
🎓 Brain Power: **${coursesCompleted || 0}** courses completed
✉️ Voice of Change: **${lettersSent || 0}** EcoLetters forged
🛍️ Eco-Economy: **${productsSold || 0}** sustainable products sold
🌟 Total Impact: **${totalPoints.toLocaleString()}** EcoPoints earned

${top3.length > 0 ? `🏆 **Top Swarmers Spotlight:** Shout-out to ${top3.map((n) => `@${n}`).join(", ")}! 🎉` : ""}

Ready to beat these stats next week? Join a Swarm or Start a Course Now! 💪🌍

#WeeklyReport #EcoSwarm #ClimateAction #SwarmReport`;

    // Get admin or system user for posting
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    const posterId = adminRole?.user_id || "system";
    let posterName = "EcoSwarm HQ";

    if (adminRole?.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", adminRole.user_id)
        .single();
      posterName = profile?.name || "EcoSwarm HQ";
    }

    await supabase.from("posts").insert({
      user_id: posterId,
      user_name: posterName,
      content,
      tags: ["weekly_report", "SwarmReport", "ClimateAction"],
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
