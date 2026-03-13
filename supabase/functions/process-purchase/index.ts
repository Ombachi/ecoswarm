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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const { productId, pointsToUse, phoneNumber } = await req.json();

    // Fetch product
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
    if (prodErr || !product) throw new Error("Product not found");

    // Fetch buyer profile
    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("eco_points, name")
      .eq("user_id", user.id)
      .single();
    if (!buyerProfile) throw new Error("Profile not found");

    const totalPrice = Number(product.price);
    const availablePoints = buyerProfile.eco_points || 0;
    const actualPointsUsed = Math.min(pointsToUse, availablePoints, totalPrice);
    const cashRemaining = totalPrice - actualPointsUsed;

    let paymentMethod = "ecopoints";
    let mpesaReceipt: string | null = null;
    let status = "completed";

    if (cashRemaining > 0) {
      // M-Pesa STK Push placeholder
      // In production, integrate with Daraja API here
      paymentMethod = "ecopoints_mpesa";
      mpesaReceipt = `MPESA_${Date.now()}_PLACEHOLDER`;
      // For now, we simulate successful payment
      status = "completed";
    }

    // Deduct EcoPoints from buyer
    const newPoints = availablePoints - actualPointsUsed;
    await supabase
      .from("profiles")
      .update({ eco_points: newPoints })
      .eq("user_id", user.id);

    // Award bonus points (50 for any purchase)
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
