import { motion } from "framer-motion";
import { GraduationCap, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLandingNav } from "@/hooks/useLandingNav";

const paths = [
  {
    id: "learn",
    icon: GraduationCap,
    eyebrow: "Learn",
    title: "Climate courses with certificates",
    desc: "Short, practical courses built for Kenya — finish, pass the quiz, download a shareable certificate.",
    bullets: ["Self-paced sections", "Quiz at the end", "Verifiable certificate"],
    cta: "Browse courses",
    path: "/tools",
    accent: "from-primary to-secondary",
  },
  {
    id: "shop",
    icon: ShoppingBag,
    eyebrow: "Shop",
    title: "Products that don't cost the planet",
    desc: "Sustainable everyday goods from vetted Kenyan makers, paid for securely with M-Pesa.",
    bullets: ["Vetted eco products", "M-Pesa checkout", "Chat with the seller"],
    cta: "Shop EcoMarket",
    path: "/ecomarket",
    accent: "from-secondary to-[hsl(var(--eco-blue))]",
  },
];

export function TwoPathSplit() {
  const go = useLandingNav();

  return (
    <section id="paths" className="py-14 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Two paths, <span className="eco-gradient-text">one purpose</span>
          </h2>
          <p className="text-muted-foreground mt-3 md:text-lg">
            Pick where you want to start. Most EcoWarriors end up doing both.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {paths.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="eco-card p-6 md:p-8 flex flex-col"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-5`}
              >
                <p.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="eco-badge mb-3 inline-flex w-fit">{p.eyebrow}</span>
              <h3 className="text-2xl font-bold leading-snug mb-3">{p.title}</h3>
              <p className="text-muted-foreground mb-5">{p.desc}</p>
              <ul className="space-y-2 mb-7">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button className="mt-auto w-full" size="lg" onClick={() => go(p.path)}>
                {p.cta} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
