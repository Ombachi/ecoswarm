import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ShoppingBag, GraduationCap, Sparkles, type LucideIcon } from "lucide-react";
import featureMarket from "@/assets/feature-market.webp";
import featureLearn from "@/assets/feature-learn.webp";
import featureMerch from "@/assets/feature-advocate.avif";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  longDesc: string;
  image: string;
  gradient: string;
};

const items: Feature[] = [
  {
    icon: GraduationCap,
    title: "Capacity Hub",
    desc: "Learn boldly",
    longDesc:
      "Take expert-led climate courses, earn certificates, and build the practical skills that turn environmental passion into real-world impact.",
    image: featureLearn,
    gradient: "from-[hsl(var(--eco-orange))]/25 via-destructive/10 to-transparent",
  },
  {
    icon: ShoppingBag,
    title: "EcoMarket",
    desc: "Shop sustainably",
    longDesc:
      "Discover vetted eco-friendly products and services from Kenyan sellers. Every purchase supports local green businesses and a cleaner planet.",
    image: featureMarket,
    gradient: "from-secondary/20 via-[hsl(var(--eco-blue))]/15 to-transparent",
  },
  {
    icon: Sparkles,
    title: "EcoMerch",
    desc: "Wear the change",
    longDesc:
      "Browse sustainable merchandise — from seed-bomb apparel to refillable bottles — and carry the EcoSwarm message wherever you go.",
    image: featureMerch,
    gradient: "from-[hsl(var(--eco-gold))]/25 via-[hsl(var(--eco-orange))]/15 to-transparent",
  },
];

function StackedCard({
  feature,
  index,
  total,
  progress,
}: {
  feature: Feature;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Each card occupies a slice of the scroll progress
  const slice = 1 / total;
  const start = index * slice;
  const end = start + slice;

  // Cards beyond the first scale down + fade slightly as the next one covers them.
  const scale = useTransform(progress, [start, end], [1, index === total - 1 ? 1 : 0.94]);
  // Capacity Hub (index 2) keeps full opacity; others fade slightly as they stack.
  const opacity = useTransform(
    progress,
    [start, end],
    [1, index === total - 1 || index === 2 ? 1 : 0.6]
  );

  // Stagger the sticky offset so each card lands a little lower, giving the layered look.
  const topOffset = `calc(6rem + ${index * 14}px)`;
  const Icon = feature.icon;

  return (
    <div
      className="sticky"
      style={{ top: topOffset, zIndex: 30 + index }}
    >
      <motion.article
        style={{ scale, opacity }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-eco-lg"
      >
        {/* Full-bleed gradient background spans the entire card width */}
        <div
          className={`pointer-events-none absolute inset-0 w-full h-full bg-gradient-to-br ${feature.gradient}`}
          aria-hidden
        />
        <div className="relative grid md:grid-cols-2 gap-6 md:gap-10 p-6 md:p-10 lg:p-14 items-center">
          {/* Text */}
          <div className="order-2 md:order-1">
            <span className="eco-badge inline-flex mb-4">
              <Icon className="w-3.5 h-3.5" /> 0{index + 1}
            </span>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-3">
              {feature.title}
            </h3>
            <p className="text-lg md:text-xl font-semibold eco-gradient-text mb-4">
              {feature.desc}
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-prose">
              {feature.longDesc}
            </p>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/3] md:aspect-[5/4] w-full overflow-hidden rounded-2xl bg-muted shadow-eco-md">
              <img
                src={feature.image}
                alt={feature.title}
                loading="lazy"
                decoding="async"
                width={1024}
                height={768}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function StackedFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="features" className="relative z-20 isolate overflow-visible bg-background pt-10 pb-28 md:pt-16 md:pb-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left max-w-2xl mb-10 md:mb-16"
        >
          <span className="eco-badge mb-4 inline-flex">
            <Sparkles className="w-3.5 h-3.5" /> Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Learn. Shop. Impact.
          </h2>
          <p className="text-muted-foreground mt-3 md:text-lg">
            EcoSwarm is your one place for climate education and sustainable shopping. Scroll to explore.
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="relative"
          // Each card gets ~50vh on mobile / 70vh on desktop of scroll length.
          // Keeps the sticky stack tight and avoids a large empty gap before
          // the next section on small screens.
          style={{ height: `calc(clamp(${items.length * 50}vh, ${items.length * 60}vh, ${items.length * 70}vh) + 12rem)` }}
        >
          <div className="flex flex-col gap-6 md:gap-10">
            {items.map((f, i) => (
              <StackedCard
                key={f.title}
                feature={f}
                index={i}
                total={items.length}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
