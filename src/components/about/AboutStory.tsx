import { motion } from "framer-motion";
import { Leaf, Users, Globe, Heart, ShoppingBag, BookOpen, Target, Eye, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import whyDistress from "@/assets/why-distress.avif";
import agoraImage from "@/assets/agora-history.jpg";
import founderPhoto from "@/assets/founder-ombachi-enock.jpg";
import bevisioneersLogo from "@/assets/partner-bevisioneers.png";
import lituLogo from "@/assets/partner-litu-diagnostics.jpg";

const values = [
  { emoji: "🌍", title: "Global Mindset", desc: "Think globally, act locally" },
  { emoji: "🤝", title: "Collective Power", desc: "Together we achieve more" },
  { emoji: "📢", title: "Amplified Voices", desc: "Every voice deserves to be heard" },
  { emoji: "🔥", title: "Passionate Action", desc: "Turn passion into real change" },
];

const globalStats = [
  {
    value: "59%",
    label: "of youth very or extremely worried about climate change",
    icon: "😰",
    color: "from-destructive/80 to-destructive",
  },
  {
    value: "83%",
    label: "believe adults have failed to care for the planet",
    icon: "💔",
    color: "from-[hsl(var(--eco-orange))] to-destructive",
  },
  {
    value: "45%",
    label: "say climate anxiety negatively affects their daily functioning",
    icon: "🧠",
    color: "from-secondary to-primary",
  },
  {
    value: "2.35%",
    label: "of the global population experiences clinical-level eco-distress",
    icon: "🏥",
    color: "from-primary to-secondary",
  },
  {
    value: "15.4%",
    label: "face persistent subclinical climate distress",
    icon: "😔",
    color: "from-[hsl(var(--eco-gold))] to-[hsl(var(--eco-orange))]",
  },
];

const kenyaStats = [
  {
    value: "36.1%",
    label: "of consumers familiar with green/sustainable products",
    icon: "🇰🇪",
    color: "from-primary to-secondary",
  },
  {
    value: "53.7%",
    label: "had never even heard of sustainable products",
    icon: "❓",
    color: "from-destructive/80 to-[hsl(var(--eco-orange))]",
  },
  {
    value: "39.5%",
    label: "cited unavailability as a major barrier to buying green",
    icon: "🚫",
    color: "from-secondary to-[hsl(var(--eco-blue))]",
  },
  {
    value: "1–3%",
    label: "green products' share of overall market — despite 70% willingness to buy",
    icon: "📉",
    color: "from-[hsl(var(--eco-gold))] to-primary",
  },
];

const team = [
  {
    name: "Ombachi Enock",
    role: "Visionary",
    bio: "Passionate about transforming climate anxiety into collective action. Building EcoSwarm to give every voice a megaphone for the planet.",
    photo: founderPhoto,
  },
];

const partners = [
  {
    name: "BeVisioneers",
    subtitle: "Mercedes-Benz Fellowship",
    desc: "Strategic partner in youth eco-innovation, empowering the next generation of environmental leaders.",
    logo: bevisioneersLogo,
    url: "https://bevisioneers.world",
  },
  {
    name: "Litu Diagnostics",
    subtitle: "Medical & Telehealth Partner",
    desc: "Bringing health and sustainability together through innovative diagnostics and telehealth solutions.",
    logo: lituLogo,
    url: "https://litudiagnostics.com",
  },
];

function StatCard({ stat, index }: { stat: (typeof globalStats)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 p-5"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.07]`} />
      <div className="relative z-10">
        <span className="text-3xl mb-2 block">{stat.icon}</span>
        <p className="text-3xl md:text-4xl font-black text-foreground mb-1">{stat.value}</p>
        <p className="text-sm text-muted-foreground leading-snug">{stat.label}</p>
      </div>
    </motion.div>
  );
}

/** Full EcoSwarm story: about, mission, vision, values, why, research stats, founders, partners. */
export function AboutStory() {
  return (
    <>
      {/* ── About: Agora Story ── */}
      <section id="about" className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="eco-badge mb-4 inline-flex">About EcoSwarm</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Kenya's Home for <span className="eco-gradient-text">Climate Learning</span> &{" "}
              <span className="eco-gradient-text">Green Shopping</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              EcoSwarm makes climate knowledge accessible and sustainable products easy to find.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={agoraImage}
                alt="EcoSwarm community learning and shopping"
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Education and commerce can work together for the planet. EcoSwarm offers
                <strong> expert-led climate courses</strong> that build real skills, and an
                <strong> EcoMarket</strong> where every purchase supports local green businesses.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you are here to learn or to shop, you are helping build a more climate-literate, sustainable
                Kenya.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section id="mission" className="py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 eco-gradient-bg opacity-[0.04]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="eco-card-elevated p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Our Mission</h2>
                </div>
              </div>
              <p className="text-foreground leading-relaxed text-lg">
                To make climate education and sustainable products accessible to every Kenyan.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="eco-card-elevated p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--eco-gold))] to-[hsl(var(--eco-orange))] flex items-center justify-center">
                  <Eye className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Where we're headed</p>
                </div>
              </div>
              <p className="text-foreground leading-relaxed text-lg">
                A climate-literate Kenya where sustainable living is the easy choice.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black">Our Values</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="eco-card-elevated p-6 text-center"
              >
                <span className="text-4xl mb-3 block">{value.emoji}</span>
                <h3 className="font-bold text-foreground mb-1">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Why ── */}
      <section id="why" className="pt-4 pb-10 md:pt-6 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 eco-gradient-bg opacity-[0.04]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-left max-w-[640px]"
            >
              <span className="eco-badge mb-4 inline-flex">About EcoSwarm</span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Close the <span className="eco-gradient-text">Green Gap</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Many Kenyans want to live sustainably, but don't know where to start or what to trust. EcoSwarm solves
                both problems: we turn climate knowledge into simple, practical courses, and we curate real eco-friendly
                products you can buy with confidence.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                By combining <strong className="text-foreground">learning</strong> with{" "}
                <strong className="text-foreground">responsible commerce</strong>, we make it easier for every
                EcoWarrior to turn intention into impact.
              </p>
            </motion.div>

            {/* Right: supporting image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative w-full h-full min-h-[320px] lg:min-h-[420px] rounded-3xl overflow-hidden shadow-lg ring-1 ring-border/40"
            >
              <img
                src={whyDistress}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
              />
              <img
                src={whyDistress}
                alt="Sustainable living and climate learning in Kenya"
                loading="lazy"
                decoding="async"
                className="relative w-full h-full object-cover object-center"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/30 via-transparent to-transparent"
              />
            </motion.div>
          </div>

          {/* Global Stats */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-6"
            >
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Global Climate Anxiety</h3>
              <span className="text-xs text-muted-foreground ml-2">10,000 youth across 10 countries</span>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {globalStats.map((s, i) => (
                <StatCard key={s.value} stat={s} index={i} />
              ))}
            </div>
          </div>

          {/* Kenya Stats */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-xl">🇰🇪</span>
              <h3 className="text-xl font-bold text-foreground">Kenya's Green Gap</h3>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kenyaStats.map((s, i) => (
                <StatCard key={s.value} stat={s} index={i} />
              ))}
            </div>
          </div>

          {/* Enter EcoSwarm */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="eco-card p-6 bg-gradient-to-br from-[hsl(var(--eco-green-light))] to-[hsl(var(--eco-blue-light))] border-none mb-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                EcoSwarm closes Kenya's green gap by pairing practical climate education with easy access to sustainable products.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-[hsl(var(--eco-gold))] flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">
                    <strong>Learn.</strong> Short Climate Academy courses with verifiable certificates.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ShoppingBag className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">
                    <strong>Shop.</strong> Vetted eco-friendly products from Kenyan makers and
                    sellers.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">
                    <strong>Live the change.</strong> Turn knowledge and better choices into everyday habits.
                  </span>
                </li>
              </ul>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View Sources & Citations
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Research Sources</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Global Climate Anxiety Study</p>
                    <p className="text-muted-foreground">
                      Hickman et al., <em>The Lancet Planetary Health</em>, 2021.
                    </p>
                    <a
                      href="https://doi.org/10.1016/S2542-5196(21)00278-3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Read the study
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Kenya Green Consumerism Study</p>
                    <p className="text-muted-foreground">
                      Gekonge et al., <em>East African Journal of Science, Technology and Innovation</em>, 2021.
                    </p>
                    <a
                      href="https://eajsti.org/index.php/EAJSTI/article/view/334"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Read the study
                    </a>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>
      {/* ── Team & Partners (right below stats) ── */}
      <section id="team" className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="eco-badge mb-4 inline-flex">
              <Award className="w-3.5 h-3.5" /> People
            </span>
            <h2 className="text-3xl md:text-4xl font-black">Our Team & Partners</h2>
          </motion.div>
          <div className="grid md:grid-cols-1 gap-6 max-w-lg mx-auto mb-12">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="eco-card-elevated p-8 text-center"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-primary/20 shadow-lg">
                  <img
                    src={member.photo}
                    alt={`${member.name}, ${member.role} of EcoSwarm`}
                    loading="lazy"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-semibold mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {partners.map((partner, i) => (
              <motion.a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${partner.name} website (opens in new tab)`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="eco-card-elevated p-6 flex gap-4 group transition-shadow hover:shadow-xl cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    loading="lazy"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-primary font-semibold mb-2">{partner.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{partner.desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
