import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="w-12 h-12 text-muted-foreground" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">
        You're Offline
      </h1>

      <p className="text-muted-foreground mb-8 max-w-sm">
        It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
      </p>

      <button
        onClick={handleRetry}
        className="eco-button-primary py-3 px-8 flex items-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Try Again
      </button>

      <div className="mt-12 p-4 bg-eco-green-light rounded-xl max-w-sm">
        <p className="text-sm text-foreground">
          💡 <strong>Tip:</strong> Your drafted content and recent activity are saved locally and will sync when you're back online.
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        🌍 EcoSwarm - Kenya's Climate Action Platform
      </p>
    </div>
  );
}

export default OfflinePage;
