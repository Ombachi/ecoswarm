import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Zap, ShoppingBag, GraduationCap, Users } from 'lucide-react';

interface RegionData {
  name: string;
  courses: number;
  letters: number;
  sales: number;
  swarms: number;
  total: number;
}

const KENYA_REGIONS = [
  { name: 'Nairobi', x: 55, y: 62 },
  { name: 'Mombasa', x: 68, y: 78 },
  { name: 'Kisumu', x: 30, y: 50 },
  { name: 'Nakuru', x: 42, y: 50 },
  { name: 'Eldoret', x: 35, y: 38 },
  { name: 'Nyeri', x: 52, y: 50 },
  { name: 'Machakos', x: 58, y: 66 },
  { name: 'Meru', x: 58, y: 45 },
  { name: 'Kakamega', x: 28, y: 42 },
  { name: 'Garissa', x: 78, y: 50 },
];

function getHeatColor(total: number) {
  if (total >= 20) return 'bg-primary shadow-primary/50';
  if (total >= 10) return 'bg-[hsl(var(--eco-gold))] shadow-[hsl(var(--eco-gold))]/50';
  if (total >= 5) return 'bg-secondary shadow-secondary/50';
  if (total > 0) return 'bg-[hsl(var(--eco-blue))] shadow-[hsl(var(--eco-blue))]/50';
  return 'bg-muted';
}

function getPulseSize(total: number) {
  if (total >= 20) return 'w-8 h-8';
  if (total >= 10) return 'w-6 h-6';
  if (total >= 5) return 'w-5 h-5';
  return 'w-4 h-4';
}

export function KenyaHeatMap() {
  const [regionData, setRegionData] = useState<Record<string, RegionData>>({});
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Aggregate profile data by location
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('location, courses_completed, letters_sent, swarms_joined');

      const map: Record<string, RegionData> = {};
      KENYA_REGIONS.forEach(r => {
        map[r.name] = { name: r.name, courses: 0, letters: 0, sales: 0, swarms: 0, total: 0 };
      });

      (profiles || []).forEach((p: any) => {
        const loc = p.location || 'Nairobi';
        const region = KENYA_REGIONS.find(r => loc.toLowerCase().includes(r.name.toLowerCase()));
        const key = region?.name || 'Nairobi';
        if (!map[key]) map[key] = { name: key, courses: 0, letters: 0, sales: 0, swarms: 0, total: 0 };
        map[key].courses += p.courses_completed || 0;
        map[key].letters += p.letters_sent || 0;
        map[key].swarms += p.swarms_joined || 0;
        map[key].total += (p.courses_completed || 0) + (p.letters_sent || 0) + (p.swarms_joined || 0);
      });

      setRegionData(map);
    } catch (err) {
      console.error('Heat map data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="eco-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Activity Pulse Map</h3>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="relative bg-gradient-to-b from-primary/5 to-secondary/5 rounded-xl aspect-[4/5] overflow-hidden">
          {/* Kenya outline placeholder */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M30 20 L70 15 L85 40 L80 60 L70 80 L55 90 L40 85 L25 70 L20 50 Z" fill="currentColor" className="text-primary" />
            </svg>
          </div>

          {/* Region dots */}
          {KENYA_REGIONS.map((region) => {
            const data = regionData[region.name];
            const total = data?.total || 0;
            const dotSize = getPulseSize(total);
            const color = getHeatColor(total);

            return (
              <div
                key={region.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
                onMouseEnter={() => setHoveredRegion(region.name)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <div className={`${dotSize} ${color} rounded-full shadow-lg ${total > 5 ? 'animate-pulse' : ''} transition-all`} />

                {/* Hover tooltip */}
                {hoveredRegion === region.name && data && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-card border border-border rounded-xl p-3 shadow-xl z-10">
                    <p className="font-bold text-foreground text-xs mb-2">{region.name}</p>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center gap-1 text-[hsl(var(--eco-blue))]">
                        <GraduationCap className="w-3 h-3" /> {data.courses} courses
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="w-3 h-3" /> {data.letters} letters
                      </div>
                      <div className="flex items-center gap-1 text-[hsl(var(--eco-gold))]">
                        <ShoppingBag className="w-3 h-3" /> {data.sales} sales
                      </div>
                      <div className="flex items-center gap-1 text-destructive">
                        <Users className="w-3 h-3" /> {data.swarms} swarms
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(var(--eco-blue))]" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(var(--eco-gold))]" /> Med</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> High</span>
          </div>
        </div>
      )}
    </div>
  );
}
