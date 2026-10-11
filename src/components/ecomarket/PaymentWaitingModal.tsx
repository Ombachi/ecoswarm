import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Smartphone, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePurchase } from '@/hooks/usePurchase';
import { Confetti } from '@/components/common/Confetti';
import { Button } from '@/components/ui/button';

const TIMEOUT_S = 45;

interface Props {
  transactionId: string;
  phone: string;
  productName: string;
  amount: number;
  onRetry: () => void;
  onClose: () => void;
  onViewPurchases: () => void;
}

export function PaymentWaitingModal({ transactionId, phone, productName, amount, onRetry, onClose, onViewPurchases }: Props) {
  const { verifyPayment } = usePurchase();
  const [state, setState] = useState<'waiting' | 'verified' | 'failed'>('waiting');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [left, setLeft] = useState(TIMEOUT_S);
  const done = useRef(false);

  const settle = (s: 'verified' | 'failed', r?: string | null) => {
    if (done.current) return;
    done.current = true;
    setState(s);
    if (r) setReceipt(r);
  };

  // Realtime: instant update when the payment callback lands
  useEffect(() => {
    const channel = supabase
      .channel(`tx-${transactionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `id=eq.${transactionId}` }, (payload) => {
        const row = payload.new as { status: string; mpesa_receipt: string | null };
        if (row.status === 'completed') settle('verified', row.mpesa_receipt);
        else if (row.status === 'failed') settle('failed');
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [transactionId]);

  // Polling fallback every 3s + countdown
  useEffect(() => {
    if (state !== 'waiting') return;
    const tick = setInterval(() => setLeft((l) => l - 1), 1000);
    const poll = setInterval(async () => {
      const res = await verifyPayment(transactionId);
      if (res.status === 'verified') settle('verified', res.receipt);
      else if (res.status === 'failed') settle('failed');
    }, 3000);
    return () => { clearInterval(tick); clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, transactionId]);

  useEffect(() => {
    if (state === 'waiting' && left <= 0) {
      (async () => {
        const res = await verifyPayment(transactionId);
        if (res.status === 'verified') return settle('verified', res.receipt);
        await verifyPayment(transactionId, 'cancel');
        settle('failed');
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, state]);

  return (
    <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-live="polite">
      {state === 'verified' && <Confetti />}
      <div className="w-full max-w-sm text-center space-y-5">
        {state === 'waiting' && (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Smartphone className="w-9 h-9 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Waiting for your PIN</h2>
            <p className="text-sm text-muted-foreground">
              Prompt sent to <span className="font-semibold text-foreground">{phone}</span>. Please check your phone and enter your M-Pesa PIN to complete payment.
            </p>
            <div className="text-4xl font-black tabular-nums text-primary">{Math.max(left, 0)}s</div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking payment status…</p>
            <p className="text-xs text-muted-foreground">{productName} · KSh {amount.toLocaleString()}</p>
          </>
        )}
        {state === 'verified' && (
          <>
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Payment Verified!</h2>
            {receipt && <p className="text-sm text-muted-foreground">Receipt: <span className="font-mono font-semibold text-foreground">{receipt}</span></p>}
            <p className="text-sm text-muted-foreground">Our team will contact you shortly to arrange delivery of {productName}.</p>
            <Button className="w-full" onClick={onViewPurchases}>View Purchases</Button>
          </>
        )}
        {state === 'failed' && (
          <>
            <XCircle className="w-20 h-20 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Payment was cancelled or timed out</h2>
            <p className="text-sm text-muted-foreground">No money was taken and no order was created. You can try again.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
              <Button className="flex-1" onClick={onRetry}>Try again</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
