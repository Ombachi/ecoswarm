import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Loader2, Check, ClipboardList } from 'lucide-react';
import { calculateSmartBuy, ECOPOINTS_PER_KES, pointsToKes } from '@/lib/ecoPointsConversion';
import { toast } from 'sonner';
import { Confetti } from '@/components/common/Confetti';
import { LazyImage } from '@/components/common/LazyImage';
import { useNavigate } from 'react-router-dom';

interface MerchProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
}

export function EcoMerchScreen() {
  const { user, addPoints, showNotification } = useApp();
  const navigate = useNavigate();
  usePageMeta('EcoMerch', 'Shop sustainable branded merchandise — swarm kits, seed-bomb apparel, and eco gear.');
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<MerchProduct | null>(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('merch_products').select('*').eq('is_active', true).order('created_at');
    setProducts((data as MerchProduct[]) || []);
    setIsLoading(false);
  };

  const handleCheckout = async () => {
    if (!checkoutProduct || !user || !phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    setBuyingId(checkoutProduct.id);
    try {
      // Atomic stock decrement
      const { data: stockOk, error: stockErr } = await supabase.rpc('decrement_merch_stock', {
        p_merch_id: checkoutProduct.id,
        p_quantity: 1,
      });
      if (stockErr) throw stockErr;
      if (!stockOk) {
        toast.error('Sorry, this item is out of stock');
        return;
      }

      const breakdown = calculateSmartBuy(checkoutProduct.price, user.ecoPoints);
      const pointsToUse = breakdown.pointsUsed;
      const { error } = await supabase.from('merch_orders').insert({
        user_id: user.id,
        merch_id: checkoutProduct.id,
        quantity: 1,
        total_price: checkoutProduct.price,
        points_used: pointsToUse,
        shipping_address: address,
        phone,
      } as any);
      if (error) throw error;
      setShowConfetti(true);
      addPoints(25);
      showNotification('Order placed! 🎉', 25);
      toast.success('Order placed successfully!');
      setCheckoutProduct(null);
      setPhone('');
      setAddress('');
      await loadProducts(); // refresh stock
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      toast.error('Failed to place order');
    } finally {
      setBuyingId(null);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {showConfetti && <Confetti />}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary flex-shrink-0" /> EcoMerch
            </h1>
            <p className="text-xs text-muted-foreground">Sustainable swag for eco-warriors</p>
          </div>
          <button
            onClick={() => navigate('/purchases')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80"
          >
            <ClipboardList className="w-4 h-4" /> My Orders
          </button>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-24">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No merch available yet. Check back soon!</p>
          </div>
        ) : products.map((product) => (
          <div key={product.id} className="eco-card overflow-hidden flex flex-col">
            {product.image_url ? (
              <LazyImage src={product.image_url} alt={product.name} className="w-full h-40 -mx-4 -mt-4 mb-3" style={{ width: 'calc(100% + 2rem)' }} />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 -mx-4 -mt-4 mb-3 flex items-center justify-center" style={{ width: 'calc(100% + 2rem)' }}>
                <Package className="w-12 h-12 text-primary/30" />
              </div>
            )}
            <h3 className="font-bold text-foreground text-sm mb-1">{product.name}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
            <span className="eco-badge text-[10px] mb-2 self-start">{product.category}</span>
            <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
              <span className="font-bold text-foreground">KSh {product.price.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">{product.stock} left</span>
            </div>
            <button
              onClick={() => setCheckoutProduct(product)}
              disabled={product.stock <= 0}
              className="mt-2 w-full py-2 rounded-xl eco-gradient-bg text-white text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" /> {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center" onClick={() => !buyingId && setCheckoutProduct(null)}>
          <div className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{checkoutProduct.name}</h3>
              <p className="text-sm text-muted-foreground">KSh {checkoutProduct.price.toLocaleString()}</p>
            </div>
            {user && (() => {
              const breakdown = calculateSmartBuy(checkoutProduct.price, user.ecoPoints);
              return (
                <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Your EcoPoints</span><span className="font-semibold text-primary">{user.ecoPoints.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Worth in KES</span><span className="font-semibold">KSh {pointsToKes(user.ecoPoints).toLocaleString()}</span></div>
                  <div className="border-t border-border my-1" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Points to redeem</span><span className="font-semibold text-primary">{breakdown.pointsUsed.toLocaleString()} pts</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Points value</span><span className="font-semibold">- KSh {breakdown.pointsKesValue.toLocaleString()}</span></div>
                  {breakdown.cashRemaining > 0 && (
                    <div className="flex justify-between text-foreground font-bold"><span>Cash to pay</span><span>KSh {breakdown.cashRemaining.toLocaleString()}</span></div>
                  )}
                  {breakdown.canFullRedeem && (
                    <p className="text-[10px] text-primary font-medium mt-1">✨ You can fully redeem with EcoPoints!</p>
                  )}
                  <p className="text-[9px] text-muted-foreground mt-1">Rate: {ECOPOINTS_PER_KES} EcoPoints = KSh 1</p>
                </div>
              );
            })()}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Phone (M-Pesa)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" className="eco-input py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Shipping Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your delivery address..." className="eco-input py-2.5 text-sm min-h-[60px]" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCheckoutProduct(null)} disabled={!!buyingId} className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium text-sm">Cancel</button>
              <button onClick={handleCheckout} disabled={!!buyingId} className="flex-1 py-3 rounded-xl eco-gradient-bg text-white font-bold text-sm flex items-center justify-center gap-2">
                {buyingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
