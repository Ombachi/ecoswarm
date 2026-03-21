import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LayoutMode = 'mobile' | 'tablet' | 'desktop';

interface LayoutContextType {
  layoutMode: LayoutMode;
  isTabletLandscape: boolean;
  showRightPanel: boolean;
  setShowRightPanel: (v: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  layoutMode: 'mobile',
  isTabletLandscape: false,
  showRightPanel: true,
  setShowRightPanel: () => {},
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('mobile');
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w >= 1440) {
        setLayoutMode('desktop');
      } else if (w >= 768 && w <= 1024) {
        setLayoutMode('tablet');
        setIsTabletLandscape(w > h);
      } else if (w > 1024 && w < 1440) {
        // Between tablet and desktop – treat as tablet landscape
        setLayoutMode('tablet');
        setIsTabletLandscape(true);
      } else {
        setLayoutMode('mobile');
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <LayoutContext.Provider value={{ layoutMode, isTabletLandscape, showRightPanel, setShowRightPanel }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
