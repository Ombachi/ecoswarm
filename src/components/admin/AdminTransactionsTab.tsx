import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

interface Transaction {
  id: string; buyer_id: string; seller_id: string; product_name: string; points_used: number; cash_paid: number; total_price: number; status: string; payment_method: string | null; verification_status: string | null; mpesa_receipt: string | null; created_at: string;
}

const PAGE_SIZE = 20;

export function AdminTransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(async (afterCursor?: string | null) => {
    let query = supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(PAGE_SIZE + 1);
    if (afterCursor) query = query.lt('created_at', afterCursor);
    const { data } = await query;
    const rows = (data as Transaction[]) || [];
    const hasNext = rows.length > PAGE_SIZE;
    const page = hasNext ? rows.slice(0, PAGE_SIZE) : rows;
    return { page, hasNext };
  }, []);

  const resolveNames = async (txs: Transaction[]) => {
    const ids = new Set<string>();
    txs.forEach(tx => { ids.add(tx.buyer_id); ids.add(tx.seller_id); });
    const newIds = [...ids].filter(id => !names[id]);
    if (newIds.length > 0) {
      const { data } = await supabase.from('public_profiles').select('user_id, name').in('user_id', newIds);
      const n = { ...names };
      (data || []).forEach((p: any) => { if (p.user_id) n[p.user_id] = p.name || 'Unknown'; });
      setNames(n);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { page, hasNext } = await fetchPage();
      setTransactions(page);
      setHasMore(hasNext);
      setCursor(page.length > 0 ? page[page.length - 1].created_at : null);
      await resolveNames(page);
      setIsLoading(false);
    })();
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const { page, hasNext } = await fetchPage(cursor);
    setTransactions(prev => [...prev, ...page]);
    setHasMore(hasNext);
    setCursor(page.length > 0 ? page[page.length - 1].created_at : null);
    await resolveNames(page);
    setLoadingMore(false);
  };

  const getName = (id: string) => names[id] || id.slice(0, 8);
  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      completed: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      pending_payment: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      failed: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] || { variant: 'outline' as const, icon: null };
    return <Badge variant={s.variant} className="gap-1 text-[10px]">{s.icon} {status}</Badge>;
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No transactions yet</p></div>
      ) : (
        <>
          {transactions.map((tx) => (
            <div key={tx.id} className="eco-card p-4 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{tx.product_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {statusBadge(tx.status)}
                    {tx.verification_status && <Badge variant="outline" className="text-[10px]">{tx.verification_status}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>Buyer: {getName(tx.buyer_id)}</span><span>→</span><span>Seller: {getName(tx.seller_id)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-foreground font-medium">KSh {Number(tx.total_price).toLocaleString()}</span>
                    {tx.points_used > 0 && <span className="text-primary">{tx.points_used} pts</span>}
                    {Number(tx.cash_paid) > 0 && <span className="text-muted-foreground">+ KSh {Number(tx.cash_paid).toLocaleString()} cash</span>}
                  </div>
                  {tx.mpesa_receipt && <p className="text-[10px] text-muted-foreground mt-0.5">M-Pesa: {tx.mpesa_receipt}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{tx.payment_method} • {new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
          {hasMore && (
            <Button variant="outline" className="w-full" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Load More
            </Button>
          )}
        </>
      )}
    </div>
  );
}
