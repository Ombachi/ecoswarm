import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Save, Loader2, Package } from 'lucide-react';

interface MerchProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  is_active: boolean;
}

export function AdminMerchTab() {
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<MerchProduct> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('merch_products').select('*').order('created_at');
    setProducts((data as MerchProduct[]) || []);
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditing({ name: '', description: '', price: 0, image_url: '', category: 'Gear', stock: 50, is_active: true });
  };

  const handleSave = async () => {
    if (!editing || !editing.name?.trim()) { toast.error('Name is required'); return; }
    setIsSaving(true);
    try {
      const payload: any = {
        name: editing.name,
        description: editing.description || '',
        price: editing.price || 0,
        image_url: editing.image_url || null,
        category: editing.category || 'Gear',
        stock: editing.stock || 0,
        is_active: editing.is_active ?? true,
      };
      if (editing.id) {
        const { error } = await supabase.from('merch_products').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('merch_products').insert(payload);
        if (error) throw error;
      }
      toast.success(editing.id ? 'Updated!' : 'Created!');
      setEditing(null);
      await load();
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('merch_products').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Deleted!'); await load(); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      <Button onClick={openCreate} className="w-full gap-2"><Plus className="w-4 h-4" /> Add Merch Product</Button>

      {products.map(p => (
        <div key={p.id} className={`eco-card p-4 ${!p.is_active ? 'opacity-50' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-primary/30" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.category} • KSh {p.price.toLocaleString()} • {p.stock} in stock</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing({ ...p })} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{editing.id ? 'Edit' : 'Add'} Merch</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-full bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                <Input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                <Textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Price (KSh)</label>
                  <Input type="number" value={editing.price || 0} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Stock</label>
                  <Input type="number" value={editing.stock || 0} onChange={e => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                <Input value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Gear, Apparel, Accessories" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Image URL</label>
                <Input value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editing.is_active ?? true} onCheckedChange={val => setEditing({ ...editing, is_active: val })} />
                <label className="text-sm text-foreground">Active</label>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
