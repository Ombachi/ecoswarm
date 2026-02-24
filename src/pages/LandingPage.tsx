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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/landing-hero.jpg";
import agoraImage from "@/assets/agora-history.jpg";

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

export function LandingPage() {
  const navigate = useNavigate();

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
          <img src={heroImage} alt="Community planting trees" className="w-full h-full object-cover" />
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

      {/* ── About: The Agora Story ── */}
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
              EcoSwarm is a community-powered platform that transforms climate anxiety into collective action. We give
              every voice a megaphone and every action a ripple effect by connecting eco-warriors, organisations, and
              change-makers across Kenya and beyond.
            </p>
          </motion.div>

          {/* Agora History */}
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
                In ancient Athens, the <strong>Agora</strong> was the beating heart of civic life .The Agora was an open
                marketplace where citizens gathered not just to trade, but to debate ideas, challenge power, and shape
                democracy. Philosophers like Socrates stood among potters and farmers, proving that every voice,
                regardless of status, could reshape society.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                EcoSwarm carries that spirit into the digital age. Where the Athenians debated governance,{" "}
                <strong>we debate the planet's future</strong>. Where they gathered in marble-columned squares, we
                gather on screens The principle is the same:{" "}
                <span className="text-foreground font-semibold">collective dialogue drives collective change.</span>
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
            className="max-w-3xl mx-auto"
          >
            <span className="eco-badge mb-4 inline-flex">
              <Heart className="w-3.5 h-3.5" /> Our Why
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              From Powerlessness to <span className="eco-gradient-text">Purpose</span>
            </h2>

            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                In an era where the planet's distress signals are louder than ever, a silent epidemic is gripping the
                hearts and minds of millions: climate anxiety, or eco-distress. This is a profound emotional response to
                the escalating environmental crisis, leaving people feeling sad, anxious, angry, or utterly powerless.
                International studies paint a stark picture: Over 50% to 60% of young people aged 16–25 report these
                feelings, with a 2021 global survey of 10,000 youth across 10 countries revealing that 83% believe
                adults have failed to care for the planet, and over 45% say it negatively affects their daily
                functioning. Closer to home in Kenya, where droughts and floods ravage communities, the toll is even
                more acute. Globally, 2.35% of the population experiences symptoms reaching clinical levels, while 15.4%
                face milder but persistent subclinical distress. And while anxiety cuts across all ages, it is often
                most intense among the young.They are the ones who will inherit the long-term consequences of inaction.
                Yet, in a cruel irony, leaders of consequence continue to label climate change a "hoax," dismissing the
                science even as lived experiences scream the truth. Our rivers have dried up, turning once-fertile lands
                into parched wastelands. Wildfires consume neighborhoods, inaccurate meteorological predictions leave us
                blindsided, and rising temperatures scorch the earth, melting glaciers and thinning the ozone layer.
              </p>
              <p>
                Enter EcoSwarm A platform designed to bridge this gap and transform powerlessness into collective
                strength. EcoSwarm empowers you to see the issues,name them,and do something about them. Discover
                eco-products in our directory, earn EcoPoints for actions, and watch your efforts amplify through swarms
                that turn one voice into thousands.
              </p>
              <div className="eco-card p-5 bg-gradient-to-br from-[hsl(var(--eco-green-light))] to-[hsl(var(--eco-blue-light))] border-none">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[hsl(var(--eco-gold))] flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">
                      <strong>Social media is loud.</strong> We turn noise into real momentum.
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
                      <strong>Collective action beats individual effort.</strong> One spark alone flickers — together,
                      we blaze.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── What You Can Do ── */}
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

      {/* ── Stats Bar ── */}
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
              Join thousands of eco-warriors already creating change. Sign up in seconds and start your first action
              today.
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
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg eco-gradient-bg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-extrabold text-lg">EcoSwarm</span>
              </div>
              <p className="text-sm text-muted-foreground">Your Digital Agora.</p>
            </div>

            {/* Platform */}
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
                <li>
                  <button onClick={() => navigate("/role-select")} className="hover:text-foreground transition-colors">
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Info */}
            <div>
              <h4 className="font-bold mb-3 text-sm">Legal &amp; Info</h4>
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

            {/* Connect */}
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
