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
}

export function usePurchase() {
  const { refreshUser } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPurchase = async (
    productId: string,
    pointsToUse: number,
    phoneNumber?: string
  ): Promise<PurchaseResult | null> => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('process-purchase', {
        body: { productId, pointsToUse, phoneNumber },
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
      };
    } catch (err: any) {
      toast.error(err.message || 'Purchase failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { processPurchase, isProcessing };
}
