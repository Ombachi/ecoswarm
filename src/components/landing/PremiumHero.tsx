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
      className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-black"
    >
      {/* ── Background video (full-bleed, object-cover) ── */}
      <div className="absolute inset-0 -z-10">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </div>

      {/* ── Foreground content ── */}
      <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-left text-white">
          <div className="space-y-2 sm:space-y-4">
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
                className="text-[2.25rem] xs:text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.02] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]"
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

      {/* Subtle bottom fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
