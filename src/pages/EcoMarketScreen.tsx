import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { CreateProductModal } from '@/components/ecomarket/CreateProductModal';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Phone,
  Loader2,
  X,
  ShoppingBag,
  ChevronDown,
  MapPin,
} from 'lucide-react';

interface Product {
  id: string;
  user_id: string;
  org_name: string;
  product_name: string;
  category: string;
  description: string;
  media_url?: string;
  media_type?: string;
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
  const { user, addPoints, showNotification, updateStats } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

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
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
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
          badges: productData.badges,
          price: productData.price,
          contact_phone: productData.contactPhone,
        })
        .select()
        .single();

      if (error) throw error;

      setProducts([newProduct as Product, ...products]);

      // Auto-post to Agora Square
      const postContent = [
        `🛒 New on EcoMarket: "${productData.productName}"`,
        `🏢 By: ${productData.orgName}`,
        `\n${productData.description}`,
        `\n💰 KSh ${productData.price.toLocaleString()}`,
        `📞 ${productData.contactPhone}`,
        productData.badges.length > 0 ? `\n🏷️ ${productData.badges.join(' • ')}` : '',
      ].filter(Boolean).join('\n');

      await supabase.from('posts').insert({
        user_id: user.id,
        user_name: user.name,
        content: postContent,
        media_url: productData.mediaUrl || null,
        media_type: productData.mediaType || null,
        tags: [productData.category.replace(/\s+/g, ''), 'EcoMarket', 'EcoProduct'],
      });

      // Notify users
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
            reference_id: (newProduct as Product).id,
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
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
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
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">EcoMarket</h1>
            <p className="text-xs text-muted-foreground">Eco-friendly products & services</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="eco-button-primary py-2 px-4 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            List Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, orgs, badges..."
            className="eco-input pl-10 py-2.5 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'eco-gradient-bg text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4 space-y-4 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No products match your search' : 'No products yet. Be the first to list!'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="eco-card overflow-hidden animate-slide-up"
              style={{ animationDelay: `${Math.min(index, 5) * 0.08}s` }}
            >
              {/* Media */}
              {product.media_url && (
                <div className="-mx-4 -mt-4 mb-3">
                  {product.media_type === 'video' ? (
                    <video
                      src={product.media_url}
                      className="w-full aspect-[4/5] object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  ) : (
                    <img
                      src={product.media_url}
                      alt={product.product_name}
                      className="w-full aspect-[4/5] object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              )}

              {/* Header: Org + Product Name */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-primary">{product.org_name}</p>
                <h3 className="text-lg font-bold text-foreground leading-tight">{product.product_name}</h3>
              </div>

              {/* Description */}
              <div className="mb-3">
                <p
                  className={`text-sm text-muted-foreground leading-relaxed ${
                    expandedDesc !== product.id ? 'line-clamp-3' : ''
                  }`}
                >
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
                    <span
                      key={badge}
                      className="eco-badge text-[10px] px-2 py-0.5"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Price + Contact */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-lg font-bold text-foreground">
                  KSh {product.price.toLocaleString()}
                </span>
                <a
                  href={`tel:${product.contact_phone}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl eco-gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Phone className="w-4 h-4" />
                  {product.contact_phone}
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="eco-floating-button animate-pulse-glow"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProductCreated={handleProductCreated}
      />
    </AppLayout>
  );
}
