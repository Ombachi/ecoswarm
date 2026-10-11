import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export interface PurchaseResult {
  success: boolean;
  transactionId: string;
  cashPaid: number;
  isPending: boolean;
}

export function usePurchase() {
  const { refreshUser } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPurchase = async (
    productId: string,
    _pointsToUse: number,
    phoneNumber?: string,
    couponCode?: string
  ): Promise<PurchaseResult | null> => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('process-purchase', {
        body: { productId, pointsToUse: 0, phoneNumber, couponCode },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Purchase failed');
      return {
        success: true,
        transactionId: data.transactionId || data.transaction?.id,
        cashPaid: data.cashPaid,
        isPending: data.isPending || false,
      };
    } catch (err: any) {
      toast.error(err.message || 'Purchase failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /** Returns { status: 'verified' | 'pending' | 'failed', receipt? } */
  const verifyPayment = async (transactionId: string, action?: 'cancel') => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { transactionId, action },
      });
      if (error) throw error;
      if (data?.status === 'verified') await refreshUser();
      return data as { status: string; receipt?: string };
    } catch {
      return { status: 'pending' };
    }
  };

  return { processPurchase, verifyPayment, isProcessing };
}
