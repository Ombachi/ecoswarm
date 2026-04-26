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

    // Auth - admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    // Verify admin role
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRole) throw new Error("Admin access required");

    const { payoutId } = await req.json();
    if (!payoutId) throw new Error("Missing payout ID");

    // Fetch payout
    const { data: payout, error: payoutErr } = await supabase
      .from("seller_payouts")
      .select("*")
      .eq("id", payoutId)
      .single();
    if (payoutErr || !payout) throw new Error("Payout not found");
    if (payout.status !== "pending") throw new Error("Payout is not pending");
    if (!payout.mpesa_phone) throw new Error("No M-Pesa phone number on payout");

    const amount = Number(payout.amount);
    if (amount <= 0) throw new Error("Invalid payout amount");

    // ── M-Pesa B2C Transfer ──
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const initiatorName = Deno.env.get("MPESA_INITIATOR_NAME");
    const securityCredential = Deno.env.get("MPESA_SECURITY_CREDENTIAL");
    const b2cShortCode = Deno.env.get("MPESA_B2C_SHORTCODE");

    if (!consumerKey || !consumerSecret) {
      throw new Error("M-Pesa API credentials not configured");
    }

    const isProduction = Deno.env.get("MPESA_ENVIRONMENT") === "production";
    const baseUrl = isProduction
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

    // Step 1: OAuth token
    const authStr = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${authStr}` },
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("M-Pesa auth failed");

    // Normalize phone
    const phone = payout.mpesa_phone.replace(/\s/g, "").replace(/^0/, "254");

    if (initiatorName && securityCredential && b2cShortCode) {
      // ── REAL B2C TRANSFER ──
      const callbackUrl = Deno.env.get("MPESA_B2C_CALLBACK_URL") ||
        `${supabaseUrl}/functions/v1/process-payout`;
      const timeoutUrl = callbackUrl;

      const b2cRes = await fetch(`${baseUrl}/mpesa/b2c/v3/paymentrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          OriginatorConversationID: `PAYOUT-${payout.id.slice(0, 8)}-${Date.now()}`,
          InitiatorName: initiatorName,
          SecurityCredential: securityCredential,
          CommandID: "BusinessPayment",
          Amount: Math.floor(amount),
          PartyA: b2cShortCode,
          PartyB: phone,
          Remarks: "EcoSwarm Seller Payout",
          QueueTimeOutURL: timeoutUrl,
          ResultURL: callbackUrl,
          Occasion: `Payout ${payout.id.slice(0, 8)}`,
        }),
      });

      const b2cData = await b2cRes.json();

      if (b2cData.ResponseCode === "0") {
        // B2C request accepted — mark as processing
        await supabase
          .from("seller_payouts")
          .update({
            status: "processing",
            processed_at: new Date().toISOString(),
          })
          .eq("id", payoutId);

        // Notify seller
        await supabase.from("notifications").insert({
          user_id: payout.seller_id,
          type: "payout",
          title: "💰 Payout Processing",
          message: `Your payout of KSh ${amount.toLocaleString()} is being transferred to ${payout.mpesa_phone}.`,
          reference_id: payout.id,
        });

        return new Response(
          JSON.stringify({ success: true, status: "processing", message: "B2C transfer initiated" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        throw new Error(b2cData.errorMessage || b2cData.ResultDesc || "B2C transfer failed");
      }
    } else {
      // ── SANDBOX / MANUAL MODE ──
      // No B2C credentials — mark as approved and generate simulated receipt
      const simReceipt = `SIM_B2C_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      await supabase
        .from("seller_payouts")
        .update({
          status: "approved",
          processed_at: new Date().toISOString(),
          mpesa_receipt: simReceipt,
        })
        .eq("id", payoutId);

      // Notify seller
      await supabase.from("notifications").insert({
        user_id: payout.seller_id,
        type: "payout",
        title: "💰 Payout Approved!",
        message: `Your payout of KSh ${amount.toLocaleString()} has been approved and will be sent to ${payout.mpesa_phone}.`,
        reference_id: payout.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: "approved",
          message: "Payout approved (B2C credentials not configured — manual transfer required)",
          receipt: simReceipt,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("process-payout error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
