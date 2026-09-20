import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Ticket, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/Skeletons';
import { Pagination } from '@/components/common/Pagination';

const PAGE_SIZE = 10;

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  max_redemptions: number | null;
  times_used: number;
  is_active: boolean;
}

export function AdminCouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Could not load promo codes');
    setCoupons((data as Coupon[]) || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setCode(''); setDescription(''); setDiscountType('percent');
    setDiscountValue(''); setEndsAt(''); setMaxRedemptions('');
  };

  const handleCreate = async () => {
    if (!code.trim()) return toast.error('Enter a code');
    const value = Number(discountValue);
    if (!value || value <= 0) return toast.error('Enter a discount value');
    if (discountType === 'percent' && value > 100) return toast.error('Percentage cannot exceed 100');

    setSaving(true);
    const { error } = await supabase.from('coupons').insert({
      code: code.trim().toUpperCase(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: value,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      max_redemptions: maxRedemptions ? Number(maxRedemptions) : null,
      is_active: true,
    });
    setSaving(false);

    if (error) {
      toast.error(error.message.includes('duplicate') ? 'That code already exists' : 'Could not create promo code');
      return;
    }
    toast.success('Promo code created');
    resetForm();
    setShowForm(false);
    load();
  };

  const toggleActive = async (c: Coupon) => {
    const { error } = await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    if (error) return toast.error('Could not update promo code');
    toast.success(c.is_active ? 'Promo code disabled' : 'Promo code enabled');
    load();
  };

  const remove = async (c: Coupon) => {
    const { error } = await supabase.from('coupons').delete().eq('id', c.id);
    if (error) return toast.error('Could not delete promo code');
    toast.success('Promo code deleted');
    load();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const pageItems = coupons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{coupons.length} promo codes</p>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-3.5 h-3.5" /> New code
        </Button>
      </div>

      {showForm && (
        <div className="eco-card p-4 space-y-3">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code e.g. WORLDENVDAY" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description e.g. World Environment Day offer" />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
              className="eco-input py-2 text-sm"
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed KSh off</option>
            </select>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percent' ? '% e.g. 20' : 'KSh e.g. 500'}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground">Expires (optional)</label>
              <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Max uses (optional)</label>
              <Input type="number" value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} placeholder="Unlimited" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button size="sm" className="flex-1" disabled={saving} onClick={handleCreate}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {coupons.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-7 h-7" />}
          title="No promo codes yet"
          description="Create a code for days like World Environment Day."
        />
      ) : (
        pageItems.map(c => (
          <div key={c.id} className="eco-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground">{c.code}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.description || '—'}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {c.discount_type === 'percent' ? `${c.discount_value}% off` : `KSh ${c.discount_value} off`}
                  {' • '}{c.times_used} used{c.max_redemptions ? ` / ${c.max_redemptions}` : ''}
                  {c.ends_at ? ` • ends ${new Date(c.ends_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(c)} aria-label="Toggle code">
                  <Power className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(c)} aria-label="Delete code">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      <Pagination page={page} pageCount={Math.ceil(coupons.length / PAGE_SIZE)} onPageChange={setPage} />
    </div>
  );
}
