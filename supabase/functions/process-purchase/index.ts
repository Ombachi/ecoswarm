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

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const { productId, pointsToUse, phoneNumber } = await req.json();

    // Input validation
    if (!productId || typeof productId !== "string") throw new Error("Invalid product ID");
    if (typeof pointsToUse !== "number" || pointsToUse < 0) throw new Error("Invalid points value");
    if (phoneNumber && typeof phoneNumber !== "string") throw new Error("Invalid phone number");
    if (phoneNumber && !/^(0[17]\d{8}|254[17]\d{8})$/.test(phoneNumber.replace(/\s/g, ""))) {
      throw new Error("Invalid M-Pesa phone number format");
    }

    // Fetch product
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
    if (prodErr || !product) throw new Error("Product not found");

    // ── FRAUD CHECK 1: Self-buy prevention ──
    if (product.user_id === user.id) {
      throw new Error("You cannot purchase your own product");
    }

    // Fetch buyer profile
    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("eco_points, name")
      .eq("user_id", user.id)
      .single();
    if (!buyerProfile) throw new Error("Profile not found");

    // ── FRAUD CHECK 2: Rate limiting (max 5 purchases per hour) ──
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: recentPurchases } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", user.id)
      .gte("created_at", oneHourAgo);
    if ((recentPurchases || 0) >= 5) {
      throw new Error("Too many purchases. Please try again later.");
    }

    // ── FRAUD CHECK 3: Duplicate transaction detection ──
    const fiveMinAgo = new Date(Date.now() - 300000).toISOString();
    const { count: duplicateCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", user.id)
      .eq("product_id", productId)
      .gte("created_at", fiveMinAgo);
    if ((duplicateCount || 0) > 0) {
      throw new Error("Duplicate purchase detected. Please wait before buying this item again.");
    }

    const totalPrice = Number(product.price);
    const availablePoints = buyerProfile.eco_points || 0;
    const actualPointsUsed = Math.min(pointsToUse, availablePoints, totalPrice);
    const cashRemaining = totalPrice - actualPointsUsed;

    let paymentMethod = "ecopoints";
    let mpesaReceipt: string | null = null;
    let mpesaCheckoutId: string | null = null;
    let status = "completed";
    let verificationStatus = "verified"; // Full EcoPoints = auto-verified

    if (cashRemaining > 0) {
      if (!phoneNumber) throw new Error("Phone number required for M-Pesa payment");

      // ── M-Pesa STK Push ──
      // Check if real Daraja credentials exist
      const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
      const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
      const shortCode = Deno.env.get("MPESA_SHORTCODE") || "174379";
      const passkey = Deno.env.get("MPESA_PASSKEY") || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL") || `${supabaseUrl}/functions/v1/verify-payment`;

      if (consumerKey && consumerSecret) {
        // ── REAL DARAJA INTEGRATION ──
        const isProduction = Deno.env.get("MPESA_ENVIRONMENT") === "production";
        const baseUrl = isProduction
          ? "https://api.safaricom.co.ke"
          : "https://sandbox.safaricom.co.ke";

        // Step 1: Get OAuth token
        const authStr = btoa(`${consumerKey}:${consumerSecret}`);
        const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
          headers: { Authorization: `Basic ${authStr}` },
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error("M-Pesa authentication failed");

        // Step 2: STK Push
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
            Amount: Math.ceil(cashRemaining),
            PartyA: normalizedPhone,
            PartyB: shortCode,
            PhoneNumber: normalizedPhone,
            CallBackURL: callbackUrl,
            AccountReference: `ECO-${productId.slice(0, 8).toUpperCase()}`,
            TransactionDesc: `EcoMarket: ${product.product_name}`.slice(0, 50),
          }),
        });

        const stkData = await stkRes.json();
        if (stkData.ResponseCode !== "0") {
          throw new Error(stkData.errorMessage || stkData.CustomerMessage || "M-Pesa STK Push failed");
        }

        mpesaCheckoutId = stkData.CheckoutRequestID;
        paymentMethod = "ecopoints_mpesa";
        status = "pending_payment"; // Will be completed by callback
        verificationStatus = "pending";
      } else {
        // ── PLACEHOLDER (no Daraja keys yet) ──
        paymentMethod = "ecopoints_mpesa";
        mpesaReceipt = `SIM_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        status = "completed";
        verificationStatus = "simulated";
      }
    }

    // Deduct EcoPoints from buyer
    const newPoints = availablePoints - actualPointsUsed;
    const bonusPoints = 50;

    await supabase
      .from("profiles")
      .update({ eco_points: newPoints + bonusPoints })
      .eq("user_id", user.id);

    // Create transaction record
    const { data: transaction, error: txErr } = await supabase
      .from("transactions")
      .insert({
        buyer_id: user.id,
        seller_id: product.user_id,
        product_id: productId,
        product_name: product.product_name,
        points_used: actualPointsUsed,
        cash_paid: cashRemaining,
        total_price: totalPrice,
        bonus_points: bonusPoints,
        status,
        payment_method: paymentMethod,
        mpesa_receipt: mpesaReceipt,
        mpesa_checkout_id: mpesaCheckoutId,
        verification_status: verificationStatus,
        verified_at: verificationStatus === "verified" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (txErr) throw txErr;

    // Notify seller
    await supabase.from("notifications").insert({
      user_id: product.user_id,
      type: "sale",
      title: "🎉 New Sale!",
      message: `${buyerProfile.name} purchased "${product.product_name}" for ${actualPointsUsed > 0 ? `${actualPointsUsed} EcoPoints` : ""}${cashRemaining > 0 ? `${actualPointsUsed > 0 ? " + " : ""}KSh ${cashRemaining}` : ""}`,
      reference_id: transaction.id,
    });

    // Award CO2 savings
    await supabase.rpc("award_co2", { p_user_id: user.id, p_action_type: "ecomarket_purchase" });
    await supabase.rpc("award_co2", { p_user_id: product.user_id, p_action_type: "ecomarket_sale" });

    // Create auto chat thread
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: product.user_id,
      product_id: productId,
      content: `🎉 I just purchased "${product.product_name}"! Let's arrange delivery.`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        newPoints: newPoints + bonusPoints,
        bonusPoints,
        pointsUsed: actualPointsUsed,
        cashPaid: cashRemaining,
        verificationStatus,
        isPending: status === "pending_payment",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
