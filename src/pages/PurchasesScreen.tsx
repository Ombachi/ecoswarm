import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductChat } from '@/components/ecomarket/ProductChat';
import { toast } from 'sonner';
import {
  Loader2, ShoppingCart, Leaf, MessageCircle, Star, AlertTriangle, Shield, ShieldCheck,
} from 'lucide-react';

interface Transaction {
  id: string;
  product_id: string;
  product_name: string;
  points_used: number;
  cash_paid: number;
  total_price: number;
  bonus_points: number;
  status: string;
  created_at: string;
  seller_id: string;
  verification_status?: string;
  mpesa_receipt?: string;
}

export function PurchasesScreen() {
  const { user } = useApp();
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingTx, setRatingTx] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [disputeTx, setDisputeTx] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [chatProduct, setChatProduct] = useState<{ id: string; name: string; sellerId: string; sellerName: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setIsLoading(true);
      const [txRes, ratingsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('buyer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('seller_ratings').select('transaction_id, rating').eq('buyer_id', user.id),
      ]);
      if (!txRes.error && txRes.data) setPurchases(txRes.data as any);
      if (!ratingsRes.error && ratingsRes.data) {
        const map: Record<string, number> = {};
        ratingsRes.data.forEach((r: any) => { map[r.transaction_id] = r.rating; });
        setRatings(map);
      }
      setIsLoading(false);
    })();
  }, [user]);

  const submitRating = async (txId: string) => {
    if (!user || ratingValue === 0) return;
    const tx = purchases.find(p => p.id === txId);
    if (!tx) return;
    const { error } = await supabase.from('seller_ratings').insert({
      transaction_id: txId, buyer_id: user.id, seller_id: tx.seller_id, rating: ratingValue, review: reviewText || null,
    } as any);
    if (!error) {
      setRatings(prev => ({ ...prev, [txId]: ratingValue }));
      setRatingTx(null); setRatingValue(0); setReviewText('');
      toast.success('Rating submitted! ⭐');
    } else toast.error('Failed to submit rating');
  };

  const submitDispute = async (txId: string) => {
    if (!user || !disputeReason.trim()) return;
    const { error } = await supabase.from('transaction_disputes').insert({
      transaction_id: txId, raised_by: user.id, reason: disputeReason.trim(),
    } as any);
    if (!error) {
      setDisputeTx(null); setDisputeReason('');
      toast.success('Dispute raised. We will review it shortly.');
    } else toast.error('Failed to raise dispute');
  };

  const getVerificationBadge = (tx: Transaction) => {
    const vs = tx.verification_status || 'unverified';
    if (vs === 'verified') return { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Verified', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    if (vs === 'pending') return { icon: <Shield className="w-3.5 h-3.5" />, label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    if (vs === 'failed') return { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Failed', className: 'bg-destructive/10 text-destructive' };
    return { icon: <Shield className="w-3.5 h-3.5" />, label: 'Unverified', className: 'bg-muted text-muted-foreground' };
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" /> My Purchases
        </h1>
        <p className="text-xs text-muted-foreground">Track your orders and rate sellers</p>
      </div>

      {purchases.length === 0 ? (
        <div className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-semibold">No purchases yet</p>
          <p className="text-sm text-muted-foreground mt-1">Buy eco-products with your EcoPoints!</p>
        </div>
      ) : (
        <div className="p-4 space-y-3 pb-24">
          {purchases.map((tx) => {
            const vBadge = getVerificationBadge(tx);
            const hasRated = ratings[tx.id] !== undefined;
            return (
              <div key={tx.id} className="eco-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{tx.product_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${vBadge.className}`}>
                      {vBadge.icon} {vBadge.label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : tx.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {tx.status === 'completed' ? '✓ Done' : tx.status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {tx.points_used > 0 && <span className="flex items-center gap-1 text-primary font-medium"><Leaf className="w-3.5 h-3.5" /> {tx.points_used} pts</span>}
                  {Number(tx.cash_paid) > 0 && <span className="text-muted-foreground">+ KSh {Number(tx.cash_paid).toLocaleString()}</span>}
                  {tx.bonus_points > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{tx.bonus_points} bonus</span>}
                </div>
                {tx.mpesa_receipt && <p className="text-[10px] text-muted-foreground mt-1 font-mono">Receipt: {tx.mpesa_receipt}</p>}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                  {tx.product_id && (
                    <button onClick={() => setChatProduct({ id: tx.product_id, name: tx.product_name, sellerId: tx.seller_id, sellerName: '' })} className="text-xs text-primary font-medium flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                    </button>
                  )}
                  {tx.status === 'completed' && !hasRated && (
                    <button onClick={() => { setRatingTx(tx.id); setRatingValue(0); setReviewText(''); }} className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 ml-auto">
                      <Star className="w-3.5 h-3.5" /> Rate
                    </button>
                  )}
                  {hasRated && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-0.5 ml-auto">
                      {Array.from({ length: ratings[tx.id] }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </span>
                  )}
                  {tx.status === 'completed' && (
                    <button onClick={() => { setDisputeTx(tx.id); setDisputeReason(''); }} className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                    </button>
                  )}
                </div>
                {ratingTx === tx.id && (
                  <div className="mt-3 p-3 rounded-xl bg-muted/50 space-y-2.5 animate-slide-up">
                    <p className="text-xs font-semibold text-foreground">Rate this seller</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => setRatingValue(v)} className="p-1">
                          <Star className={`w-6 h-6 transition-colors ${v <= ratingValue ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Optional review..." className="eco-input text-xs py-2 min-h-[60px]" maxLength={500} />
                    <div className="flex gap-2">
                      <button onClick={() => setRatingTx(null)} className="flex-1 text-xs py-2 rounded-lg border border-border text-foreground font-medium">Cancel</button>
                      <button onClick={() => submitRating(tx.id)} disabled={ratingValue === 0} className="flex-1 text-xs py-2 rounded-lg eco-gradient-bg text-white font-bold disabled:opacity-50">Submit</button>
                    </div>
                  </div>
                )}
                {disputeTx === tx.id && (
                  <div className="mt-3 p-3 rounded-xl bg-destructive/5 space-y-2.5 animate-slide-up">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Raise a Dispute</p>
                    <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Describe the issue..." className="eco-input text-xs py-2 min-h-[60px]" maxLength={1000} />
                    <div className="flex gap-2">
                      <button onClick={() => setDisputeTx(null)} className="flex-1 text-xs py-2 rounded-lg border border-border text-foreground font-medium">Cancel</button>
                      <button onClick={() => submitDispute(tx.id)} disabled={!disputeReason.trim()} className="flex-1 text-xs py-2 rounded-lg bg-destructive text-destructive-foreground font-bold disabled:opacity-50">Submit Dispute</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {chatProduct && (
        <ProductChat productId={chatProduct.id} productName={chatProduct.name} sellerId={chatProduct.sellerId} sellerName={chatProduct.sellerName} onClose={() => setChatProduct(null)} />
      )}
    </AppLayout>
  );
}
