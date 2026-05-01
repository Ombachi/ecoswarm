import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const heroPoster = "/ecoswarm-hero-poster.jpg";
const heroVideo = "/ecoswarm-hero.mp4";

type PremiumHeroProps = Record<string, never>;

const statements = ["Shop sustainably", "Learn boldly", "Amplify your voice"];

/**
 * Full-bleed cinematic video hero for EcoSwarm.
 * - Background: looping muted video that covers the entire viewport.
 * - Foreground: bold rotating-gradient statements.
 * - Performance: poster preloaded, video lazy-attached after first paint,
 *   playsInline + muted for autoplay on mobile, preload="metadata".
 */
export function PremiumHero(_props: PremiumHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Defer video mount slightly so the poster paints first and LCP stays fast.
  useEffect(() => {
    const id = window.setTimeout(() => setShowVideo(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!showVideo) return;
    const v = videoRef.current;
    if (!v) return;
    // Some mobile browsers need an explicit play() after attach.
    const tryPlay = () => v.play().catch(() => void 0);
    tryPlay();
  }, [showVideo]);

  return (
    <section
      id="hero"
      className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-black isolate"
    >
      {/* ── Background video (full-bleed, object-cover) ── */}
      <div className="absolute inset-0 z-0">
        {/* Poster acts as the instant background while the video loads */}
        <img
          src={heroPoster}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {showVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover object-center"
            src={heroVideo}
            poster={heroPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden
          />
        )}

        {/* Cinematic legibility overlays */}
        {/* Subtle, even darken for text contrast — no heavy bottom band */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
      </div>

      {/* ── Foreground content ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-[min(92vw,46rem)] text-left text-white">
          <div className="space-y-1.5 sm:space-y-3">
            {statements.map((line, i) => (
              <motion.h2
                key={line}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + i * 0.25,
                  type: "spring",
                  stiffness: 220,
                  damping: 14,
                }}
                className="text-[clamp(1.75rem,7vw,4.25rem)] font-black leading-[1.05] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]"
              >
                <span
                  className={
                    i === 0
                      ? "bg-gradient-to-r from-[hsl(var(--eco-green-light))] to-white bg-clip-text text-transparent"
                      : i === 1
                      ? "bg-gradient-to-r from-[hsl(var(--eco-blue-light))] to-white bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-[hsl(var(--eco-gold))] via-[hsl(var(--eco-orange))] to-white bg-clip-text text-transparent"
                  }
                >
                  {line}
                </span>
              </motion.h2>
            ))}
          </div>
        </div>
      </div>

      {/* Very subtle bottom fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
