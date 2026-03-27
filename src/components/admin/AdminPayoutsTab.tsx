import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Payout {
  id: string; seller_id: string; amount: number; status: string; mpesa_phone: string | null; mpesa_receipt: string | null; created_at: string; processed_at: string | null;
}

export function AdminPayoutsTab() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('seller_payouts').select('*').order('created_at', { ascending: false });
    const all = (data as Payout[]) || [];
    setPayouts(all);
    const ids = [...new Set(all.map(p => p.seller_id))];
    if (ids.length > 0) {
      const { data: profiles } = await supabase.from('public_profiles').select('user_id, name').in('user_id', ids);
      const n: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { if (p.user_id) n[p.user_id] = p.name || 'Unknown'; });
      setNames(n);
    }
    setIsLoading(false);
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      if (action === 'approved') {
        const { data, error } = await supabase.functions.invoke('process-payout', { body: { payoutId: id } });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Payout failed');
        toast.success(data.message || 'Payout processing');
      } else {
        const { error } = await supabase.from('seller_payouts').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        toast.success('Payout rejected');
      }
      await load();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
    finally { setProcessingId(null); }
  };

  const getName = (id: string) => names[id] || id.slice(0, 8);
  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      approved: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] || { variant: 'secondary' as const, icon: null };
    return <Badge variant={s.variant} className="gap-1 text-[10px]">{s.icon} {status}</Badge>;
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      {payouts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No payout requests yet</p></div>
      ) : payouts.map((p) => (
        <div key={p.id} className="eco-card p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">{statusBadge(p.status)}<span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span></div>
              <p className="text-sm font-semibold text-foreground">KSh {Number(p.amount).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Seller: {getName(p.seller_id)}</p>
              {p.mpesa_phone && <p className="text-xs text-muted-foreground">Phone: {p.mpesa_phone}</p>}
              {p.mpesa_receipt && <p className="text-xs text-primary">Receipt: {p.mpesa_receipt}</p>}
            </div>
            {p.status === 'pending' && (
              <div className="flex flex-col gap-1">
                <Button size="sm" className="text-xs gap-1" disabled={processingId === p.id} onClick={() => handleAction(p.id, 'approved')}>
                  {processingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                </Button>
                <Button size="sm" variant="destructive" className="text-xs gap-1" disabled={processingId === p.id} onClick={() => handleAction(p.id, 'rejected')}>
                  <XCircle className="w-3 h-3" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
