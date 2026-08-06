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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!resendKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const startISO = weekStart.toISOString();
    const startStr = weekStart.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
    const endStr = now.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });

    // Gather weekly stats
    const [newWarriors, coursesCompleted, productsSold, newCourses] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startISO),
      supabase.from("course_completions").select("id", { count: "exact", head: true }).gte("completed_at", startISO),
      supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "completed").gte("created_at", startISO),
      supabase.from("courses").select("id, title").gte("created_at", startISO).limit(5),
    ]);

    // Top products this week
    const { data: topProducts } = await supabase
      .from("products")
      .select("product_name, org_name, price")
      .gte("created_at", startISO)
      .order("created_at", { ascending: false })
      .limit(3);

    // Get dormant users (inactive 7+ days but have email)
    const dormantCutoff = new Date(now);
    dormantCutoff.setDate(dormantCutoff.getDate() - 7);
    const { data: dormantUsers } = await supabase
      .from("profiles")
      .select("user_id, name, email, eco_points")
      .lt("last_active_at", dormantCutoff.toISOString())
      .not("email", "is", null)
      .limit(200);

    // Also send to active users (active in last 7 days)
    const { data: activeUsers } = await supabase
      .from("profiles")
      .select("user_id, name, email, eco_points")
      .gte("last_active_at", dormantCutoff.toISOString())
      .not("email", "is", null)
      .limit(200);

    const allRecipients = [...(dormantUsers || []), ...(activeUsers || [])];

    if (allRecipients.length === 0) {
      return new Response(JSON.stringify({ message: "No recipients found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build course highlights
    const courseHighlights = (newCourses?.data || [])
      .map((c: any) => `<li>🎓 <strong>${c.title}</strong></li>`)
      .join("");

    // Build product highlights
    const productHighlights = (topProducts || [])
      .map((p) => `<li>🛍️ <strong>${p.product_name}</strong> by ${p.org_name} — KSh ${p.price}</li>`)
      .join("");

    let sentCount = 0;
    let errorCount = 0;

    for (const recipient of allRecipients) {
      if (!recipient.email) continue;

      const isDormant = dormantUsers?.some((d) => d.user_id === recipient.user_id);
      const personalNote = isDormant
        ? `<p style="color:#e67e22;font-weight:bold;">🔥 We missed you, ${recipient.name}! Come back and earn more EcoPoints!</p>`
        : `<p>Hey ${recipient.name}! Great work staying active this week 💚</p>`;

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
  <div style="background:linear-gradient(135deg,#16a34a,#059669);padding:24px;border-radius:16px 16px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;">🐝 EcoSwarm Weekly Digest</h1>
    <p style="color:#dcfce7;margin:4px 0 0;">${startStr} – ${endStr}</p>
  </div>
  
  <div style="background:white;padding:24px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">
    ${personalNote}
    
    <h2 style="color:#16a34a;font-size:18px;margin-top:20px;">📊 This Week's Impact</h2>
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      <tr>
        <td style="padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;width:50%;">
          <div style="font-size:28px;font-weight:bold;color:#16a34a;">${newWarriors?.count || 0}</div>
          <div style="font-size:12px;color:#6b7280;">New Warriors</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;width:50%;">
          <div style="font-size:28px;font-weight:bold;color:#16a34a;">${coursesCompleted?.count || 0}</div>
          <div style="font-size:12px;color:#6b7280;">Courses Done</div>
        </td>
      </tr>
      <tr><td colspan="3" style="height:8px;"></td></tr>
      <tr>
        <td style="padding:12px;background:#f0fdf4;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#16a34a;">${productsSold?.count || 0}</div>
          <div style="font-size:12px;color:#6b7280;">Products Sold</div>
        </td>
      </tr>
    </table>

    ${courseHighlights ? `
    <h2 style="color:#16a34a;font-size:18px;margin-top:20px;">🎓 New Courses</h2>
    <ul style="padding-left:20px;color:#374151;">${courseHighlights}</ul>
    ` : ""}

    ${productHighlights ? `
    <h2 style="color:#16a34a;font-size:18px;margin-top:20px;">🛒 Marketplace Highlights</h2>
    <ul style="padding-left:20px;color:#374151;">${productHighlights}</ul>
    ` : ""}

    <div style="text-align:center;margin-top:24px;">
      <a href="https://ecoswarm.co.ke/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#16a34a,#059669);color:white;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px;">
        Open EcoSwarm 🌍
      </a>
    </div>
    
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:24px;">
      You're receiving this because you're a member of EcoSwarm.<br>
      Made with 💚 in Kenya
    </p>
  </div>
</body>
</html>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EcoSwarm <hello@ecoswarm.co.ke>",
            to: [recipient.email],
            subject: `🐝 Your Weekly EcoSwarm Digest — ${startStr} to ${endStr}`,
            html,
          }),
        });

        if (res.ok) {
          sentCount++;
        } else {
          errorCount++;
          console.error(`Failed to send to ${recipient.email}:`, await res.text());
        }

        // Rate limit: small delay between sends
        await new Promise((r) => setTimeout(r, 100));
      } catch (e) {
        errorCount++;
        console.error(`Error sending to ${recipient.email}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, errors: errorCount, total: allRecipients.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
