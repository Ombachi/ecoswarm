// Runs only once a payment is confirmed by Safaricom (ResultCode 0).
// Marks the order completed and triggers redemptions, commission, notifications,
// CO2 awards and the admin delivery thread. Safe to call more than once.
// deno-lint-ignore no-explicit-any
export async function finalizePurchase(supabase: any, txId: string, receipt: string | null) {
  const { data: updated } = await supabase
    .from("transactions")
    .update({
      status: "completed",
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      mpesa_receipt: receipt,
    })
    .eq("id", txId)
    .neq("status", "completed")
    .select()
    .maybeSingle();
  if (!updated) return; // already finalized

  const tx = updated;
  const { data: buyer } = await supabase.from("profiles").select("name").eq("user_id", tx.buyer_id).maybeSingle();
  const buyerName = buyer?.name || "A customer";

  if (tx.coupon_id) {
    await supabase.from("coupon_redemptions").insert({
      coupon_id: tx.coupon_id, user_id: tx.buyer_id, product_id: tx.product_id, discount_amount: tx.discount_amount,
    });
    const { data: c } = await supabase.from("coupons").select("times_used").eq("id", tx.coupon_id).single();
    await supabase.from("coupons").update({ times_used: (c?.times_used || 0) + 1 }).eq("id", tx.coupon_id);
  }

  const rate = 0.10;
  await supabase.from("platform_commissions").insert({
    transaction_id: tx.id, seller_id: tx.seller_id, buyer_id: tx.buyer_id,
    sale_amount: tx.total_price, commission_amount: Math.round(Number(tx.total_price) * rate * 100) / 100, commission_rate: rate,
  });

  await supabase.from("notifications").insert([
    {
      user_id: tx.seller_id, type: "sale", title: "🎉 New Sale!",
      message: `${buyerName} paid KSh ${Number(tx.cash_paid).toLocaleString()} for "${tx.product_name}". Receipt: ${receipt || "n/a"}`,
      reference_id: tx.id,
    },
    {
      user_id: tx.buyer_id, type: "payment", title: "✅ Payment Verified!",
      message: `Your M-Pesa payment of KSh ${Number(tx.cash_paid).toLocaleString()} for "${tx.product_name}" has been confirmed.`,
      reference_id: tx.id,
    },
  ]);

  await supabase.rpc("award_co2", { p_user_id: tx.buyer_id, p_action_type: "ecomarket_purchase" });

  await supabase.from("messages").insert({
    sender_id: tx.buyer_id, receiver_id: tx.seller_id, product_id: tx.product_id,
    content: `🎉 I just purchased "${tx.product_name}" (M-Pesa receipt ${receipt || "pending"}). Let's arrange delivery.`,
  });
}

// deno-lint-ignore no-explicit-any
export async function failPurchase(supabase: any, txId: string, reason: string) {
  const { data } = await supabase
    .from("transactions")
    .update({ status: "failed", verification_status: "failed" })
    .eq("id", txId)
    .eq("status", "pending_payment")
    .select()
    .maybeSingle();
  if (data) {
    await supabase.from("notifications").insert({
      user_id: data.buyer_id, type: "payment", title: "Payment not completed",
      message: `Your M-Pesa payment for "${data.product_name}" was not completed (${reason}). You can try again anytime.`,
      reference_id: data.id,
    });
  }
}
