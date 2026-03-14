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

    const body = await req.json();

    // M-Pesa sends callback in Body.stkCallback format
    const callback = body?.Body?.stkCallback;
    if (!callback) {
      // Manual verification request (authenticated)
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Missing auth");
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      if (authError || !user) throw new Error("Unauthorized");

      const { transactionId } = body;
      if (!transactionId) throw new Error("Missing transaction ID");

      // Fetch transaction
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();
      if (!tx) throw new Error("Transaction not found");
      if (tx.buyer_id !== user.id && tx.seller_id !== user.id) throw new Error("Unauthorized");

      // If we have a checkout ID and Daraja keys, query the status
      const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
      const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");

      if (tx.mpesa_checkout_id && consumerKey && consumerSecret) {
        const isProduction = Deno.env.get("MPESA_ENVIRONMENT") === "production";
        const baseUrl = isProduction
          ? "https://api.safaricom.co.ke"
          : "https://sandbox.safaricom.co.ke";

        const authStr = btoa(`${consumerKey}:${consumerSecret}`);
        const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
          headers: { Authorization: `Basic ${authStr}` },
        });
        const tokenData = await tokenRes.json();

        const shortCode = Deno.env.get("MPESA_SHORTCODE") || "174379";
        const passkey = Deno.env.get("MPESA_PASSKEY") || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
        const password = btoa(`${shortCode}${passkey}${timestamp}`);

        const queryRes = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: tx.mpesa_checkout_id,
          }),
        });
        const queryData = await queryRes.json();

        if (queryData.ResultCode === "0") {
          await supabase
            .from("transactions")
            .update({
              status: "completed",
              verification_status: "verified",
              verified_at: new Date().toISOString(),
              mpesa_receipt: queryData.MpesaReceiptNumber || tx.mpesa_receipt,
            })
            .eq("id", transactionId);

          return new Response(
            JSON.stringify({ success: true, status: "verified" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, status: "pending", message: "Payment not yet confirmed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, status: tx.verification_status, transaction: tx }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── M-Pesa Callback Processing ──
    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    // Find transaction by checkout ID
    const { data: tx } = await supabase
      .from("transactions")
      .select("*")
      .eq("mpesa_checkout_id", checkoutRequestId)
      .single();

    if (!tx) {
      console.error("Transaction not found for checkout:", checkoutRequestId);
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = callback.CallbackMetadata?.Item || [];
      const mpesaReceipt = callbackMetadata.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;

      await supabase
        .from("transactions")
        .update({
          status: "completed",
          verification_status: "verified",
          verified_at: new Date().toISOString(),
          mpesa_receipt: mpesaReceipt || null,
        })
        .eq("id", tx.id);

      // Notify buyer
      await supabase.from("notifications").insert({
        user_id: tx.buyer_id,
        type: "payment",
        title: "✅ Payment Verified!",
        message: `Your M-Pesa payment of KSh ${Number(tx.cash_paid).toLocaleString()} for "${tx.product_name}" has been confirmed.`,
        reference_id: tx.id,
      });
    } else {
      // Payment failed — reverse points
      await supabase
        .from("transactions")
        .update({
          status: "failed",
          verification_status: "failed",
        })
        .eq("id", tx.id);

      // Refund EcoPoints
      const { data: profile } = await supabase
        .from("profiles")
        .select("eco_points")
        .eq("user_id", tx.buyer_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ eco_points: (profile.eco_points || 0) + tx.points_used + tx.bonus_points })
          .eq("user_id", tx.buyer_id);
      }

      // Notify buyer of failure
      await supabase.from("notifications").insert({
        user_id: tx.buyer_id,
        type: "payment",
        title: "❌ Payment Failed",
        message: `Your M-Pesa payment for "${tx.product_name}" failed. Your ${tx.points_used} EcoPoints have been refunded.`,
        reference_id: tx.id,
      });
    }

    // M-Pesa expects this exact response
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("verify-payment error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
