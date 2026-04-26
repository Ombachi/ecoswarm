import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMain from "@/assets/hero-main.avif";
import heroCard1 from "@/assets/hero-card-1.avif";
import heroCard2 from "@/assets/hero-card-2.avif";
import heroCard3 from "@/assets/hero-card-3.avif";

interface PremiumHeroProps {
  onPrimary: () => void;
  onSecondary: () => void;
}

const supportingCards = [
  { src: heroCard1, alt: "Sustainable products marketplace" },
  { src: heroCard2, alt: "Community climate action" },
  { src: heroCard3, alt: "EcoWarriors planting trees" },
];

/**
 * Premium split-layout hero for EcoSwarm.
 * - Desktop: text left / main image right + 3 supporting cards beneath.
 * - Mobile: stacked, strongest image first, supporting cards in a swipeable row.
 * - All images use object-cover; containers have a soft green gradient background
 *   so any aspect-ratio mismatch is filled gracefully (no distortion).
 */
export function PremiumHero({ onPrimary, onSecondary }: PremiumHeroProps) {
  return (
    <section
      id="hero"
      className="relative pt-24 pb-16 md:pt-28 md:pb-24 overflow-hidden bg-gradient-to-b from-background via-background to-[hsl(var(--eco-green-light)/0.25)]"
    >
      {/* Ambient eco glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full bg-[hsl(var(--eco-blue)/0.18)] blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ── LEFT: Copy + CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 order-2 lg:order-1 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Kenya&apos;s Climate Action Network
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-foreground mb-5">
              Uniting Voices for{" "}
              <span className="bg-gradient-to-r from-primary via-[hsl(var(--eco-green))] to-[hsl(var(--eco-blue))] bg-clip-text text-transparent">
                Planet-Positive
              </span>{" "}
              Change
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Join thousands of EcoWarriors turning everyday actions into measurable climate impact —
              shop sustainably, learn boldly, and amplify your voice.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
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
            </div>
          </motion.div>

          {/* ── RIGHT: Main hero image ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-6 order-1 lg:order-2"
          >
            <HeroImageFrame
              src={heroMain}
              alt="EcoSwarm community in action"
              className="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/4] xl:aspect-[6/5]"
              priority
              float
            />
          </motion.div>
        </div>

        {/* ── Supporting cards ── */}
        <div className="mt-10 lg:mt-14">
          {/* Mobile: swipeable row */}
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:hidden -mx-4 px-4 scrollbar-hide">
            {supportingCards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="snap-start shrink-0 w-[72%]"
              >
                <HeroImageFrame src={c.src} alt={c.alt} className="aspect-[4/3]" />
              </motion.div>
            ))}
          </div>

          {/* Tablet/Desktop: 3-up grid */}
          <div className="hidden sm:grid grid-cols-3 gap-4 lg:gap-6">
            {supportingCards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="group transition-transform duration-300 hover:-translate-y-1"
              >
                <HeroImageFrame
                  src={c.src}
                  alt={c.alt}
                  className="aspect-[4/3] group-hover:shadow-eco-lg"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HeroImageFrame
   - Ensures any image fits gracefully:
     • object-cover with centered focal point
     • blurred duplicate fills letterboxing
     • soft green gradient backdrop
     • rounded corners + soft shadow
   ───────────────────────────────────────────── */
function HeroImageFrame({
  src,
  alt,
  className = "",
  priority = false,
  float = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  float?: boolean;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl shadow-eco-lg ring-1 ring-border/40 bg-gradient-to-br from-[hsl(var(--eco-green-light))] via-background to-[hsl(var(--eco-blue-light))] ${className} ${
        float ? "animate-[float_6s_ease-in-out_infinite]" : ""
      }`}
    >
      {/* Blurred backdrop fills any empty area without distortion */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
      />
      {/* Foreground image — never distorted */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="relative w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
      />
      {/* Subtle gloss */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10"
      />
    </div>
  );
}