import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  Users,
  MessageCircle,
  Globe,
  ArrowRight,
  Heart,
  TreePine,
  Megaphone,
  BookOpen,
  Shield,
  Mail,
  ChevronDown,
  Target,
  Eye,
  Sparkles,
  ShoppingBag,
  Zap,
  ExternalLink,
  X,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import heroImage from "@/assets/landing-hero.jpg";
import heroPlanting from "@/assets/hero-planting.jpg";
import heroRally from "@/assets/hero-rally.jpg";
import heroRenewable from "@/assets/hero-renewable.jpg";
import agoraImage from "@/assets/agora-history.jpg";

const heroImages = [heroImage, heroPlanting, heroRally, heroRenewable];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stats = [
  { icon: Users, label: "Active Eco-Warriors", value: "100+" },
  { icon: TreePine, label: "Ecoproducts Listed", value: "10+" },
  { icon: Megaphone, label: "Ecoletters Forged", value: "50+" },
  { icon: BookOpen, label: "Courses Completed", value: "100+" },
];

const features = [
  {
    icon: MessageCircle,
    title: "Agora Square",
    desc: "Share your stories, ideas, and experiences with a community that cares.",
    color: "from-primary to-secondary",
  },
  {
    icon: ShoppingBag,
    title: "EcoMarket",
    desc: "Discover and list eco-friendly products and services from local organizations.",
    color: "from-secondary to-[hsl(var(--eco-blue))]",
  },
  {
    icon: Mail,
    title: "EcoLetter Forge",
    desc: "Generate powerful advocacy letters to decision-makers.",
    color: "from-[hsl(var(--eco-gold))] to-[hsl(var(--eco-orange))]",
  },
  {
    icon: Sparkles,
    title: "Capacity Hub",
    desc: "Learn, grow, and earn points while building your activism skills.",
    color: "from-[hsl(var(--eco-orange))] to-destructive",
  },
];

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
    role: "Founder & Visionary",
    bio: "Passionate about transforming climate anxiety into collective action. Building EcoSwarm to give every voice a megaphone for the planet.",
    avatar: "🌱",
  },
];

const partners = [
  {
    name: "BeVisioneers",
    subtitle: "Mercedes-Benz Fellowship",
    desc: "Strategic partner in youth eco-innovation, empowering the next generation of environmental leaders.",
    icon: "🚀",
  },
  {
    name: "Litu Diagnostics",
    subtitle: "Medical & Telehealth Partner",
    desc: "Bringing health and sustainability together through innovative diagnostics and telehealth solutions.",
    icon: "🏥",
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

export function LandingPage() {
  const navigate = useNavigate();
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl eco-gradient-bg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">EcoSwarm</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <button onClick={() => scrollTo("about")} className="hover:text-foreground transition-colors">
              About
            </button>
            <button onClick={() => scrollTo("mission")} className="hover:text-foreground transition-colors">
              Mission
            </button>
            <button onClick={() => scrollTo("why")} className="hover:text-foreground transition-colors">
              Our Why
            </button>
            <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo("team")} className="hover:text-foreground transition-colors">
              Team
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/role-select")}
              className="eco-gradient-bg text-primary-foreground border-0"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0">
          {heroImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="EcoSwarm community action"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32 w-full">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6"
            >
              Uniting Voices for <span className="eco-gradient-text">Planet-Positive</span> Change
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8">
              EcoSwarm empowers you to organise, learn, and act on the environmental issues that matter most.
            </motion.p>
          </motion.div>
        </div>
        <button
          onClick={() => scrollTo("about")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce text-muted-foreground"
        >
          <ChevronDown className="w-7 h-7" />
        </button>
      </section>

      {/* ── About: Agora Story ── */}
      <section id="about" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="eco-badge mb-4 inline-flex">
              <Heart className="w-3.5 h-3.5" /> About EcoSwarm
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              A <span className="eco-gradient-text">Digital Agora</span> for Climate Activism
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              EcoSwarm is a community-powered platform that transforms climate anxiety into collective action.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={agoraImage} alt="The ancient Agora of Athens" className="w-full h-64 md:h-80 object-cover" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Inspired by the Ancient Agora</h3>
              <p className="text-muted-foreground leading-relaxed">
                In ancient Athens, the <strong>Agora</strong> was the beating heart of civic life — an open marketplace
                where citizens gathered to debate ideas, challenge power, and shape democracy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                EcoSwarm carries that spirit into the digital age.{" "}
                <span className="text-foreground font-semibold">Collective dialogue drives collective change.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section id="mission" className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 eco-gradient-bg opacity-[0.04]" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
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
                  <p className="text-sm text-muted-foreground">Why we exist</p>
                </div>
              </div>
              <p className="text-foreground leading-relaxed text-lg">
                To amplify voices, connect passions, and transform digital engagement into real-world impact.
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
                  <h2 className="text-2xl font-black text-foreground">Our Vision</h2>
                  <p className="text-sm text-muted-foreground">Where we're headed</p>
                </div>
              </div>
              <p className="text-foreground leading-relaxed text-lg">A digital agora for collective impact.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
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
      <section id="why" className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 eco-gradient-bg opacity-[0.04]" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <span className="eco-badge mb-4 inline-flex">
              <Heart className="w-3.5 h-3.5" /> Our Why
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              From Powerlessness to <span className="eco-gradient-text">Purpose</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A silent epidemic is gripping millions: <strong className="text-foreground">climate anxiety</strong>.
              Climate Anxiety is a profound emotional response to the escalating environmental crisis, leaving people
              feeling sad, anxious, angry, or utterly powerless. And while anxiety cuts across all ages, it is often
              most intense among the young.They are the ones who will inherit the long-term consequences of inaction.
            </p>
          </motion.div>

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
              <h3 className="text-lg font-bold text-foreground mb-3">Enter EcoSwarm 🐝</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A platform designed to bridge this gap and transform powerlessness into collective strength.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-[hsl(var(--eco-gold))] flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">
                    <strong>EcoSwarm empowers you to see the issues,name them,and do something about them.</strong>{" "}
                    Discover eco-products in our directory, earn EcoPoints for actions, and watch your efforts amplify
                    through swarms that turn one voice into thousands.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">
                    <strong>Issues are interconnected.</strong> Your voice matters on all fronts.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">
                    <strong>Collective action beats individual effort.</strong> Together, we blaze.
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

      {/* ── What You Can Do (after Enter EcoSwarm) ── */}
      <section id="features" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="eco-badge mb-4 inline-flex">
              <Sparkles className="w-3.5 h-3.5" /> Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-black">What You Can Do</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="eco-card-elevated flex gap-4 p-6"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex-shrink-0 flex items-center justify-center`}
                >
                  <f.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar (user statistics) ── */}
      <section id="stats" className="py-12 md:py-16 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <s.icon className="w-7 h-7 text-primary" />
              <span className="text-2xl md:text-3xl font-extrabold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Team & Partners (right below stats) ── */}
      <section id="team" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
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
                <div className="w-24 h-24 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-4 text-4xl">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-semibold mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="eco-card-elevated p-6 flex gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl flex-shrink-0">
                  {partner.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{partner.name}</h3>
                  <p className="text-xs text-primary font-semibold mb-2">{partner.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{partner.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="eco-gradient-bg rounded-3xl p-8 md:p-14 text-center text-primary-foreground"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Make Your Voice Count?</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              Join thousands of eco-warriors creating change.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/role-select")}
                className="bg-card text-primary hover:bg-card/90 border-0 gap-2 font-bold"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-primary-foreground text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 font-bold"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-12 md:py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg eco-gradient-bg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-extrabold text-lg">EcoSwarm</span>
              </div>
              <p className="text-sm text-muted-foreground">Your Digital Agora.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => scrollTo("about")} className="hover:text-foreground transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo("why")} className="hover:text-foreground transition-colors">
                    Our Why
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => navigate("/terms-of-service")}
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy-policy")}
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@ecoswarm.co.ke" className="hover:text-foreground transition-colors">
                    hello@ecoswarm.co.ke
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a
                    href="https://ecoswarm.co.ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    ecoswarm.co.ke
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} EcoSwarm. Built with 💚 for the planet.</p>
            <p>Made with 💚 for You</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
