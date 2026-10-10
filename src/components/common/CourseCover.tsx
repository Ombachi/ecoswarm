import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

export function CourseCover({ src, title }: { src?: string | null; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setLoaded(false); setFailed(false); }, [src]);
  return (
    <div className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center border-b border-border">
      <GraduationCap className="w-10 h-10 text-primary/70" aria-hidden="true" />
      {src && !failed && <img src={src} alt={title} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className={`absolute inset-0 w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`} />}
    </div>
  );
}