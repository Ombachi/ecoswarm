import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface PurchaseResult {
  success: boolean;
  bonusPoints: number;
  pointsUsed: number;
  cashPaid: number;
  newPoints: number;
  verificationStatus: string;
  isPending: boolean;
}

export function usePurchase() {
  const { refreshUser } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPurchase = async (
    productId: string,
    pointsToUse: number,
    phoneNumber?: string,
    couponCode?: string
  ): Promise<PurchaseResult | null> => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('process-purchase', {
        body: { productId, pointsToUse, phoneNumber, couponCode },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Purchase failed');

      await refreshUser();
      return {
        success: true,
        bonusPoints: data.bonusPoints,
        pointsUsed: data.pointsUsed,
        cashPaid: data.cashPaid,
        newPoints: data.newPoints,
        verificationStatus: data.verificationStatus || 'verified',
        isPending: data.isPending || false,
      };
    } catch (err: any) {
      toast.error(err.message || 'Purchase failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { transactionId },
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
      return null;
    }
  };

  return { processPurchase, verifyPayment, isProcessing };
}
