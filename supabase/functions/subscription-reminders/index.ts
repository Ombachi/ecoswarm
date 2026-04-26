import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // Find subscriptions expiring in 3 days
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const startOfDay = new Date(threeDaysLater);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(threeDaysLater);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: expiringSubs } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .gte("expires_at", startOfDay.toISOString())
      .lte("expires_at", endOfDay.toISOString());

    if (!expiringSubs || expiringSubs.length === 0) {
      return new Response(JSON.stringify({ message: "No expiring subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const sub of expiringSubs) {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", sub.user_id)
        .single();

      if (!profile?.email) continue;

      // Check if reminder already sent (avoid duplicates)
      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", sub.user_id)
        .eq("type", "subscription_reminder")
        .eq("reference_id", sub.id)
        .maybeSingle();

      if (existingNotif) continue;

      // Create in-app notification
      await supabase.from("notifications").insert({
        user_id: sub.user_id,
        type: "subscription_reminder",
        title: "⏰ Premium Expiring Soon",
        message: `Your EcoDeveloper Premium subscription expires on ${new Date(sub.expires_at).toLocaleDateString()}. Renew now to keep your priority listing, reduced commission, and verified badge!`,
        reference_id: sub.id,
      });

      // Send email if Resend is configured
      if (resendKey) {
        const expiryDate = new Date(sub.expires_at).toLocaleDateString("en-KE", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EcoSwarm <hello@ecoswarm.co.ke>",
            to: [profile.email],
            subject: "⏰ Your EcoSwarm Premium expires in 3 days",
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#16a34a;">Hey ${profile.name || "there"} 👋</h2>
                <p>Your <strong>EcoDeveloper Premium</strong> subscription is expiring on <strong>${expiryDate}</strong>.</p>
                <p>Don't lose your premium benefits:</p>
                <ul>
                  <li>🏷️ Priority product listings in EcoMarket</li>
                  <li>💰 Reduced 5% platform commission (vs 10%)</li>
                  <li>✅ Verified seller badge</li>
                  <li>📊 Advanced sales analytics</li>
                </ul>
                <p><a href="https://ecoswarm.co.ke/premium" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Renew Now — KSh 500/month</a></p>
                <p style="color:#666;font-size:12px;margin-top:20px;">— The EcoSwarm Team</p>
              </div>
            `,
          }),
        });
      }

      sent++;
    }

    return new Response(
      JSON.stringify({ success: true, reminders_sent: sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
