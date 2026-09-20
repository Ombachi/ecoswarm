import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { cacheProducts, getCachedProducts, getCachedProductsTimestamp } from '@/lib/offlineDb';
import { CreateProductModal } from '@/components/ecomarket/CreateProductModal';
import { ProductChat } from '@/components/ecomarket/ProductChat';
import { AdvancedMediaViewer } from '@/components/common/AdvancedMediaViewer';
import { usePurchase } from '@/hooks/usePurchase';
import { Confetti } from '@/components/common/Confetti';
import { toast } from 'sonner';
import {
  Search, Plus, Phone, Loader2, X, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, MessageCircle,
  Leaf, Check, Sparkles, Share2, ShieldCheck, ArrowUpDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { calculateSmartBuy, formatPointsWithKes } from '@/lib/ecoPointsConversion';
import { ProductGridSkeleton, EmptyState } from '@/components/common/Skeletons';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name';

const sortOptions: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'price_asc', label: 'Price: low to high' },
  { id: 'price_desc', label: 'Price: high to low' },
  { id: 'name', label: 'Name: A to Z' },
];

const ecoBadgeColors: Record<string, string> = {
  'Carbon Neutral': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Plastic Free': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'Made in Kenya': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Fair Trade': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  '2-Year Warranty': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Organic': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  'Biodegradable': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Recycled Materials': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Solar Powered': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Water Efficient': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

interface Product {
  id: string;
  user_id: string;
  org_name: string;
  product_name: string;
  category: string;
  description: string;
  media_url?: string;
  media_type?: string;
  media_urls?: { url: string; type: string }[];
  badges: string[];
  price: number;
  contact_phone: string;
  location?: string;
  created_at: string;
}

const categoryFilters = [
  { id: '', label: 'All', emoji: '🛒' },
  { id: 'Water', label: 'Water', emoji: '💧' },
  { id: 'Energy', label: 'Energy', emoji: '⚡' },
  { id: 'Agriculture', label: 'Agri', emoji: '🌾' },
  { id: 'Waste', label: 'Waste', emoji: '♻️' },
  { id: 'Housing', label: 'Housing', emoji: '🏡' },
  { id: 'Fashion', label: 'Fashion', emoji: '👕' },
  { id: 'Food', label: 'Food', emoji: '🥗' },
  { id: 'Transport', label: 'Transport', emoji: '🚲' },
];

export function EcoMarketScreen() {
  const { user, addPoints, showNotification, updateStats, isAdmin } = useApp();
  const navigate = useNavigate();
  usePageMeta('EcoMarket', 'Browse and buy eco-friendly products and services from verified Kenyan green businesses.');
  const { processPurchase, isProcessing } = usePurchase();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);
  const orgName = user?.name || 'EcoSwarm';
  const [trackedViews, setTrackedViews] = useState<Set<string>>(new Set());
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set());
  const [mediaIndices, setMediaIndices] = useState<Record<string, number>>({});
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    rect: DOMRect | null;
  } | null>(null);
  const [chatProduct, setChatProduct] = useState<{ id: string; name: string; sellerId: string; sellerName: string } | null>(null);
  const [, setHasMore] = useState(true);
  const [, setLoadingMore] = useState(false);
  const [productCursor, setProductCursor] = useState<string | null>(null);
  const PRODUCT_PAGE_SIZE = 24;

  // Buy flow state
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ bonusPoints: number; pointsUsed: number; cashPaid: number; productName: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');




  const trackInteraction = async (productId: string, type: 'view' | 'click' | 'save' | 'share') => {
    if (!user) return;
    if (type === 'view') {
      if (trackedViews.has(productId)) return;
      setTrackedViews(prev => new Set(prev).add(productId));
    }
    try {
      await supabase.from('product_interactions').insert({
        product_id: productId,
        user_id: user.id,
        interaction_type: type,
        location: user.location || null,
      } as any);
    } catch {}
  };

  useEffect(() => {
    if (!user || products.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const productId = entry.target.getAttribute('data-product-id');
            if (productId) trackInteraction(productId, 'view');
          }
        });
      },
      { threshold: 0.5 }
    );
    const cards = document.querySelectorAll('[data-product-id]');
    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [user, products, trackedViews]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('product_interactions')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('interaction_type', 'save')
      .then(({ data }) => {
        if (data) setSavedProducts(new Set(data.map(d => d.product_id)));
      });
  }, [user]);

  const toggleSave = async (productId: string) => {
    if (!user) return;
    if (savedProducts.has(productId)) {
      toast.info('Already saved!');
      return;
    }
    setSavedProducts(prev => new Set(prev).add(productId));
    await trackInteraction(productId, 'save');
    toast.success('🔖 Product saved!');
  };

  const openLightbox = (url: string, type: 'image' | 'video', event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setLightboxMedia({ url, type, rect });
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, user]);

  const loadProducts = async (loadMore = false) => {
    if (!loadMore) { setIsLoading(true); setProductCursor(null); setHasMore(true); }
    else { setLoadingMore(true); }
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PRODUCT_PAGE_SIZE);

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      if (loadMore && productCursor) {
        query = query.lt('created_at', productCursor);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = data || [];
      if (rows.length < PRODUCT_PAGE_SIZE) setHasMore(false);
      if (rows.length > 0) setProductCursor(rows[rows.length - 1].created_at);

      const parsed = rows.map((p: any) => ({
        ...p,
        badges: p.badges || [],
        media_urls: Array.isArray(p.media_urls) ? p.media_urls : [],
      })) as Product[];

      if (loadMore) {
        setProducts(prev => [...prev, ...parsed]);
      } else {
        setProducts(parsed);
        // Cache for offline browsing
        if (!categoryFilter) {
          cacheProducts(parsed.slice(0, 50).map(p => ({
            id: p.id, org_name: p.org_name, product_name: p.product_name,
            category: p.category, description: p.description, price: p.price,
            media_url: p.media_url, badges: p.badges,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading products:', (error as Error)?.message || 'An error occurred');
      // Try offline cache
      if (!navigator.onLine) {
        const ts = await getCachedProductsTimestamp();
        if (Date.now() - ts < 3600000) {
          const cached = await getCachedProducts();
          if (cached.length > 0) {
            setProducts(cached.map(p => ({ ...p, created_at: '', contact_phone: '', media_urls: [] } as any)));
            toast.info('Showing cached products (offline)');
            return;
          }
        }
      }
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Server-side full-text search
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const tsQuery = searchQuery.trim().split(/\s+/).map(w => `${w}:*`).join(' & ');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .textSearch('product_name', tsQuery, { type: 'websearch', config: 'english' })
          .limit(50);
        
        if (error) {
          // Fallback: use ilike if textSearch fails
          const { data: fallback } = await supabase
            .from('products')
            .select('*')
            .or(`product_name.ilike.%${searchQuery}%,org_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
            .limit(50);
          setSearchResults((fallback || []).map((p: any) => ({ ...p, badges: p.badges || [], media_urls: Array.isArray(p.media_urls) ? p.media_urls : [] })) as Product[]);
        } else {
          setSearchResults((data || []).map((p: any) => ({ ...p, badges: p.badges || [], media_urls: Array.isArray(p.media_urls) ? p.media_urls : [] })) as Product[]);
        }
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const baseProducts = searchResults !== null ? searchResults : products;
  // Search results are not category-scoped server-side, so scope them here.
  const scopedProducts = searchResults !== null && categoryFilter
    ? baseProducts.filter((p) => p.category === categoryFilter)
    : baseProducts;

  const filteredProducts = [...scopedProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return (a.price || 0) - (b.price || 0);
      case 'price_desc': return (b.price || 0) - (a.price || 0);
      case 'name': return (a.product_name || '').localeCompare(b.product_name || '');
      default: return (b.created_at || '').localeCompare(a.created_at || '');
    }
  });

  const handleProductCreated = async (productData: {
    orgName: string;
    productName: string;
    category: string;
    description: string;
    badges: string[];
    price: number;
    contactPhone: string;
    mediaUrl?: string;
    mediaType?: string;
    mediaUrls?: { url: string; type: string }[];
  }) => {
    if (!user) {
      toast.error('Please log in to list a product');
      return;
    }

    try {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          org_name: productData.orgName,
          product_name: productData.productName,
          category: productData.category,
          description: productData.description,
          media_url: productData.mediaUrl || null,
          media_type: productData.mediaType || null,
          media_urls: productData.mediaUrls || [],
          badges: productData.badges,
          price: productData.price,
          contact_phone: productData.contactPhone,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setProducts([{ ...newProduct, badges: newProduct.badges || [], media_urls: Array.isArray(newProduct.media_urls) ? newProduct.media_urls as any : [] } as Product, ...products]);

      // Email subscribed users about the new EcoMarket listing (fire-and-forget).
      supabase.functions.invoke('notify-new-content', {
        body: {
          type: 'product',
          title: productData.productName,
          description: `${productData.orgName} — ${productData.description}`.slice(0, 400),
          image_url: productData.mediaUrl,
          link_path: '/ecomarket',
          reference_id: (newProduct as any).id,
        },
      }).catch((e) => console.error('notify-new-content failed:', e?.message));

      const { data: allProfiles } = await supabase
        .from('public_profiles')
        .select('user_id')
        .neq('user_id', user.id);

      if (allProfiles && allProfiles.length > 0) {
        const notifications = allProfiles
          .filter((p) => p.user_id)
          .map((p) => ({
            user_id: p.user_id!,
            type: 'product',
            title: '🛒 New EcoMarket Listing!',
            message: `"${productData.productName}" by ${productData.orgName} — KSh ${productData.price.toLocaleString()}`,
            reference_id: (newProduct as any).id,
          }));

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }

      // Send seller onboarding email on first product listing
      const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (productCount === 1) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.email) {
          supabase.functions.invoke('send-seller-onboarding', {
            body: {
              sellerName: user.name,
              productName: productData.productName,
              sellerEmail: profile.email,
            },
          }).catch((err) => console.warn('Onboarding email failed:', err));
        }
      }

      addPoints(50);
      updateStats({ postsCreated: user.stats.postsCreated + 1 });
      showNotification('Product listed & posted to Agora! 🛒', 50);
      toast.success('Product published!');
    } catch (error) {
      console.error('Error creating product:', (error as Error)?.message || 'An error occurred');
      toast.error('Failed to create product');
    }
  };

  const getProductMedia = (product: Product) => {
    if (product.media_urls && product.media_urls.length > 0) return product.media_urls;
    if (product.media_url) return [{ url: product.media_url, type: product.media_type || 'image' }];
    return [];
  };

  const getMediaIndex = (productId: string) => mediaIndices[productId] || 0;
  const setMediaIndex = (productId: string, idx: number) => setMediaIndices(prev => ({ ...prev, [productId]: idx }));

  // ── Buy flow helpers ──
  const getBuyButtonState = (price: number) => ({
    type: 'cash' as const,
    label: `Pay KSh ${price.toLocaleString()}`,
    color: 'eco-gradient-bg text-white',
  });

  const handleBuyClick = (product: Product) => {
    setBuyProduct(product);
    setShowConfirmModal(true);
    setPhoneNumber('');
    setCouponCode('');
  };

  const handleConfirmPurchase = async () => {
    if (!buyProduct || !user) return;

    if (!phoneNumber.trim()) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }

    const result = await processPurchase(buyProduct.id, 0, phoneNumber || undefined, couponCode.trim() || undefined);
    if (result) {
      setShowConfirmModal(false);
      setPurchaseResult({ ...result, productName: buyProduct.product_name });
      setShowSuccessScreen(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };
  // Sub-views removed — now standalone pages at /inbox, /purchases, /earnings

  if (isLoading) {
    return (
      <AppLayout>
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-xl font-bold text-foreground">EcoMarket</h1>
            <p className="text-xs text-muted-foreground">Eco-friendly products &amp; services</p>
          </div>
        </div>
        <div className="p-4 pb-24 max-w-6xl mx-auto w-full">
          <ProductGridSkeleton count={8} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">EcoMarket</h1>
            <p className="text-xs text-muted-foreground">Eco-friendly products & services</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="eco-button-primary py-2 px-4 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              List Product
            </button>
          )}
        </div>

        {/* EcoPoints balance bar */}
        {user && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              <span className="eco-gradient-text">{formatPointsWithKes(user.ecoPoints)}</span>
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, orgs, badges..."
            className="eco-input pl-10 py-2.5 text-sm"
            aria-label="Search products"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 pr-4" role="tablist" aria-label="Product categories">
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              role="tab"
              aria-selected={categoryFilter === cat.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'eco-gradient-bg text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span aria-hidden="true">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort + result count */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <span className="text-[11px] text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>
          <label className="relative flex items-center">
            <ArrowUpDown className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort products"
              className="appearance-none pl-8 pr-7 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
          </label>
        </div>
        </div>
      </div>

      {/* Products Grid */}
      <>
          {/* Products Grid - responsive */}
          <div className="p-4 pb-24 max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-7 h-7" />}
                title={searchQuery || categoryFilter ? 'No products match your filters' : 'No products yet'}
                description={
                  searchQuery || categoryFilter
                    ? 'Try a different search term or category.'
                    : 'Eco-friendly products will appear here as soon as they are listed.'
                }
                action={
                  (searchQuery || categoryFilter) ? (
                    <button
                      onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
                      className="eco-button-secondary py-2 px-4 text-sm"
                    >
                      Clear filters
                    </button>
                  ) : undefined
                }
              />
            ) : (
              filteredProducts.map((product, index) => {
                const media = getProductMedia(product);
                const currentMediaIdx = getMediaIndex(product.id);
                const currentMedia = media[currentMediaIdx];
                const isSaved = savedProducts.has(product.id);
                const isOwnProduct = user && product.user_id === user.id;
                const buyState = getBuyButtonState(product.price);

                return (
                  <article
                    key={product.id}
                    data-product-id={product.id}
                    className="eco-card overflow-hidden animate-slide-up"
                    style={{ animationDelay: `${Math.min(index, 5) * 0.08}s` }}
                  >
                    {/* Media carousel */}
                    {media.length > 0 && currentMedia && (
                      <div className="-mx-4 -mt-4 mb-3 relative">
                        {currentMedia.type === 'video' ? (
                          <div className="relative cursor-pointer group" onClick={(e) => openLightbox(currentMedia.url, 'video', e)}>
                            <video src={currentMedia.url} className="w-full max-h-80 object-cover" muted loop playsInline autoPlay aria-label={`${product.product_name} video`} />
                          </div>
                        ) : (
                          <div className="relative cursor-pointer group" onClick={(e) => openLightbox(currentMedia.url, 'image', e)}>
                            <img src={currentMedia.url} alt={`${product.product_name} by ${product.org_name}`} className="w-full max-h-80 object-cover" loading="lazy" />
                          </div>
                        )}
                        {media.length > 1 && (
                          <>
                            {currentMediaIdx > 0 && (
                              <button onClick={() => setMediaIndex(product.id, currentMediaIdx - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground" aria-label="Previous photo">
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                            )}
                            {currentMediaIdx < media.length - 1 && (
                              <button onClick={() => setMediaIndex(product.id, currentMediaIdx + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground" aria-label="Next photo">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {media.map((_, i) => (
                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentMediaIdx ? 'bg-white' : 'bg-white/40'}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Header: Org + Product Name + Trust Score + Save */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-primary flex items-center gap-1">
                          {product.org_name}
                        </p>
                        <h3 className="text-lg font-bold text-foreground leading-tight">{product.product_name}</h3>
                      </div>
                      <button
                        onClick={() => toggleSave(product.id)}
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        aria-label={isSaved ? 'Product saved' : 'Save product'}
                        aria-pressed={isSaved}
                      >
                        {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <p className={`text-sm text-muted-foreground leading-relaxed ${expandedDesc !== product.id ? 'line-clamp-3' : ''}`}>
                        {product.description}
                      </p>
                      {product.description.length > 120 && (
                        <button
                          onClick={() => setExpandedDesc(expandedDesc === product.id ? null : product.id)}
                          className="text-xs text-primary font-medium mt-1 flex items-center gap-0.5"
                        >
                          {expandedDesc === product.id ? 'Show less' : 'Read more'}
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedDesc === product.id ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Eco-Proof Badges */}
                    {product.badges && product.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {product.badges.map((badge) => (
                          <span key={badge} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${ecoBadgeColors[badge] || 'bg-muted text-muted-foreground'}`}>
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price + Actions */}
                    <div className="pt-3 border-t border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">KSh {product.price.toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          {/* Share button */}
                          <button
                            onClick={async () => {
                              trackInteraction(product.id, 'share');
                              const shareText = `🌿 Check out "${product.product_name}" by ${product.org_name} on EcoMarket!\n\nKSh ${product.price.toLocaleString()}\n${product.description.substring(0, 100)}...\n\n`;
                              const shareUrl = `${window.location.origin}/ecomarket`;
                              if (navigator.share) {
                                try {
                                  await navigator.share({ title: product.product_name, text: shareText, url: shareUrl });
                                } catch (err) {
                                  if ((err as Error).name !== 'AbortError') {
                                    navigator.clipboard.writeText(`${shareText}${shareUrl}`);
                                    toast.success('Link copied!');
                                  }
                                }
                              } else {
                                navigator.clipboard.writeText(`${shareText}${shareUrl}`);
                                toast.success('Link copied to clipboard!');
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all"
                            aria-label="Share product"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {!isOwnProduct && (
                            <button
                              onClick={() => setChatProduct({
                                id: product.id,
                                name: product.product_name,
                                sellerId: product.user_id,
                                sellerName: product.org_name,
                              })}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all"
                              aria-label={`Message ${product.org_name}`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}
                          <a
                            href={`tel:${product.contact_phone}`}
                            onClick={() => trackInteraction(product.id, 'click')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-primary/10 transition-all"
                            aria-label={`Call ${product.org_name}`}
                          >
                            <Phone className="w-4 h-4" aria-hidden="true" />
                          </a>
                        </div>
                      </div>

                      {/* Smart Buy Button */}
                      {!isOwnProduct && (
                        <button
                          onClick={() => handleBuyClick(product)}
                          className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${buyState.color}`}
                        >
                          <Leaf className="w-4 h-4" />
                          {buyState.label}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Floating Create Button */}
          {isAdmin && (
            <button onClick={() => setShowCreateModal(true)} className="eco-floating-button animate-pulse-glow" aria-label="List a new product">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </>

      {/* ── Purchase Confirmation Modal ── */}
      {showConfirmModal && buyProduct && user && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center" onClick={() => !isProcessing && setShowConfirmModal(false)}>
          <div
            className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-5 animate-slide-up pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirm Purchase</h3>
              <p className="text-sm text-muted-foreground mt-1">{buyProduct.product_name}</p>
            </div>

            {/* Breakdown */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total price</span>
                <span className="font-semibold text-foreground">KSh {buyProduct.price.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Paid in full via M-Pesa. Have a promo code? Add it below and the discount is applied at payment.
              </p>
            </div>

            {/* Coupon code */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Promo code (optional)</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. WORLDENVDAY"
                className="eco-input py-2.5 text-sm uppercase"
              />
            </div>

            {/* M-Pesa phone input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0712345678"
                className="eco-input py-2.5 text-sm"
              />
            </div>

            {/* Confirm buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl eco-gradient-bg text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm &amp; Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Screen ── */}
      {showSuccessScreen && purchaseResult && (
        <div className="fixed inset-0 z-[70] bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-slide-up space-y-6 max-w-sm">
            <div className="w-20 h-20 rounded-full eco-gradient-bg flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Purchase Complete! 🎉</h2>
              <p className="text-muted-foreground">You've earned <span className="font-bold text-primary">+{purchaseResult.bonusPoints} bonus EcoPoints</span></p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm text-left">
              <p className="font-semibold text-foreground">{purchaseResult.productName}</p>
              {purchaseResult.pointsUsed > 0 && <p className="text-primary flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> {purchaseResult.pointsUsed} EcoPoints redeemed</p>}
              {purchaseResult.cashPaid > 0 && <p className="text-muted-foreground">KSh {purchaseResult.cashPaid.toLocaleString()} paid via M-Pesa</p>}
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setShowSuccessScreen(false);
                  setPurchaseResult(null);
                  navigate('/purchases');
                }}
                className="flex-1 py-3 rounded-xl eco-gradient-bg text-white font-bold text-sm"
              >
                View Purchases
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultOrgName={orgName}
        onProductCreated={handleProductCreated}
      />

      {lightboxMedia && (
        <AdvancedMediaViewer
          isOpen={!!lightboxMedia}
          onClose={() => setLightboxMedia(null)}
          mediaUrl={lightboxMedia.url}
          mediaType={lightboxMedia.type}
          initialRect={lightboxMedia.rect}
        />
      )}

      {chatProduct && (
        <ProductChat
          isOpen={!!chatProduct}
          onClose={() => { setChatProduct(null); }}
          productId={chatProduct.id}
          productName={chatProduct.name}
          sellerId={chatProduct.sellerId}
          sellerName={chatProduct.sellerName}
        />
      )}
    </AppLayout>
  );
}
