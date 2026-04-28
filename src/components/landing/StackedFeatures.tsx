import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { MessageCircle, ShoppingBag, Mail, Sparkles, type LucideIcon } from "lucide-react";
import featureAgora from "@/assets/feature-agora.webp";
import featureMarket from "@/assets/feature-market.webp";
import featureLearn from "@/assets/feature-learn.webp";
import featureAdvocate from "@/assets/feature-advocate.webp";

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
    icon: MessageCircle,
    title: "Agora Square",
    desc: "Share. Spark. Mobilize.",
    longDesc:
      "Post your stories, organize swarms and rally a community that turns conversation into climate action.",
    image: featureAgora,
    gradient: "from-primary/20 via-secondary/10 to-transparent",
  },
  {
    icon: ShoppingBag,
    title: "EcoMarket",
    desc: "Shop sustainably",
    longDesc:
      "Discover and list eco-friendly products and services from local organizations — and earn EcoPoints with every action.",
    image: featureMarket,
    gradient: "from-secondary/20 via-[hsl(var(--eco-blue))]/15 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Capacity Hub",
    desc: "Learn boldly",
    longDesc:
      "Take bite-sized climate courses, earn certificates and grow the skills that turn passion into real-world impact.",
    image: featureLearn,
    gradient: "from-[hsl(var(--eco-orange))]/25 via-destructive/10 to-transparent",
  },
  {
    icon: Mail,
    title: "EcoLetter Forge",
    desc: "Amplify your voice",
    longDesc:
      "Generate sharp, well-cited advocacy letters to decision-makers in seconds — no writer's block required.",
    image: featureAdvocate,
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
  const opacity = useTransform(progress, [start, end], [1, index === total - 1 ? 1 : 0.6]);

  // Stagger the sticky offset so each card lands a little lower, giving the layered look.
  const topOffset = `calc(6rem + ${index * 14}px)`;
  const Icon = feature.icon;

  return (
    <div
      className="sticky"
      style={{ top: topOffset, zIndex: 10 + index }}
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
    <section id="features" className="py-10 md:py-16 relative overflow-hidden">
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
            What You Can Do
          </h2>
          <p className="text-muted-foreground mt-3 md:text-lg">
            Four pillars. One movement. Scroll to see how EcoSwarm turns intention into impact.
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="relative"
          // Each card gets ~80vh of scroll length — tighter than 100vh
          // so sections flow closer together without large gaps.
          style={{ height: `${items.length * 80}vh` }}
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
