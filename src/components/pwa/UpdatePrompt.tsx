import { RefreshCw, X } from 'lucide-react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

export function UpdatePrompt() {
  const { updateAvailable, applyUpdate, dismissUpdate } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[60] animate-slide-up max-w-md mx-auto">
      <div className="bg-card border border-primary/30 rounded-2xl shadow-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Update Available 🌱</p>
          <p className="text-xs text-muted-foreground">A new version of EcoSwarm is ready</p>
        </div>

        <button
          onClick={applyUpdate}
          className="eco-button-primary py-2 px-4 text-xs font-semibold whitespace-nowrap"
        >
          Update
        </button>

        <button
          onClick={dismissUpdate}
          className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
