import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Store } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";

type Product = { id: string; product_name: string; description: string | null; price: number; category: string | null; media_url: string | null; org_name: string | null };

const ksh = (n: number) => `KSh ${Number(n).toLocaleString("en-KE")}`;

export function PublicMarketScreen() {
  const navigate = useNavigate();
  usePageMeta("EcoMarket", "Shop vetted sustainable products in Kenya. Pay securely with M-Pesa.");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("new");
  const [open, setOpen] = useState<Product | null>(null);

  useEffect(() => {
    supabase.from("products").select("id,product_name,description,price,category,media_url,org_name").order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as Product[]) || []); setLoading(false); });
  }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((p) => p.category).filter(Boolean) as string[]))], [items]);
  const list = items
    .filter((p) => (cat === "All" || p.category === cat) && (p.product_name + " " + (p.description || "")).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0));

  const buy = () => navigate("/signup");

  return (
    <PublicLayout>
      <section className="border-b border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-3"><ShoppingBag className="w-4 h-4" /> EcoMarket</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Products that don't cost the planet</h1>
          <p className="text-muted-foreground mt-3 md:text-lg max-w-2xl">Vetted sustainable goods from Kenyan makers. Pay securely with M-Pesa.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="pl-9" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="new">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />)}</div>
        ) : list.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {list.map((p) => (
              <article key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                <button onClick={() => setOpen(p)} className="aspect-square bg-muted overflow-hidden">
                  {p.media_url ? <img src={p.media_url} alt={p.product_name} loading="lazy" className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center"><Store className="w-10 h-10 text-muted-foreground" /></div>}
                </button>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  {p.category && <span className="text-[11px] text-muted-foreground mb-1">{p.category}</span>}
                  <h2 className="font-semibold text-sm md:text-base leading-snug line-clamp-2">{p.product_name}</h2>
                  <p className="font-bold text-primary mt-1">{ksh(p.price)}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <Button variant="outline" size="sm" onClick={() => setOpen(p)}>Details</Button>
                    <Button size="sm" onClick={buy}>Buy with M-Pesa</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader><DialogTitle>{open.product_name}</DialogTitle></DialogHeader>
              {open.media_url && <img src={open.media_url} alt={open.product_name} className="w-full aspect-[4/3] object-cover rounded-xl" />}
              {open.org_name && <p className="text-xs text-muted-foreground">Sold by {open.org_name}</p>}
              <p className="text-sm text-muted-foreground whitespace-pre-line max-h-48 overflow-y-auto">{open.description}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-black text-primary">{ksh(open.price)}</span>
                <Button onClick={buy}>Buy with M-Pesa</Button>
              </div>
              <p className="text-xs text-muted-foreground">Create a free account to check out securely with M-Pesa.</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
