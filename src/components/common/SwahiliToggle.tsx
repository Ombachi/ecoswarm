import { useApp } from '@/context/AppContext';
import { Globe } from 'lucide-react';

export function SwahiliToggle() {
  const { isSwahili, toggleLanguage } = useApp();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium transition-all hover:bg-muted/80"
    >
      <Globe className="w-3 h-3" />
      {isSwahili ? 'Kiswahili' : 'English'}
    </button>
  );
}
