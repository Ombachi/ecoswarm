import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Package, ShoppingCart, Loader2, Check, ClipboardList, X,
  ChevronLeft, ChevronRight, Minus, Plus, Truck, Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Confetti } from '@/components/common/Confetti';
import { LazyImage } from '@/components/common/LazyImage';
import { useNavigate } from 'react-router-dom';
import { ProductGridSkeleton, EmptyState } from '@/components/common/Skeletons';

interface MerchProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
}

type CheckoutStep = 'cart' | 'shipping' | 'payment';
const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'cart', label: 'Cart' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
];

export function EcoMerchScreen() {
  const { user } = useApp();
  const navigate = useNavigate();
  usePageMeta('EcoMerch', 'Shop sustainable branded merchandise — swarm kits, seed-bomb apparel, and eco gear.');
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Checkout state
  const [checkoutProduct, setCheckoutProduct] = useState<MerchProduct | null>(null);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('merch_products').select('*').eq('is_active', true).order('created_at');
    setProducts((data as MerchProduct[]) || []);
    setIsLoading(false);
  };

  const openCheckout = (product: MerchProduct) => {
    setCheckoutProduct(product);
    setStep('cart');
    setQuantity(1);
    setFullName(user?.name || '');
    setPhone('');
    setAddress('');
    setCity('');
  };

  const closeCheckout = () => {
    if (isPlacing) return;
    setCheckoutProduct(null);
  };

  const total = checkoutProduct ? checkoutProduct.price * quantity : 0;

  const goNext = () => {
    if (step === 'cart') {
      setStep('shipping');
      return;
    }
    if (step === 'shipping') {
      if (!fullName.trim() || !address.trim() || !city.trim()) {
        toast.error('Please fill in your name, address and town/city');
        return;
      }
      setStep('payment');
    }
  };

  const goBack = () => {
    if (step === 'payment') setStep('shipping');
    else if (step === 'shipping') setStep('cart');
    else closeCheckout();
  };

  const handlePay = async () => {
    if (!checkoutProduct || !user) return;
    const cleaned = phone.replace(/\s+/g, '');
    if (!/^(?:\+?254|0)7\d{8}$|^(?:\+?254|0)1\d{8}$/.test(cleaned)) {
      toast.error('Enter a valid M-Pesa number, e.g. 0712345678');
      return;
    }

    setIsPlacing(true);
    try {
      const { data: stockOk, error: stockErr } = await supabase.rpc('decrement_merch_stock', {
        p_merch_id: checkoutProduct.id,
        p_quantity: quantity,
      });
      if (stockErr) throw stockErr;
      if (!stockOk) {
        toast.error('Sorry, this item just went out of stock');
        return;
      }

      const { error } = await supabase.from('merch_orders').insert({
        user_id: user.id,
        merch_id: checkoutProduct.id,
        quantity,
        total_price: total,
        points_used: 0,
        shipping_address: `${fullName}, ${address}, ${city}`,
        phone: cleaned,
      } as any);
      if (error) throw error;

      setShowConfetti(true);
      toast.success('Order placed! Check your phone to complete the M-Pesa payment.');
      setCheckoutProduct(null);
      await loadProducts();
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      toast.error('Failed to place order');
    } finally {
      setIsPlacing(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

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

      <div className="p-4 max-w-6xl mx-auto w-full pb-24">
        {isLoading ? (
          <ProductGridSkeleton count={8} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-7 h-7" />}
            title="No merch available yet"
            description="Swarm kits, seed-bomb apparel and refillable bottles are on their way. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
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
                  onClick={() => openCheckout(product)}
                  disabled={product.stock <= 0}
                  className="mt-2 w-full py-2 rounded-xl eco-gradient-bg text-white text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" /> {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout — mobile sheet / desktop modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center" onClick={closeCheckout}>
          <div
            className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step header */}
            <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <button onClick={goBack} disabled={isPlacing} className="p-2 -ml-2 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50" aria-label="Back">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-bold text-foreground">Checkout</h2>
                <button onClick={closeCheckout} disabled={isPlacing} className="p-2 -mr-2 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50" aria-label="Close checkout">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                          i < stepIndex ? 'eco-gradient-bg text-white' : i === stepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </span>
                      <span className={`text-[11px] font-medium truncate ${i === stepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />}
                  </li>
                ))}
              </ol>
            </div>

            {/* Step body (scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {step === 'cart' && (
                <>
                  <div className="flex gap-3">
                    {checkoutProduct.image_url ? (
                      <LazyImage src={checkoutProduct.image_url} alt={checkoutProduct.name} className="w-20 h-20 rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm">{checkoutProduct.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{checkoutProduct.description}</p>
                      <p className="text-sm font-semibold text-foreground mt-1">KSh {checkoutProduct.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                    <span className="text-sm font-medium text-foreground">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground disabled:opacity-40"
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-foreground">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(checkoutProduct.stock, q + 1))}
                        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground disabled:opacity-40"
                        disabled={quantity >= checkoutProduct.stock}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{checkoutProduct.stock} in stock</p>
                </>
              )}

              {step === 'shipping' && (
                <>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Truck className="w-4 h-4 text-primary" /> Delivery details
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="merch-name">Full name</label>
                    <input id="merch-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Wanjiku" className="eco-input py-3 text-base" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="merch-address">Delivery address</label>
                    <textarea id="merch-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building, pickup point..." className="eco-input py-3 text-base min-h-[80px]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="merch-city">Town / City</label>
                    <input id="merch-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi" className="eco-input py-3 text-base" />
                  </div>
                </>
              )}

              {step === 'payment' && (
                <>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Smartphone className="w-4 h-4 text-primary" /> Pay with M-Pesa
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="merch-phone">M-Pesa number</label>
                    <input
                      id="merch-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678"
                      className="eco-input py-3 text-base"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">You'll get an STK push prompt on this number.</p>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">{checkoutProduct.name} × {quantity}</span><span className="text-foreground">KSh {total.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="text-foreground">Arranged on confirmation</span></div>
                    <div className="border-t border-border my-1" />
                    <div className="flex justify-between font-bold text-foreground"><span>Total to pay</span><span>KSh {total.toLocaleString()}</span></div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-0.5">Shipping to</p>
                    {fullName}, {address}, {city}
                  </div>
                </>
              )}
            </div>

            {/* Sticky footer */}
            <div className="flex-shrink-0 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3 bg-card rounded-b-2xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-foreground">KSh {total.toLocaleString()}</span>
              </div>
              {step === 'payment' ? (
                <button
                  onClick={handlePay}
                  disabled={isPlacing}
                  className="w-full py-3.5 rounded-xl eco-gradient-bg text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPlacing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Pay KSh {total.toLocaleString()}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="w-full py-3.5 rounded-xl eco-gradient-bg text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  {step === 'cart' ? 'Continue to shipping' : 'Continue to payment'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
