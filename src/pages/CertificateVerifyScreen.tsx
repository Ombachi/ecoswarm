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

        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Golden Certificate</h2>
              <p className="text-xs text-muted-foreground">EcoSwarm Capacity Hub</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Awarded To</p>
              <p className="font-semibold text-foreground">{cert?.userName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Course Completed</p>
              <p className="font-semibold text-foreground">{cert?.courseTitle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Completion</p>
              <p className="font-semibold text-foreground">{dateStr}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Certificate ID</p>
              <p className="font-mono text-xs text-muted-foreground break-all">{certId}</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline">
            <ExternalLink className="w-4 h-4" /> Visit EcoSwarm
          </Link>
        </div>
      </div>
    </div>
  );
}
