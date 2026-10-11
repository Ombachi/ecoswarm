import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { finalizePurchase, failPurchase } from "../_shared/finalizePurchase.ts";

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

      const { transactionId, action } = body;
      if (!transactionId) throw new Error("Missing transaction ID");

      // Fetch transaction
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();
      if (!tx) throw new Error("Transaction not found");
      if (tx.buyer_id !== user.id && tx.seller_id !== user.id) throw new Error("Unauthorized");
      const json = (o: unknown) => new Response(JSON.stringify(o), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      if (tx.status === "completed") return json({ success: true, status: "verified", receipt: tx.mpesa_receipt });
      if (tx.status === "failed") return json({ success: false, status: "failed" });
      if (action === "cancel" && tx.buyer_id === user.id) {
        await failPurchase(supabase, tx.id, "timed out");
        return json({ success: false, status: "failed" });
      }

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

        const code = String(queryData.ResultCode ?? "");
        if (code === "0") {
          await finalizePurchase(supabase, tx.id, queryData.MpesaReceiptNumber || tx.mpesa_receipt || null);
          const { data: fresh } = await supabase.from("transactions").select("mpesa_receipt").eq("id", tx.id).single();
          return json({ success: true, status: "verified", receipt: fresh?.mpesa_receipt });
        }
        // Non-empty ResultCode other than 0 means Safaricom has a final failure (e.g. 1032 cancelled).
        if (code && !queryData.errorCode) {
          await failPurchase(supabase, tx.id, queryData.ResultDesc || "cancelled");
          return json({ success: false, status: "failed", message: queryData.ResultDesc });
        }
        return json({ success: false, status: "pending" });
      }

      return new Response(
        JSON.stringify({ success: true, status: tx.verification_status, transaction: tx }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── M-Pesa Callback Processing ──
    // Verify the callback came from our Safaricom integration via a shared secret token
    // appended to the registered CallBackURL (e.g. ...?token=<MPESA_CALLBACK_TOKEN>).
    const expectedToken = Deno.env.get("MPESA_CALLBACK_TOKEN");
    const cbUrl = new URL(req.url);
    const provided = cbUrl.searchParams.get("token") || req.headers.get("x-mpesa-callback-token");
    if (!expectedToken || provided !== expectedToken) {
      console.error("Rejected unauthenticated M-Pesa callback");
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Only process callbacks for transactions that haven't already been verified
    if (tx.verification_status === "verified" || tx.status === "completed") {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (resultCode === 0) {
      const items = callback.CallbackMetadata?.Item || [];
      // deno-lint-ignore no-explicit-any
      const receipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || null;
      await finalizePurchase(supabase, tx.id, receipt ? String(receipt) : null);
    } else {
      await failPurchase(supabase, tx.id, callback.ResultDesc || "cancelled");
    }

    // M-Pesa expects this exact response
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("verify-payment error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
