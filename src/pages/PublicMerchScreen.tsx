import { PublicLayout } from '@/components/layout/PublicLayout';
import { MerchCollection } from '@/components/landing/MerchCollection';
import { usePageMeta } from '@/hooks/usePageMeta';

export function PublicMerchScreen() {
  usePageMeta('EcoMerch', 'Explore EcoSwarm branded merchandise, prices and product descriptions.');
  return <PublicLayout><section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"><h1 className="text-3xl md:text-4xl font-bold">EcoMerch</h1><p className="text-muted-foreground mt-3 mb-8">Wear your purpose. Choose gear for everyday sustainable living.</p><MerchCollection /></section></PublicLayout>;
}