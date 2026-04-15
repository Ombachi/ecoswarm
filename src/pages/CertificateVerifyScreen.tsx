import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Award, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface CertData {
  user_id: string;
  module_id: string;
  completed_at: string;
  userName?: string;
  courseTitle?: string;
}

export function CertificateVerifyScreen() {
  const { certId } = useParams<{ certId: string }>();
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!certId) { setNotFound(true); setLoading(false); return; }
    
    (async () => {
      try {
        const { data, error } = await supabase
          .from('course_completions')
          .select('*')
          .eq('id', certId)
          .maybeSingle();

        if (error || !data) { setNotFound(true); setLoading(false); return; }

        // Fetch profile name
        const { data: profile } = await supabase
          .from('public_profiles')
          .select('name')
          .eq('user_id', data.user_id)
          .maybeSingle();

        // Fetch course title
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', data.module_id)
          .maybeSingle();

        setCert({
          ...data,
          userName: profile?.name || 'EcoSwarm Member',
          courseTitle: course?.title || 'EcoSwarm Course',
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [certId]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `EcoSwarm-Certificate-${certId?.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Certificate Not Found</h1>
          <p className="text-muted-foreground mb-6">This certificate ID is invalid or does not exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
            <ExternalLink className="w-4 h-4" /> Visit EcoSwarm
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = cert?.completed_at
    ? new Date(cert.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20 dark:to-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Certificate Verified ✅</h1>
          <p className="text-muted-foreground text-sm mt-1">This is a legitimate EcoSwarm Capacity Hub certificate.</p>
        </div>

        <div ref={certRef} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Award className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">EcoSwarm</span>
            </div>
            <p className="text-white/80 text-xs uppercase tracking-widest">Certificate of Completion</p>
          </div>

          <div className="p-6 space-y-3 text-center">
            <p className="text-xs text-muted-foreground">This certifies that</p>
            <h2 className="text-xl font-black text-foreground">{cert?.userName}</h2>
            <p className="text-xs text-muted-foreground">has successfully completed</p>
            <h3 className="text-lg font-bold text-primary">{cert?.courseTitle}</h3>
            <p className="text-xs text-muted-foreground">{dateStr}</p>
            <div className="pt-3 border-t border-border/50">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                ID: {certId?.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-primary p-3 text-center">
            <p className="text-primary-foreground text-xs font-medium">Capacity Hub • ecoswarm.co.ke</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading…' : 'Download'}
          </button>
          <Link to="/" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
            <ExternalLink className="w-4 h-4" /> Visit EcoSwarm
          </Link>
        </div>
      </div>
    </div>
  );
}
