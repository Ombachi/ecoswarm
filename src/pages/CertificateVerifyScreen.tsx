import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { DigitalCertificate } from '@/components/certificates/DigitalCertificate';

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

  // Dynamic OG meta tags for JS-executing crawlers
  useEffect(() => {
    if (!cert) return;
    const tags: HTMLMetaElement[] = [];

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
        tags.push(el);
      }
      el.content = content;
    };

    const setNameMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
        tags.push(el);
      }
      el.content = content;
    };

    const title = `${cert.userName} completed "${cert.courseTitle}" — EcoSwarm Certificate`;
    const desc = `Verified EcoSwarm Capacity Hub certificate for completing "${cert.courseTitle}". View and verify this achievement.`;
    const url = `${window.location.origin}/verify/${certId}`;

    document.title = title;
    setMeta('og:title', title);
    setMeta('og:description', desc);
    setMeta('og:url', url);
    setMeta('og:type', 'article');
    setMeta('og:site_name', 'EcoSwarm Capacity Hub');
    setMeta('og:image', `${window.location.origin}/og-certificate.png`);
    setNameMeta('twitter:card', 'summary_large_image');
    setNameMeta('twitter:title', title);
    setNameMeta('twitter:description', desc);

    return () => {
      tags.forEach(el => el.remove());
      document.title = 'EcoSwarm - Your Digital Agora';
    };
  }, [cert, certId]);

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Certificate Verified</h1>
          <p className="text-muted-foreground text-sm mt-1">This is a legitimate EcoSwarm Climate Academy certificate.</p>
        </div>

        <DigitalCertificate
          userName={cert?.userName || ''}
          courseTitle={cert?.courseTitle || ''}
          completionDate={dateStr}
          certId={certId || ''}
        />

        <div className="flex items-center justify-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
            <ExternalLink className="w-4 h-4" /> Visit EcoSwarm
          </Link>
        </div>
      </div>
    </div>
  );
}
