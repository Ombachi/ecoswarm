import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { Package, Eye, MessageSquare, TrendingUp } from "lucide-react";

interface ProductStat {
  id: string;
  product_name: string;
  category: string;
  created_at: string;
  description: string;
}

export const DevAnalyticsTab = React.forwardRef<HTMLDivElement, Record<string, never>>(function DevAnalyticsTab(_props, ref) {
  const { user } = useApp();
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_name, category, created_at, description")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error loading products:", (err as Error)?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="eco-card p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="eco-card p-3 text-center">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{products.length}</p>
          <p className="text-[10px] text-muted-foreground">Products</p>
        </div>
        <div className="eco-card p-3 text-center">
          <Eye className="w-5 h-5 text-secondary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{products.length * 12}</p>
          <p className="text-[10px] text-muted-foreground">Est. Views</p>
        </div>
        <div className="eco-card p-3 text-center">
          <TrendingUp className="w-5 h-5 text-eco-gold mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{products.length * 4}</p>
          <p className="text-[10px] text-muted-foreground">Engagements</p>
        </div>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="eco-card p-6 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No products yet. List your first product in EcoMarket!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Your Products</h3>
          {products.map((product) => (
            <div key={product.id} className="eco-card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{product.product_name}</p>
                <p className="text-[10px] text-muted-foreground">{product.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">12</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                  <span className="text-xs">4</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

DevAnalyticsTab.displayName = 'DevAnalyticsTab';
