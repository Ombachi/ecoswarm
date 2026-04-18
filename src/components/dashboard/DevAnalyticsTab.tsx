import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { Package, Eye, MousePointer, TrendingUp, Filter, Bookmark } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

interface ProductStat {
  id: string;
  product_name: string;
  category: string;
  created_at: string;
  description: string;
  location?: string;
}

interface Interaction {
  id: string;
  product_id: string;
  interaction_type: string;
  created_at: string;
  location?: string;
}

const PIE_COLORS = ["hsl(142, 76%, 36%)", "hsl(221, 83%, 53%)", "hsl(45, 93%, 47%)", "hsl(0, 84%, 60%)"];

type TimeFilter = "daily" | "weekly" | "all";

export const DevAnalyticsTab = React.forwardRef<HTMLDivElement, Record<string, never>>(function DevAnalyticsTab(_props, ref) {
  const { user } = useApp();
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("weekly");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    if (!user || products.length === 0) return;
    const productIds = products.map(p => p.id);
    // Subscribe per-product so the server only pushes events this seller cares about.
    const channels = productIds.map((pid) =>
      supabase
        .channel(`product-interactions-${pid}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'product_interactions', filter: `product_id=eq.${pid}` },
          (payload) => {
            const newInteraction = payload.new as Interaction;
            setInteractions(prev => [newInteraction, ...prev]);
            const product = products.find(p => p.id === newInteraction.product_id);
            const labels: Record<string, string> = { view: '👀 View', click: '👆 Click', save: '🔖 Save', share: '📤 Share' };
            const label = labels[newInteraction.interaction_type] || newInteraction.interaction_type;
            toast.success(`${label} on "${product?.product_name || 'Product'}"!`);

            const totalViews = interactions.filter(i => i.product_id === newInteraction.product_id && i.interaction_type === 'view').length + 1;
            if ([100, 500, 1000].includes(totalViews)) {
              toast.success(`🎉 ${totalViews} Views Reached on "${product?.product_name}"!`, { duration: 5000 });
            }
          }
        )
        .subscribe()
    );
    return () => { channels.forEach((c) => supabase.removeChannel(c)); };
  }, [user, products]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [productsRes, interactionsRes] = await Promise.all([
        supabase.from("products").select("id, product_name, category, created_at, description, location").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("product_interactions").select("id, product_id, interaction_type, created_at, location")
          .in("product_id", (await supabase.from("products").select("id").eq("user_id", user.id)).data?.map(p => p.id) || [])
          .order("created_at", { ascending: false }),
      ]);
      if (productsRes.error) throw productsRes.error;
      setProducts((productsRes.data || []) as ProductStat[]);
      setInteractions((interactionsRes.data || []) as Interaction[]);
    } catch (err) {
      console.error("Error loading analytics:", (err as Error)?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInteractions = useMemo(() => {
    let filtered = interactions;
    if (selectedProduct !== "all") filtered = filtered.filter(i => i.product_id === selectedProduct);
    if (locationFilter !== "all") filtered = filtered.filter(i => i.location === locationFilter);
    if (timeFilter !== "all") {
      const now = new Date();
      const cutoff = timeFilter === "daily" ? new Date(now.getTime() - 86400000) : new Date(now.getTime() - 604800000);
      filtered = filtered.filter(i => new Date(i.created_at) >= cutoff);
    }
    return filtered;
  }, [interactions, selectedProduct, timeFilter, locationFilter]);

  const totalViews = filteredInteractions.filter(i => i.interaction_type === "view").length;
  const totalClicks = filteredInteractions.filter(i => i.interaction_type === "click").length;
  const totalSaves = filteredInteractions.filter(i => i.interaction_type === "save").length;

  const lineData = useMemo(() => {
    const days = timeFilter === "daily" ? 1 : timeFilter === "weekly" ? 7 : 30;
    const data: { date: string; views: number; clicks: number; saves: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayInteractions = filteredInteractions.filter(int => {
        const t = new Date(int.created_at);
        return t >= dayStart && t < dayEnd;
      });
      data.push({
        date: dateStr,
        views: dayInteractions.filter(int => int.interaction_type === "view").length,
        clicks: dayInteractions.filter(int => int.interaction_type === "click").length,
        saves: dayInteractions.filter(int => int.interaction_type === "save").length,
      });
    }
    return data;
  }, [filteredInteractions, timeFilter]);

  const pieData = useMemo(() => [
    { name: "Views", value: totalViews },
    { name: "Clicks", value: totalClicks },
    { name: "Saves", value: totalSaves },
  ].filter(d => d.value > 0), [totalViews, totalClicks, totalSaves]);

  const locations = useMemo(() => {
    const locs = new Set(interactions.map(i => i.location).filter(Boolean));
    return Array.from(locs) as string[];
  }, [interactions]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="eco-card p-4 animate-pulse"><div className="h-4 bg-muted rounded w-2/3 mb-2" /><div className="h-3 bg-muted rounded w-1/3" /></div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="eco-card p-3 text-center">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" aria-hidden="true" />
          <p className="text-xl font-bold text-foreground">{products.length}</p>
          <p className="text-[10px] text-muted-foreground">Products</p>
        </div>
        <div className="eco-card p-3 text-center">
          <Eye className="w-5 h-5 text-secondary mx-auto mb-1" aria-hidden="true" />
          <p className="text-xl font-bold text-foreground">{totalViews}</p>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
        <div className="eco-card p-3 text-center">
          <MousePointer className="w-5 h-5 text-eco-gold mx-auto mb-1" aria-hidden="true" />
          <p className="text-xl font-bold text-foreground">{totalClicks}</p>
          <p className="text-[10px] text-muted-foreground">Clicks</p>
        </div>
        <div className="eco-card p-3 text-center">
          <Bookmark className="w-5 h-5 text-primary mx-auto mb-1" aria-hidden="true" />
          <p className="text-xl font-bold text-foreground">{totalSaves}</p>
          <p className="text-[10px] text-muted-foreground">Saves</p>
        </div>
      </div>

      {/* Filters */}
      <div className="eco-card p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="w-4 h-4" aria-hidden="true" /> Filters
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground" aria-label="Filter by product">
            <option value="all">All Products</option>
            {products.map(p => (<option key={p.id} value={p.id}>{p.product_name}</option>))}
          </select>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimeFilter)} className="text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground" aria-label="Filter by time">
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="all">All Time</option>
          </select>
          {locations.length > 0 && (
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground" aria-label="Filter by location">
              <option value="all">All Locations</option>
              {locations.map(l => (<option key={l} value={l}>{l}</option>))}
            </select>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div className="eco-card p-3">
        <h3 className="text-sm font-semibold text-foreground mb-3">📈 Views, Clicks & Saves Over Time</h3>
        {filteredInteractions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
            No interactions yet. Data will appear here in real-time!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px", color: "hsl(var(--foreground))" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="views" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 3 }} name="Views" />
              <Line type="monotone" dataKey="clicks" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 3 }} name="Clicks" />
              <Line type="monotone" dataKey="saves" stroke="hsl(45, 93%, 47%)" strokeWidth={2} dot={{ r: 3 }} name="Saves" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="eco-card p-3">
          <h3 className="text-sm font-semibold text-foreground mb-3">🎯 Engagement Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Product List */}
      {products.length === 0 ? (
        <div className="eco-card p-6 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">No products yet. List your first product in EcoMarket!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Your Products</h3>
          {products.map((product) => {
            const pViews = interactions.filter(i => i.product_id === product.id && i.interaction_type === "view").length;
            const pClicks = interactions.filter(i => i.product_id === product.id && i.interaction_type === "click").length;
            const pSaves = interactions.filter(i => i.product_id === product.id && i.interaction_type === "save").length;
            return (
              <div key={product.id} className="eco-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{product.product_name}</p>
                  <p className="text-[10px] text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground"><Eye className="w-3 h-3" /><span className="text-xs">{pViews}</span></div>
                  <div className="flex items-center gap-1 text-muted-foreground"><MousePointer className="w-3 h-3" /><span className="text-xs">{pClicks}</span></div>
                  <div className="flex items-center gap-1 text-muted-foreground"><Bookmark className="w-3 h-3" /><span className="text-xs">{pSaves}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

DevAnalyticsTab.displayName = 'DevAnalyticsTab';
