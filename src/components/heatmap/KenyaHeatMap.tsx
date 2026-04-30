import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, GraduationCap, Zap, ShoppingBag, Users, Loader2 } from 'lucide-react';

// Simplified SVG paths for 47 Kenyan counties (approximate centroids + rough boundaries)
// Format: { name, cx, cy } — we use circles/dots positioned on a Kenya outline
const COUNTIES: { name: string; cx: number; cy: number }[] = [
  { name: 'Mombasa', cx: 74, cy: 82 },
  { name: 'Kwale', cx: 70, cy: 85 },
  { name: 'Kilifi', cx: 73, cy: 76 },
  { name: 'Tana River', cx: 72, cy: 68 },
  { name: 'Lamu', cx: 78, cy: 64 },
  { name: 'Taita-Taveta', cx: 65, cy: 78 },
  { name: 'Garissa', cx: 75, cy: 55 },
  { name: 'Wajir', cx: 78, cy: 40 },
  { name: 'Mandera', cx: 82, cy: 25 },
  { name: 'Marsabit', cx: 65, cy: 30 },
  { name: 'Isiolo', cx: 60, cy: 42 },
  { name: 'Meru', cx: 55, cy: 47 },
  { name: 'Tharaka-Nithi', cx: 55, cy: 50 },
  { name: 'Embu', cx: 52, cy: 53 },
  { name: 'Kitui', cx: 60, cy: 62 },
  { name: 'Machakos', cx: 53, cy: 62 },
  { name: 'Makueni', cx: 57, cy: 68 },
  { name: 'Nyandarua', cx: 44, cy: 50 },
  { name: 'Nyeri', cx: 48, cy: 49 },
  { name: 'Kirinyaga', cx: 50, cy: 52 },
  { name: 'Murang\'a', cx: 48, cy: 54 },
  { name: 'Kiambu', cx: 47, cy: 58 },
  { name: 'Turkana', cx: 45, cy: 22 },
  { name: 'West Pokot', cx: 38, cy: 32 },
  { name: 'Samburu', cx: 52, cy: 35 },
  { name: 'Trans Nzoia', cx: 36, cy: 36 },
  { name: 'Uasin Gishu', cx: 38, cy: 40 },
  { name: 'Elgeyo-Marakwet', cx: 40, cy: 38 },
  { name: 'Nandi', cx: 36, cy: 42 },
  { name: 'Baringo', cx: 44, cy: 40 },
  { name: 'Laikipia', cx: 48, cy: 43 },
  { name: 'Nakuru', cx: 42, cy: 48 },
  { name: 'Narok', cx: 38, cy: 58 },
  { name: 'Kajiado', cx: 48, cy: 66 },
  { name: 'Kericho', cx: 37, cy: 48 },
  { name: 'Bomet', cx: 36, cy: 52 },
  { name: 'Kakamega', cx: 32, cy: 42 },
  { name: 'Vihiga', cx: 33, cy: 44 },
  { name: 'Bungoma', cx: 32, cy: 38 },
  { name: 'Busia', cx: 30, cy: 42 },
  { name: 'Siaya', cx: 30, cy: 47 },
  { name: 'Kisumu', cx: 32, cy: 48 },
  { name: 'Homa Bay', cx: 32, cy: 52 },
  { name: 'Migori', cx: 30, cy: 55 },
  { name: 'Kisii', cx: 34, cy: 53 },
  { name: 'Nyamira', cx: 35, cy: 50 },
  { name: 'Nairobi', cx: 49, cy: 60 },
];

interface CountyData {
  users: number;
  courses: number;
  letters: number;
  swarms: number;
  total: number;
}

function getHeatColor(total: number, max: number): string {
  if (max === 0) return 'hsl(var(--muted))';
  const ratio = total / max;
  if (ratio >= 0.7) return 'hsl(var(--primary))';
  if (ratio >= 0.4) return 'hsl(var(--eco-gold))';
  if (ratio >= 0.15) return 'hsl(var(--secondary))';
  if (total > 0) return 'hsl(var(--eco-blue))';
  return 'hsl(var(--muted))';
}

function getDotRadius(total: number, max: number): number {
  if (max === 0) return 1.5;
  const ratio = total / max;
  if (ratio >= 0.7) return 3.5;
  if (ratio >= 0.4) return 2.8;
  if (ratio >= 0.15) return 2.2;
  if (total > 0) return 1.8;
  return 1.5;
}

export function KenyaHeatMap() {
  const [countyData, setCountyData] = useState<Record<string, CountyData>>({});
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('county, courses_completed, letters_sent, swarms_joined');

      const map: Record<string, CountyData> = {};
      COUNTIES.forEach(c => {
        map[c.name] = { users: 0, courses: 0, letters: 0, swarms: 0, total: 0 };
      });

      (profiles || []).forEach((p: any) => {
        const county = p.county || 'Nairobi';
        const matched = COUNTIES.find(c => county.toLowerCase().includes(c.name.toLowerCase()));
        const key = matched?.name || 'Nairobi';
        if (!map[key]) map[key] = { users: 0, courses: 0, letters: 0, swarms: 0, total: 0 };
        map[key].users += 1;
        map[key].courses += p.courses_completed || 0;
        map[key].letters += p.letters_sent || 0;
        map[key].swarms += p.swarms_joined || 0;
        map[key].total += 1 + (p.courses_completed || 0) + (p.letters_sent || 0) + (p.swarms_joined || 0);
      });

      setCountyData(map);
    } catch (err) {
      console.error('Heat map data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const maxTotal = useMemo(() => Math.max(...Object.values(countyData).map(d => d.total), 1), [countyData]);

  return (
    <div className="eco-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Kenya Activity Map</h3>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="relative">
          <svg viewBox="15 10 75 85" className="w-full" style={{ aspectRatio: '3/4' }}>
            {/* Kenya outline */}
            <path
              d="M30 15 L55 12 L78 18 L85 30 L82 42 L80 55 L76 65 L75 75 L72 82 L68 88 L60 90 L52 85 L48 72 L42 65 L38 60 L34 58 L30 55 L28 48 L27 40 L30 30 Z"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.6"
            />
            {/* Background fill */}
            <path
              d="M30 15 L55 12 L78 18 L85 30 L82 42 L80 55 L76 65 L75 75 L72 82 L68 88 L60 90 L52 85 L48 72 L42 65 L38 60 L34 58 L30 55 L28 48 L27 40 L30 30 Z"
              fill="hsl(var(--muted))"
              opacity="0.15"
            />

            {/* County dots */}
            {COUNTIES.map(county => {
              const data = countyData[county.name];
              const total = data?.total || 0;
              const r = getDotRadius(total, maxTotal);
              const color = getHeatColor(total, maxTotal);

              return (
                <g key={county.name}>
                  {total > 0 && (
                    <circle
                      cx={county.cx} cy={county.cy} r={r + 1.5}
                      fill={color} opacity="0.15"
                    />
                  )}
                  <circle
                    cx={county.cx} cy={county.cy} r={r}
                    fill={color}
                    stroke="hsl(var(--background))"
                    strokeWidth="0.3"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => {
                      setHoveredCounty(county.name);
                      const svgX = county.cx;
                      const svgY = county.cy;
                      setHoverPos({ x: svgX, y: svgY });
                    }}
                    onMouseLeave={() => setHoveredCounty(null)}
                  />
                  {/* Label for large dots */}
                  {total > 0 && r >= 2.8 && (
                    <text
                      x={county.cx} y={county.cy + r + 3}
                      textAnchor="middle"
                      fontSize="2"
                      fill="hsl(var(--muted-foreground))"
                      className="pointer-events-none"
                    >
                      {county.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hoveredCounty && countyData[hoveredCounty] && (
            <div
              className="absolute z-20 w-40 bg-card border border-border rounded-xl p-3 shadow-xl pointer-events-none"
              style={{
                left: `${((hoverPos.x - 15) / 75) * 100}%`,
                top: `${((hoverPos.y - 10) / 85) * 100}%`,
                transform: 'translate(-50%, -110%)',
              }}
            >
              <p className="font-bold text-foreground text-xs mb-2">{hoveredCounty}</p>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-1 text-foreground">
                  <Users className="w-3 h-3 text-primary" /> {countyData[hoveredCounty].users} users
                </div>
                <div className="flex items-center gap-1 text-foreground">
                  <GraduationCap className="w-3 h-3 text-[hsl(var(--eco-blue))]" /> {countyData[hoveredCounty].courses} courses
                </div>
                <div className="flex items-center gap-1 text-foreground">
                  <Zap className="w-3 h-3 text-primary" /> {countyData[hoveredCounty].letters} letters
                </div>
                <div className="flex items-center gap-1 text-foreground">
                  <ShoppingBag className="w-3 h-3 text-[hsl(var(--eco-gold))]" /> {countyData[hoveredCounty].swarms} swarms
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--eco-blue))' }} /> Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--secondary))' }} /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--eco-gold))' }} /> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--primary))' }} /> Hot</span>
          </div>
        </div>
      )}
    </div>
  );
}
