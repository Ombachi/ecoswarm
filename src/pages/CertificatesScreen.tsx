import { usePageMeta } from '@/hooks/usePageMeta';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { MyCertificates } from '@/components/certificates/MyCertificates';
import { Award } from 'lucide-react';

export function CertificatesScreen() {
  const { user, isSwahili } = useApp();
  usePageMeta('My Certificates', 'View, download and share the certificates you earned on EcoSwarm.');

  if (!user) return null;

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto w-full px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {isSwahili ? 'Vyeti Vyangu' : 'My Certificates'}
            </h1>
            <p className="text-xs text-muted-foreground">Download, share and verify</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 max-w-4xl mx-auto w-full">
        <MyCertificates userId={user.id} userName={user.name} isSwahili={isSwahili} />
      </div>
    </AppLayout>
  );
}
