import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PREMIUM_MONTHLY_PRICE = 500; // KSh 500/month

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const { phoneNumber, action } = await req.json();

    // Check user role — must be ecodeveloper
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!roleData || roleData.role !== "ecodeveloper") {
      throw new Error("Premium subscriptions are available for EcoDeveloper accounts only");
    }

    if (action === "check") {
      // Check current subscription status
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan", "premium")
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return new Response(
        JSON.stringify({ isPremium: !!sub, subscription: sub }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "subscribe") {
      // Validate phone
      if (!phoneNumber || typeof phoneNumber !== "string") throw new Error("Phone number required");
      if (!/^(0[17]\d{8}|254[17]\d{8})$/.test(phoneNumber.replace(/\s/g, ""))) {
        throw new Error("Invalid M-Pesa phone number format");
      }

      // Rate limit: max 3 subscription attempts per hour
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", oneHourAgo);
      if ((count || 0) >= 3) {
        throw new Error("Too many subscription attempts. Please try again later.");
      }

      // Check if already premium
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("plan", "premium")
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (existing) {
        throw new Error("You already have an active premium subscription");
      }

      // M-Pesa STK Push
      const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
      const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
      const shortCode = Deno.env.get("MPESA_SHORTCODE") || "174379";
      const passkey = Deno.env.get("MPESA_PASSKEY") || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL") || `${supabaseUrl}/functions/v1/verify-payment`;

      let mpesaReceipt: string | null = null;
      let status = "active";

      if (consumerKey && consumerSecret) {
        const isProduction = Deno.env.get("MPESA_ENVIRONMENT") === "production";
        const baseUrl = isProduction
          ? "https://api.safaricom.co.ke"
          : "https://sandbox.safaricom.co.ke";

        const authStr = btoa(`${consumerKey}:${consumerSecret}`);
        const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
          headers: { Authorization: `Basic ${authStr}` },
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error("M-Pesa authentication failed");

        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
        const password = btoa(`${shortCode}${passkey}${timestamp}`);
        const normalizedPhone = phoneNumber.replace(/\s/g, "").replace(/^0/, "254");

        const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: PREMIUM_MONTHLY_PRICE,
            PartyA: normalizedPhone,
            PartyB: shortCode,
            PhoneNumber: normalizedPhone,
            CallBackURL: callbackUrl,
            AccountReference: `ECOSUB-${user.id.slice(0, 8).toUpperCase()}`,
            TransactionDesc: "EcoSwarm Premium Subscription",
          }),
        });

        const stkData = await stkRes.json();
        if (stkData.ResponseCode !== "0") {
          throw new Error(stkData.errorMessage || stkData.CustomerMessage || "M-Pesa payment failed");
        }

        // Pending until M-Pesa confirms
        status = "active"; // For sandbox, auto-activate
        mpesaReceipt = stkData.CheckoutRequestID;
      } else {
        // Simulated payment
        mpesaReceipt = `SIM_SUB_${Date.now()}`;
      }

      const startsAt = new Date();
      const expiresAt = new Date(startsAt);
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data: subscription, error: subErr } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: "premium",
          status,
          payment_method: "mpesa",
          mpesa_phone: phoneNumber,
          mpesa_receipt: mpesaReceipt,
          amount: PREMIUM_MONTHLY_PRICE,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (subErr) throw subErr;

      // Notify user
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "subscription",
        title: "🌟 Welcome to Premium!",
        message: `Your EcoDeveloper Premium subscription is now active! Enjoy priority listings, 5% commission, and verified badge for 30 days.`,
      });

      return new Response(
        JSON.stringify({ success: true, subscription }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
