import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLandingNav } from "@/hooks/useLandingNav";

type Product = {
  id: string;
  product_name: string;
  description: string;
  price: number;
  category: string | null;
  media_url: string | null;
  org_name: string | null;
};

export function MarketHighlights() {
  const go = useLandingNav();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id,product_name,description,price,category,media_url,org_name")
        .order("created_at", { ascending: false })
        .limit(6);
      setProducts((data as Product[]) || []);
    })();
  }, []);

  if (products.length === 0) return null;

  return (
    <section id="market" className="py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-12">
          <div className="max-w-2xl">
            <span className="eco-badge mb-4 inline-flex">
              <ShoppingBag className="w-3.5 h-3.5" /> EcoMarket
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Featured sustainable products
            </h2>
            <p className="text-muted-foreground mt-3 md:text-lg">
              Vetted eco-friendly products from Kenyan makers, paid for securely with M-Pesa.
            </p>
          </div>
          <Button onClick={() => go("/ecomarket")}>
            Shop now <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="eco-card overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {p.media_url ? (
                  <img
                    src={p.media_url}
                    alt={p.product_name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                {p.category && <span className="eco-badge text-[10px] mb-2 self-start">{p.category}</span>}
                <h3 className="font-bold leading-snug mb-1">{p.product_name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{p.description}</p>
                {p.org_name && <p className="text-xs text-muted-foreground mt-1">by {p.org_name}</p>}
                <p className="mt-3 text-lg font-black eco-gradient-text">
                  KES {Number(p.price).toLocaleString()}
                </p>
                <Button variant="outline" className="mt-3 w-full" onClick={() => go("/ecomarket")}>
                  Shop now
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
