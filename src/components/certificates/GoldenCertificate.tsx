import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, X, Linkedin, Check } from 'lucide-react';
import { Confetti } from '@/components/common/Confetti';
import { SocialShareButtons } from '@/components/common/SocialShareButtons';

interface GoldenCertificateProps {
  userName: string;
  courseTitle: string;
  completionDate: Date;
  certId: string;
  points: number;
  onClose: () => void;
}

export function GoldenCertificate({ userName, courseTitle, completionDate, certId, points, onClose }: GoldenCertificateProps) {
  const navigate = useNavigate();
  const certRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  const dateStr = completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const verifyUrl = `https://ecoswarm.co.ke/cert/${certId}`;

  const linkedInCaption = encodeURIComponent(
    `I just leveled up my climate action skills at the EcoSwarm Capacity Hub! 🌍 Check out my '${courseTitle}' badge. From anxiety to action — join the swarm! #EcoSwarm #ClimateAction`
  );
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${linkedInCaption}&url=${encodeURIComponent(verifyUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${courseTitle} Certificate - EcoSwarm`,
          text: `I completed "${courseTitle}" at EcoSwarm Capacity Hub!`,
          url: verifyUrl,
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm overflow-y-auto">
      {showConfetti && <Confetti />}

      <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-8">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 z-10">
          <X className="w-5 h-5" />
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--eco-gold))] to-[hsl(var(--eco-orange))] flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Congratulations! 🎉</h1>
          <p className="text-muted-foreground">You've earned a Golden Certificate</p>
        </motion.div>

        {/* Certificate Card */}
        <motion.div
          ref={certRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md rounded-3xl overflow-hidden border-2 border-[hsl(var(--eco-gold))]/50 shadow-lg mb-8"
        >
          {/* Gold Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--eco-gold))] to-[hsl(var(--eco-orange))] p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">EcoSwarm</span>
            </div>
            <p className="text-white/80 text-xs uppercase tracking-widest">Certificate of Completion</p>
          </div>

          {/* Body */}
          <div className="bg-card p-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">This certifies that</p>
            <h2 className="text-2xl font-black text-foreground">{userName}</h2>
            <p className="text-sm text-muted-foreground">has successfully completed</p>
            <h3 className="text-xl font-bold eco-gradient-text">{courseTitle}</h3>
            <div className="flex items-center justify-center gap-2">
              <span className="eco-points-badge text-sm">+{points} EcoPoints</span>
            </div>
            <p className="text-xs text-muted-foreground">{dateStr}</p>

            {/* QR-style verification */}
            <div className="pt-4 border-t border-border/50">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-xs text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                ID: {certId.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Green Footer */}
          <div className="eco-gradient-bg p-3 text-center">
            <p className="text-primary-foreground text-xs font-medium">Capacity Hub • ecoswarm.co.ke</p>
          </div>
        </motion.div>

        {/* Share Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md space-y-3"
        >
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full eco-button-primary py-4 flex items-center justify-center gap-2 no-underline"
          >
            <Linkedin className="w-5 h-5" />
            Add to LinkedIn Profile
          </a>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eco-button-secondary py-3 flex items-center justify-center gap-2 no-underline text-sm"
            >
              Share to X
            </a>
            <button onClick={handleShare} className="eco-button-secondary py-3 flex items-center justify-center gap-2 text-sm">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <><Check className="w-4 h-4 text-primary" /> Copied!</> : <><ExternalLink className="w-4 h-4" /> Copy Verification Link</>}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Capacity Hub
          </button>
        </motion.div>
      </div>
    </div>
  );
}
