import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_PER_RUN = 200;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { data: queue } = await supabase
      .from("rank_check_queue")
      .select("id, user_id, old_points, new_points")
      .is("processed_at", null)
      .order("enqueued_at", { ascending: true })
      .limit(MAX_PER_RUN);

    if (!queue || queue.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read fresh ranks from the materialized leaderboard (already deduped per user).
    const userIds = queue.map((q) => q.user_id);
    const { data: ranks } = await supabase
      .from("leaderboard_fast")
      .select("user_id, rank, role")
      .in("user_id", userIds);

    const rankMap = new Map<string, { rank: number; role: string }>();
    (ranks || []).forEach((r: any) => rankMap.set(r.user_id, { rank: r.rank, role: r.role }));

    const notifications: any[] = [];
    const processedIds: number[] = [];

    for (const item of queue) {
      const r = rankMap.get(item.user_id);
      processedIds.push(item.id);
      // Only notify top-100 changes to keep noise low.
      if (r && r.rank <= 100) {
        notifications.push({
          user_id: item.user_id,
          type: "rank",
          title: "🏆 You climbed the ranks!",
          message: `You're now #${r.rank} in the ${
            r.role === "ecodeveloper" ? "EcoDeveloper" : "EcoWarrior"
          } rankings!`,
        });
      }
    }

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }

    await supabase
      .from("rank_check_queue")
      .update({ processed_at: new Date().toISOString() })
      .in("id", processedIds);

    return new Response(
      JSON.stringify({ processed: processedIds.length, notified: notifications.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("process-rank-queue error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
