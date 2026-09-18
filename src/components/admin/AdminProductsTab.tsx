import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { CreateProductModal } from '@/components/ecomarket/CreateProductModal';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Plus, Trash2, Search, Package, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface ProductRow {
  id: string;
  product_name: string;
  org_name: string;
  category: string;
  price: number;
  description: string;
  badges: string[] | null;
  contact_phone: string;
  media_url: string | null;
  media_type: string | null;
  media_urls: any;
  created_at: string;
}

const PAGE_SIZE = 10;

export function AdminProductsTab() {
  const { user } = useApp();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts((data as ProductRow[]) || []);
    setIsLoading(false);
  };

  const handleProductSubmit = async (p: {
    orgName: string; productName: string; category: string; description: string;
    badges: string[]; price: number; contactPhone: string;
    mediaUrl?: string; mediaType?: string; mediaUrls?: { url: string; type: string }[];
  }) => {
    if (!user) return;
    
    const isEditing = !!editingProduct;
    const payload = {
      user_id: user.id,
      org_name: p.orgName,
      product_name: p.productName,
      category: p.category,
      description: p.description,
      media_url: p.mediaUrl || null,
      media_type: p.mediaType || null,
      media_urls: p.mediaUrls || [],
      badges: p.badges,
      price: p.price,
      contact_phone: p.contactPhone,
    } as any;

    const { data: savedProduct, error } = isEditing
      ? await supabase.from('products').update(payload).eq('id', editingProduct.id).select().single()
      : await supabase.from('products').insert(payload).select().single();

    if (error) {
      toast.error(isEditing ? 'Could not update product' : 'Could not publish product');
      return;
    }

    toast.success(isEditing ? 'Product updated' : 'Product published to EcoMarket');
    setShowModal(false);
    setEditingProduct(null);

    if (!isEditing) {
      supabase.functions.invoke('notify-new-content', {
        body: {
          type: 'product',
          title: p.productName,
          description: `${p.orgName} — ${p.description}`.slice(0, 400),
          image_url: p.mediaUrl,
          link_path: '/ecomarket',
          reference_id: (savedProduct as any)?.id,
        },
      }).catch(() => {});
    }

    await loadProducts();
  };

  const deleteProduct = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    const { error } = await supabase.from('products').delete().eq('id', confirmDelete.id);
    setBusy(false);
    setConfirmDelete(null);
    if (error) { toast.error('Could not delete product'); return; }
    toast.success('Product removed');
    await loadProducts();
  };

  const handleEditClick = (product: ProductRow) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.product_name.toLowerCase().includes(q) || p.org_name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddClick} className="gap-1.5">
          <Plus className="w-4 h-4" /> List product
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} products</p>

      {current.length === 0 ? (
        <div className="eco-card p-8 text-center">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No products yet. Use “List product” to publish the first one.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {current.map((p) => (
            <div key={p.id} className="eco-card p-3 flex items-center gap-3">
              {p.media_url ? (
                <img src={p.media_url} alt={p.product_name} className="w-14 h-14 rounded-xl object-cover bg-muted" loading="lazy" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{p.product_name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.org_name} • {p.category}</p>
                <p className="text-xs font-medium text-primary">KSh {Number(p.price).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEditClick(p)} aria-label="Edit product">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmDelete(p)} aria-label="Delete product">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

      <CreateProductModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProduct(null); }}
        editingProduct={editingProduct}
        onProductCreated={handleProductSubmit}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this product?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.product_name}” will no longer appear in EcoMarket. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteProduct}
            >
              {busy ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
