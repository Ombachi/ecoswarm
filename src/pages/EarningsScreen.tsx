import { AppLayout } from '@/components/layout/AppLayout';
import { SellerEarnings } from '@/components/ecomarket/SellerEarnings';
import { useNavigate } from 'react-router-dom';

export function EarningsScreen() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <SellerEarnings onBack={() => navigate('/dashboard')} />
    </AppLayout>
  );
}
