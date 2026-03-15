import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Wallet, TrendingUp, Clock, CheckCircle, Loader2, ArrowUpRight, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SellerEarningsProps {
  onBack: () => void;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  mpesa_phone: string | null;
  created_at: string;
  processed_at: string | null;
}

export function SellerEarnings({ onBack }: SellerEarningsProps) {
  const { user } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [approvedPayouts, setApprovedPayouts] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadEarnings();
  }, [user]);

  const loadEarnings = async () => {
    if (!user) return;
    setIsLoading(true);

    const [salesRes, payoutsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('cash_paid, points_used, total_price')
        .eq('seller_id', user.id)
        .eq('status', 'completed'),
      supabase
        .from('seller_payouts')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (salesRes.data) {
      const revenue = salesRes.data.reduce((sum, tx) => sum + Number(tx.total_price), 0);
      setTotalRevenue(revenue);
      setTotalSales(salesRes.data.length);
    }

    if (payoutsRes.data) {
      const payouts = payoutsRes.data as PayoutRequest[];
      setPayoutHistory(payouts);
      setPendingPayouts(payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0));
      setApprovedPayouts(payouts.filter(p => p.status === 'approved').reduce((s, p) => s + Number(p.amount), 0));
    }

    setIsLoading(false);
  };

  const availableBalance = totalRevenue - pendingPayouts - approvedPayouts;

  const handleRequestPayout = async () => {
    if (!user) return;
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > availableBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }
    if (!mpesaPhone.trim()) {
      toast.error('Enter your M-Pesa phone number');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('seller_payouts').insert({
      seller_id: user.id,
      amount,
      mpesa_phone: mpesaPhone.trim(),
    } as any);

    if (error) {
      toast.error('Failed to request payout');
    } else {
      toast.success('Payout request submitted! 🎉');
      setShowRequestForm(false);
      setRequestAmount('');
      setMpesaPhone('');
      await loadEarnings();
    }
    setIsSubmitting(false);
  };

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
    if (status === 'rejected') return <XCircle className="w-3.5 h-3.5 text-destructive" />;
    return <Clock className="w-3.5 h-3.5 text-amber-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="eco-card p-4 text-center">
          <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">KSh {totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Revenue</p>
        </div>
        <div className="eco-card p-4 text-center">
          <Wallet className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">KSh {availableBalance.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Available Balance</p>
        </div>
        <div className="eco-card p-4 text-center">
          <Clock className="w-6 h-6 text-amber-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">KSh {pendingPayouts.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Pending Payouts</p>
        </div>
        <div className="eco-card p-4 text-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{totalSales}</p>
          <p className="text-[10px] text-muted-foreground">Total Sales</p>
        </div>
      </div>

      {/* Request Payout button */}
      {availableBalance > 0 && !showRequestForm && (
        <Button onClick={() => setShowRequestForm(true)} className="w-full gap-2">
          <ArrowUpRight className="w-4 h-4" /> Request Payout
        </Button>
      )}

      {/* Payout request form */}
      {showRequestForm && (
        <div className="eco-card p-4 space-y-3 animate-slide-up">
          <h3 className="font-semibold text-foreground text-sm">Request Payout</h3>
          <p className="text-xs text-muted-foreground">Available: KSh {availableBalance.toLocaleString()}</p>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Amount (KSh)</label>
            <Input
              type="number"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              placeholder={`Max ${availableBalance.toLocaleString()}`}
              max={availableBalance}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">M-Pesa Phone</label>
            <Input
              type="tel"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              placeholder="e.g. 0712345678"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRequestForm(false)} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleRequestPayout} disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
              Submit
            </Button>
          </div>
        </div>
      )}

      {/* Payout history */}
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-2">Payout History</h3>
        {payoutHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No payout requests yet</p>
        ) : (
          <div className="space-y-2">
            {payoutHistory.map((p) => (
              <div key={p.id} className="eco-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcon(p.status)}
                  <div>
                    <p className="text-sm font-semibold text-foreground">KSh {Number(p.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {p.mpesa_phone && ` • ${p.mpesa_phone}`}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                  p.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  p.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
