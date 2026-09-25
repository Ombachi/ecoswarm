import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Award, ChevronRight, Download, Share2, ExternalLink, Linkedin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCertificatePdf } from '@/lib/certificatePdf';
import { DigitalCertificate } from '@/components/certificates/DigitalCertificate';
import { Pagination } from '@/components/common/Pagination';

const CERTS_PER_PAGE = 5;

interface CertRecord {
  id: string;
  module_id: string;
  completed_at: string;
  courseTitle: string;
}

interface MyCertificatesProps {
  userId: string;
  userName: string;
  isSwahili?: boolean;
}

export function MyCertificates({ userId, userName, isSwahili }: MyCertificatesProps) {
  const [certs, setCerts] = useState<CertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const { data: completions } = await supabase
        .from('course_completions')
        .select('id, module_id, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (!completions?.length) { setLoading(false); return; }

      const moduleIds = [...new Set(completions.map(c => c.module_id))];
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', moduleIds);

      const courseMap = new Map(courses?.map(c => [c.id, c.title]) || []);

      setCerts(
        completions
          .filter(c => courseMap.has(c.module_id))
          .map(c => ({ ...c, courseTitle: courseMap.get(c.module_id) as string }))
      );
      setLoading(false);
    })();
  }, [userId]);

  const handleCopy = async (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(certId);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const handleDownload = async (cert: CertRecord) => {
    setDownloading(cert.id);
    const dateStr = new Date(cert.completed_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    try {
      await generateCertificatePdf({
        userName,
        courseTitle: cert.courseTitle,
        completionDate: dateStr,
        certId: cert.id,
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = async (cert: CertRecord) => {
    const url = `${window.location.origin}/verify/${cert.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cert.courseTitle} Certificate - EcoSwarm`,
          text: `I completed "${cert.courseTitle}" at EcoSwarm Climate Academy!`,
          url,
        });
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-eco-gold" />
          {isSwahili ? 'Vyeti Vyangu' : 'My Certificates'}
        </h3>
        {[1, 2].map(i => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-eco-gold" />
          {isSwahili ? 'Vyeti Vyangu' : 'My Certificates'}
        </h3>
        <span className="text-sm text-muted-foreground">{certs.length}</span>
      </div>

      {certs.length === 0 ? (
        <div className="eco-card p-6 text-center">
          <Award className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {isSwahili ? 'Bado huna vyeti. Kamilisha kozi kupata!' : 'No certificates yet. Complete courses to earn them!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.slice((page - 1) * CERTS_PER_PAGE, page * CERTS_PER_PAGE).map(cert => {
            const isExpanded = expandedId === cert.id;
            const dateStr = new Date(cert.completed_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            });
            const verifyUrl = `${window.location.origin}/verify/${cert.id}`;
            const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;

            return (
              <div key={cert.id} className="eco-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : cert.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{cert.courseTitle}</p>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <DigitalCertificate
                          userName={userName}
                          courseTitle={cert.courseTitle}
                          completionDate={dateStr}
                          certId={cert.id}
                        />

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleDownload(cert)}
                            disabled={downloading === cert.id}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {downloading === cert.id ? 'Saving…' : 'Download PDF'}
                          </button>
                          <button
                            onClick={() => handleShare(cert)}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-foreground text-xs font-medium"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-medium text-foreground no-underline"
                          >
                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                          </a>
                          <button
                            onClick={() => handleCopy(cert.id)}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground"
                          >
                            {copied === cert.id
                              ? <><Check className="w-3.5 h-3.5 text-primary" /> Copied!</>
                              : <><ExternalLink className="w-3.5 h-3.5" /> Copy Link</>}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <Pagination
            page={page}
            pageCount={Math.max(1, Math.ceil(certs.length / CERTS_PER_PAGE))}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
