import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight } from 'lucide-react';
import { CourseCover } from '@/components/common/CourseCover';

export function MerchCollection({ limit }: { limit?: number }) {
  const [items, setItems] = useState<Array<{ id: string; name: string; description: string; image_url: string | null; price: number; stock: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let query = supabase.from('merch_products').select('id,name,description,image_url,price,stock').eq('is_active', true).order('created_at');
    if (limit) query = query.limit(limit);
    query.then(({ data, error }) => { setItems(data || []); setError(Boolean(error)); setLoading(false); });
  }, [limit]);
  if (loading) return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map(i => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)}</div>;
  if (!items.length) return <div className="py-10 text-center text-muted-foreground"><Package className="w-8 h-8 mx-auto mb-3" /><p>{error ? 'Merchandise is temporarily unavailable.' : 'New EcoMerch is coming soon.'}</p></div>;
  return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{items.map(item => <article key={item.id} className="rounded-lg border border-border bg-card overflow-hidden flex flex-col"><CourseCover src={item.image_url} title={item.name} /><div className="p-5 flex flex-col flex-1"><h3 className="font-bold text-lg">{item.name}</h3><p className="text-sm text-muted-foreground mt-2 flex-1">{item.description}</p><p className="font-semibold mt-4">KSh {item.price.toLocaleString()}</p><Button asChild className="mt-4"><Link to="/signup">{item.stock > 0 ? 'Shop EcoMerch' : 'Explore EcoMerch'}<ArrowRight className="w-4 h-4 ml-2" /></Link></Button></div></article>)}</div>;
}