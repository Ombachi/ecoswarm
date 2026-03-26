import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Save, Loader2, Package, Upload, Image as ImageIcon } from 'lucide-react';

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `merch_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('post-media').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(fileName);
      setEditing(prev => prev ? { ...prev, image_url: urlData.publicUrl } : prev);
      toast.success('Image uploaded!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
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

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No merch products yet. Add your first one!</p>
        </div>
      )}

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

              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Product Image</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {editing.image_url ? (
                  <div className="relative">
                    <img src={editing.image_url} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-border" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-sm"
                      >
                        <ImageIcon className="w-4 h-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => setEditing({ ...editing, image_url: null })}
                        className="p-2 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-sm"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                        <span className="text-xs text-muted-foreground">JPG, PNG, WebP</span>
                      </>
                    )}
                  </button>
                )}
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
