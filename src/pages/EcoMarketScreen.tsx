import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { CreateProductModal } from '@/components/ecomarket/CreateProductModal';
import { ProductChat } from '@/components/ecomarket/ProductChat';
import { AdvancedMediaViewer } from '@/components/common/AdvancedMediaViewer';
import { usePurchase } from '@/hooks/usePurchase';
import { Confetti } from '@/components/common/Confetti';
import { toast } from 'sonner';
import {
  Search, Plus, Phone, Loader2, X, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, MessageCircle,
  Inbox, ShoppingCart, Package, ArrowLeft, Leaf, Check, Sparkles, Share2, Star, AlertTriangle, Shield, ShieldCheck, Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createAutoPost } from '@/utils/autoPost';
import { SellerEarnings } from '@/components/ecomarket/SellerEarnings';

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
  const { user, addPoints, showNotification, updateStats } = useApp();
  const navigate = useNavigate();
  const { processPurchase, isProcessing } = usePurchase();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [trackedViews, setTrackedViews] = useState<Set<string>>(new Set());
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set());
  const [mediaIndices, setMediaIndices] = useState<Record<string, number>>({});
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    rect: DOMRect | null;
  } | null>(null);
  const [chatProduct, setChatProduct] = useState<{ id: string; name: string; sellerId: string; sellerName: string } | null>(null);
  const [activeView, setActiveView] = useState<'browse' | 'inbox' | 'purchases' | 'earnings'>('browse');
  const [unreadCount, setUnreadCount] = useState(0);

  // Buy flow state
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ bonusPoints: number; pointsUsed: number; cashPaid: number; productName: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');


  // ── Real-time unread message count ──
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
    if (!error && count !== null) setUnreadCount(count);
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    if (!user) return;
    const channel = supabase
      .channel('inbox-unread')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchUnreadCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchUnreadCount]);

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
    if (user) {
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'ecodeveloper')
        .maybeSingle()
        .then(({ data }) => {
          setIsDeveloper(!!data);
          if (data) {
            supabase
              .from('org_profiles')
              .select('company_name')
              .eq('user_id', user.id)
              .maybeSingle()
              .then(({ data: orgData }) => {
                if (orgData) setOrgName(orgData.company_name);
              });
          }
        });
    }
  }, [categoryFilter, user]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      const parsed = (data || []).map((p: any) => ({
        ...p,
        badges: p.badges || [],
        media_urls: Array.isArray(p.media_urls) ? p.media_urls : [],
      })) as Product[];
      setProducts(parsed);
    } catch (error) {
      console.error('Error loading products:', (error as Error)?.message || 'An error occurred');
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.org_name.toLowerCase().includes(q) ||
      p.product_name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.badges.some((b) => b.toLowerCase().includes(q))
    );
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

      const badgeText = productData.badges.length > 0 ? productData.badges.join(' • ') : '';
      const postContent = [
        `🛒 New on EcoMarket!`,
        ``,
        `🏢 ${productData.orgName}`,
        `📦 ${productData.productName}`,
        ``,
        productData.description,
        ``,
        `💰 KSh ${productData.price.toLocaleString()}`,
        `📞 ${productData.contactPhone}`,
        badgeText ? `\n🏷️ ${badgeText}` : '',
      ].filter(Boolean).join('\n');

      await supabase.from('posts').insert({
        user_id: user.id,
        user_name: user.name,
        content: postContent,
        media_url: productData.mediaUrl || null,
        media_type: productData.mediaType || null,
        tags: [productData.category.replace(/\s+/g, ''), 'EcoMarket', 'EcoProduct'],
      });

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
  const getBuyButtonState = (price: number) => {
    const points = user?.ecoPoints || 0;
    if (points >= price) return { type: 'full' as const, label: `Redeem ${price} EcoPoints`, color: 'eco-gradient-bg text-white' };
    if (points > 0) return { type: 'partial' as const, label: `Redeem ${points} EcoPoints + Pay KSh ${(price - points).toLocaleString()}`, color: 'bg-amber-500 text-white' };
    return { type: 'cash' as const, label: `Pay KSh ${price.toLocaleString()}`, color: 'eco-gradient-bg text-white' };
  };

  const handleBuyClick = (product: Product) => {
    setBuyProduct(product);
    setShowConfirmModal(true);
    setPhoneNumber('');
  };

  const handleConfirmPurchase = async () => {
    if (!buyProduct || !user) return;
    const points = user.ecoPoints || 0;
    const pointsToUse = Math.min(points, buyProduct.price);
    const cashRemaining = buyProduct.price - pointsToUse;

    if (cashRemaining > 0 && !phoneNumber.trim()) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }

    const result = await processPurchase(buyProduct.id, pointsToUse, phoneNumber || undefined);
    if (result) {
      setShowConfirmModal(false);
      setPurchaseResult({ ...result, productName: buyProduct.product_name });
      setShowSuccessScreen(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  // ── Inbox sub-view ──
  const InboxView = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [inboxLoading, setInboxLoading] = useState(true);

    useEffect(() => {
      if (!user) return;
      (async () => {
        setInboxLoading(true);
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        const convMap = new Map<string, any>();
        for (const msg of messages || []) {
          const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          const key = `${msg.product_id || 'direct'}-${otherId}`;
          if (!convMap.has(key)) {
            convMap.set(key, { productId: msg.product_id || '', otherUserId: otherId, lastMessage: msg.content, lastMessageAt: msg.created_at || '', unreadCount: 0, productName: '', otherUserName: '' });
          }
          if (msg.receiver_id === user.id && !msg.is_read) convMap.get(key)!.unreadCount++;
        }

        const productIds = [...new Set([...convMap.values()].map((c: any) => c.productId).filter(Boolean))];
        let productMap: Record<string, string> = {};
        if (productIds.length > 0) {
          const { data: prods } = await supabase.from('products').select('id, product_name').in('id', productIds);
          if (prods) prods.forEach(p => { productMap[p.id] = p.product_name; });
        }
        const userIds = [...new Set([...convMap.values()].map((c: any) => c.otherUserId))];
        let userMap: Record<string, string> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from('public_profiles').select('user_id, name').in('user_id', userIds);
          if (profiles) profiles.forEach(p => { if (p.user_id && p.name) userMap[p.user_id] = p.name; });
        }

        const result = [...convMap.values()].map((c: any) => ({ ...c, productName: productMap[c.productId] || 'Direct Message', otherUserName: userMap[c.otherUserId] || 'User' }));
        result.sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        setConversations(result);
        setInboxLoading(false);
      })();
    }, [user]);

    const formatTime = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const now = new Date();
      const diffH = (now.getTime() - d.getTime()) / 3600000;
      if (diffH < 24) return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
      if (diffH < 168) return d.toLocaleDateString('en-KE', { weekday: 'short' });
      return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
    };

    if (inboxLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (conversations.length === 0) return (
      <div className="p-8 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-semibold">No messages yet</p>
        <p className="text-sm text-muted-foreground mt-1">Start a conversation from a product listing!</p>
      </div>
    );

    return (
      <div className="divide-y divide-border">
        {conversations.map((conv: any) => (
          <button
            key={`${conv.productId}-${conv.otherUserId}`}
            onClick={() => setChatProduct({ id: conv.productId, name: conv.productName, sellerId: conv.otherUserId, sellerName: conv.otherUserName })}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground text-sm truncate">{conv.otherUserName}</p>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">Re: {conv.productName}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {conv.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full eco-gradient-bg text-white text-[10px] font-bold flex items-center justify-center">{conv.unreadCount}</span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    );
  };

  // ── Purchases sub-view ──
  const PurchasesView = () => {
    const [purchases, setPurchases] = useState<Transaction[]>([]);
    const [purchasesLoading, setPurchasesLoading] = useState(true);
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [ratingTx, setRatingTx] = useState<string | null>(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [disputeTx, setDisputeTx] = useState<string | null>(null);
    const [disputeReason, setDisputeReason] = useState('');

    useEffect(() => {
      if (!user) return;
      (async () => {
        setPurchasesLoading(true);
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
        setPurchasesLoading(false);
      })();
    }, [user]);

    const submitRating = async (txId: string) => {
      if (!user || ratingValue === 0) return;
      const tx = purchases.find(p => p.id === txId);
      if (!tx) return;
      const { error } = await supabase.from('seller_ratings').insert({
        transaction_id: txId,
        buyer_id: user.id,
        seller_id: tx.seller_id,
        rating: ratingValue,
        review: reviewText || null,
      } as any);
      if (!error) {
        setRatings(prev => ({ ...prev, [txId]: ratingValue }));
        setRatingTx(null);
        setRatingValue(0);
        setReviewText('');
        toast.success('Rating submitted! ⭐');
      } else {
        toast.error('Failed to submit rating');
      }
    };

    const submitDispute = async (txId: string) => {
      if (!user || !disputeReason.trim()) return;
      const { error } = await supabase.from('transaction_disputes').insert({
        transaction_id: txId,
        raised_by: user.id,
        reason: disputeReason.trim(),
      } as any);
      if (!error) {
        setDisputeTx(null);
        setDisputeReason('');
        toast.success('Dispute raised. We will review it shortly.');
      } else {
        toast.error('Failed to raise dispute');
      }
    };

    const getVerificationBadge = (tx: Transaction) => {
      const vs = tx.verification_status || 'unverified';
      if (vs === 'verified') return { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Verified', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      if (vs === 'pending') return { icon: <Shield className="w-3.5 h-3.5" />, label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
      if (vs === 'failed') return { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Failed', className: 'bg-destructive/10 text-destructive' };
      if (vs === 'simulated') return { icon: <Shield className="w-3.5 h-3.5" />, label: 'Simulated', className: 'bg-muted text-muted-foreground' };
      return { icon: <Shield className="w-3.5 h-3.5" />, label: 'Unverified', className: 'bg-muted text-muted-foreground' };
    };

    if (purchasesLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (purchases.length === 0) return (
      <div className="p-8 text-center">
        <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-semibold">No purchases yet</p>
        <p className="text-sm text-muted-foreground mt-1">Buy eco-products with your EcoPoints!</p>
      </div>
    );

    return (
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
                {tx.points_used > 0 && (
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Leaf className="w-3.5 h-3.5" /> {tx.points_used} pts
                  </span>
                )}
                {Number(tx.cash_paid) > 0 && (
                  <span className="text-muted-foreground">+ KSh {Number(tx.cash_paid).toLocaleString()}</span>
                )}
                {tx.bonus_points > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{tx.bonus_points} bonus</span>
                )}
              </div>

              {tx.mpesa_receipt && (
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">Receipt: {tx.mpesa_receipt}</p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                {tx.product_id && (
                  <button
                    onClick={() => setChatProduct({ id: tx.product_id, name: tx.product_name, sellerId: tx.seller_id, sellerName: '' })}
                    className="text-xs text-primary font-medium flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </button>
                )}

                {tx.status === 'completed' && !hasRated && (
                  <button
                    onClick={() => { setRatingTx(tx.id); setRatingValue(0); setReviewText(''); }}
                    className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 ml-auto"
                  >
                    <Star className="w-3.5 h-3.5" /> Rate
                  </button>
                )}
                {hasRated && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-0.5 ml-auto">
                    {Array.from({ length: ratings[tx.id] }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </span>
                )}

                {tx.status === 'completed' && (
                  <button
                    onClick={() => { setDisputeTx(tx.id); setDisputeReason(''); }}
                    className="text-xs text-muted-foreground font-medium flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                  </button>
                )}
              </div>

              {/* Inline rating form */}
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
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Optional review..."
                    className="eco-input text-xs py-2 min-h-[60px]"
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setRatingTx(null)} className="flex-1 text-xs py-2 rounded-lg border border-border text-foreground font-medium">Cancel</button>
                    <button onClick={() => submitRating(tx.id)} disabled={ratingValue === 0} className="flex-1 text-xs py-2 rounded-lg eco-gradient-bg text-white font-bold disabled:opacity-50">Submit</button>
                  </div>
                </div>
              )}

              {/* Inline dispute form */}
              {disputeTx === tx.id && (
                <div className="mt-3 p-3 rounded-xl bg-destructive/5 space-y-2.5 animate-slide-up">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Raise a Dispute</p>
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe the issue..."
                    className="eco-input text-xs py-2 min-h-[60px]"
                    maxLength={1000}
                  />
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
    );
  };

  if (isLoading && activeView === 'browse') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading products" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {activeView !== 'browse' && (
              <button onClick={() => setActiveView('browse')} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {activeView === 'browse' ? 'EcoMarket' : activeView === 'inbox' ? 'Product Inbox' : activeView === 'earnings' ? 'Seller Earnings' : 'My Purchases'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeView === 'browse' ? 'Eco-friendly products & services' : activeView === 'inbox' ? 'Your product conversations' : activeView === 'earnings' ? 'Revenue & payouts' : 'Track your purchases'}
              </p>
            </div>
          </div>
          {isDeveloper && activeView === 'browse' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="eco-button-primary py-2 px-4 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              List Product
            </button>
          )}
        </div>

        {activeView === 'browse' && (
          <>
            {/* EcoPoints balance bar */}
            {user && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">You have <span className="eco-gradient-text">{user.ecoPoints.toLocaleString()}</span> EcoPoints</span>
              </div>
            )}

            {/* Quick Action Dashboard Cards */}
            <div className={`grid ${isDeveloper ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-3`}>
              <button
                onClick={() => setActiveView('inbox')}
                className="relative flex items-center gap-2 p-3 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full eco-gradient-bg flex items-center justify-center flex-shrink-0">
                  <Inbox className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-foreground">Inbox</p>
                </div>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveView('purchases')}
                className="flex items-center gap-2 p-3 rounded-xl bg-accent/50 hover:bg-accent/70 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-foreground">Purchases</p>
                </div>
              </button>
              {isDeveloper && (
                <button
                  onClick={() => setActiveView('earnings')}
                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-foreground">Earnings</p>
                  </div>
                </button>
              )}
            </div>

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
          </>
        )}
      </div>

      {/* Content based on active view */}
      {activeView === 'inbox' ? (
        <InboxView />
      ) : activeView === 'purchases' ? (
        <PurchasesView />
      ) : activeView === 'earnings' ? (
        <SellerEarnings onBack={() => setActiveView('browse')} />
      ) : (
        <>
          {/* Products Grid - responsive */}
          <div className="p-4 pb-24 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No products match your search' : 'No products yet. Be the first to list!'}
                </p>
              </div>
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
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-primary">{product.org_name}</p>
                          <TrustScoreBadge score={trustScores[product.user_id]?.total ?? 0} size="sm" />
                        </div>
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
          {isDeveloper && (
            <button onClick={() => setShowCreateModal(true)} className="eco-floating-button animate-pulse-glow" aria-label="List a new product">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </>
      )}

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
              {(() => {
                const points = user.ecoPoints || 0;
                const pointsToUse = Math.min(points, buyProduct.price);
                const cashRemaining = buyProduct.price - pointsToUse;

                return (
                  <>
                    {pointsToUse > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> EcoPoints</span>
                        <span className="font-semibold text-primary">-{pointsToUse} pts</span>
                      </div>
                    )}
                    {cashRemaining > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining (M-Pesa)</span>
                        <span className="font-semibold text-foreground">KSh {cashRemaining.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Points after</span>
                      <span className="font-semibold text-foreground">{(points - pointsToUse)} + 50 bonus 🎁</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* M-Pesa phone input if cash needed */}
            {(() => {
              const cashRemaining = buyProduct.price - Math.min(user.ecoPoints || 0, buyProduct.price);
              if (cashRemaining <= 0) return null;
              return (
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
              );
            })()}

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
                {user.ecoPoints >= buyProduct.price ? 'Confirm Redemption' : 'Confirm & Pay'}
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
                onClick={async () => {
                  if (user && purchaseResult) {
                    const content = `🛒 Just purchased "${purchaseResult.productName}" on the EcoMarket!\n\n${purchaseResult.pointsUsed > 0 ? `Redeemed ${purchaseResult.pointsUsed} EcoPoints 🌱\n` : ''}Earned +${purchaseResult.bonusPoints} bonus EcoPoints! 🎉\n\n#EcoMarket #EcoSwarm #GreenShopping`;
                    await createAutoPost({
                      userId: user.id,
                      userName: user.name,
                      content,
                      tags: ['EcoMarket', 'EcoSwarm', 'GreenShopping'],
                    });
                    toast.success('Shared to Agora Square!');
                  }
                  setShowSuccessScreen(false);
                  setPurchaseResult(null);
                  navigate('/agora');
                }}
                className="flex-1 py-3 rounded-xl border border-primary text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share in Agora
              </button>
              <button
                onClick={() => {
                  setShowSuccessScreen(false);
                  setPurchaseResult(null);
                  setActiveView('purchases');
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
          onClose={() => { setChatProduct(null); fetchUnreadCount(); }}
          productId={chatProduct.id}
          productName={chatProduct.name}
          sellerId={chatProduct.sellerId}
          sellerName={chatProduct.sellerName}
        />
      )}
    </AppLayout>
  );
}
