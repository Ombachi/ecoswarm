import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMain from "@/assets/hero-main.avif";
import heroShop1 from "@/assets/hero-shop-1.avif";
import heroShop2 from "@/assets/hero-shop-2.avif";
import heroShop3 from "@/assets/hero-shop-3.avif";
import heroLearn1 from "@/assets/hero-learn-1.avif";
import heroLearn2 from "@/assets/hero-learn-2.avif";
import heroLearn3 from "@/assets/hero-learn-3.avif";
import heroAmplify1 from "@/assets/hero-amplify-1.avif";
import heroAmplify2 from "@/assets/hero-amplify-2.avif";
import heroAmplify3 from "@/assets/hero-amplify-3.avif";

interface PremiumHeroProps {
  onPrimary: () => void;
  onSecondary: () => void;
}

const rotatingImages = [
  { src: heroMain, alt: "EcoSwarm community in action" },
  { src: heroShop1, alt: "Shop sustainably — eco marketplace" },
  { src: heroLearn1, alt: "Learn boldly — climate education" },
  { src: heroAmplify1, alt: "Amplify your voice — advocacy in action" },
  { src: heroShop2, alt: "Sustainable products from local makers" },
  { src: heroLearn2, alt: "Bold learners shaping climate futures" },
  { src: heroAmplify2, alt: "Community advocacy and storytelling" },
  { src: heroShop3, alt: "Conscious consumption marketplace" },
  { src: heroLearn3, alt: "Hands-on climate learning" },
  { src: heroAmplify3, alt: "EcoWarriors raising their voices" },
];

const statements = ["Shop sustainably", "Learn boldly", "Amplify your voice"];

/**
 * Premium split-layout hero for EcoSwarm.
 * - LEFT: 3 bold popping statements that animate in sequence.
 * - RIGHT: rotating/flipping image stack (3D card flip).
 * - Mobile: text first, then the rotating image stack.
 */
export function PremiumHero({ onPrimary, onSecondary }: PremiumHeroProps) {
  const [bleedIndex, setBleedIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBleedIndex((i) => (i + 1) % rotatingImages.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="hero"
      className="relative pt-16 pb-8 md:pt-24 md:pb-20 overflow-hidden bg-gradient-to-b from-background via-background to-[hsl(var(--eco-green-light)/0.25)]"
    >
      {/* Color-bleed backdrop derived from the current hero image.
          A massively blurred, oversized copy fills the entire section so any
          gaps left by varying image aspect ratios are filled with on-brand
          color rather than empty whitespace. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.img
            key={`bleed-${bleedIndex}`}
            src={rotatingImages[bleedIndex].src}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover scale-150 blur-3xl"
          />
        </AnimatePresence>
        {/* Wash to keep text legible and unify with the page palette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/90" />
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full bg-[hsl(var(--eco-blue)/0.18)] blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-5 lg:gap-10 items-stretch">
          {/* ── LEFT: Bold statements + CTAs ── */}
          <div className="order-1 lg:order-1 text-left flex flex-col justify-center">
            <div className="space-y-2 sm:space-y-4 mb-5 sm:mb-8">
              {statements.map((line, i) => (
                <motion.h2
                  key={line}
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + i * 0.25,
                    type: "spring",
                    stiffness: 220,
                    damping: 14,
                  }}
                  className="text-[2rem] xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
                >
                  <span
                    className={
                      i === 0
                        ? "bg-gradient-to-r from-primary to-[hsl(var(--eco-green))] bg-clip-text text-transparent"
                        : i === 1
                        ? "bg-gradient-to-r from-[hsl(var(--eco-blue))] to-primary bg-clip-text text-transparent"
                        : "bg-gradient-to-r from-[hsl(var(--eco-orange))] via-[hsl(var(--eco-gold))] to-primary bg-clip-text text-transparent"
                    }
                  >
                    {line}
                  </span>
                </motion.h2>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-3 justify-start"
            >
              <Button
                size="lg"
                onClick={onPrimary}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-eco-md hover:shadow-eco-glow transition-all h-12 px-7 text-base font-semibold group"
              >
                Join the Movement
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onSecondary}
                className="h-12 px-7 text-base font-semibold border-primary/30 hover:bg-primary/5"
              >
                <Leaf className="w-4 h-4 text-primary" />
                Explore EcoSwarm
              </Button>
            </motion.div>
          </div>

          {/* ── RIGHT: Rotating / flipping image stack ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className="order-2 lg:order-2 h-full min-h-0 lg:min-h-[560px] mt-2 lg:mt-0"
          >
            <RotatingImageStack />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   RotatingImageStack
   - Cycles through hero images with a 3D flip.
   - Preserves focal point via object-cover.
   - Blurred backdrop fills letterboxing.
   ───────────────────────────────────────────── */
function RotatingImageStack() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % rotatingImages.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  const current = rotatingImages[index];

  return (
    <div className="relative w-full h-full flex flex-col" style={{ perspective: "1400px" }}>
      {/* Decorative floating accent cards behind main */}
      <div
        aria-hidden
        className="hidden md:block absolute -top-6 -left-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-[hsl(var(--eco-blue)/0.3)] blur-xl"
      />
      <div
        aria-hidden
        className="hidden md:block absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-[hsl(var(--eco-gold)/0.35)] to-[hsl(var(--eco-orange)/0.3)] blur-2xl"
      />

      <div
        className="relative w-full flex-1 aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[560px] rounded-3xl overflow-hidden shadow-lg ring-1 ring-border/40 bg-gradient-to-br from-[hsl(var(--eco-green-light))] via-background to-[hsl(var(--eco-blue-light))]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            {/* Blurred fill so any aspect ratio looks intentional */}
            <img
              src={current.src}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
            />
            <img
              src={current.src}
              alt={current.alt}
              loading="eager"
              decoding="async"
              className="relative w-full h-full object-cover object-center"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {rotatingImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}