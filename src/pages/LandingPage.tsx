import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf, Users, MessageCircle, Globe, ArrowRight, Heart,
  TreePine, Megaphone, BookOpen, Shield, Mail, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/landing-hero.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stats = [
  { icon: Users, label: "Active Eco-Warriors", value: "2,500+" },
  { icon: TreePine, label: "Trees Pledged", value: "12,000+" },
  { icon: Megaphone, label: "Swarms Launched", value: "350+" },
  { icon: BookOpen, label: "Courses Completed", value: "8,200+" },
];

const features = [
  {
    icon: MessageCircle,
    title: "Agora Square",
    desc: "A public forum where eco-warriors share ideas, rally support, and amplify grassroots voices.",
  },
  {
    icon: Users,
    title: "Swarm Campaigns",
    desc: "Launch petitions and collective actions that turn individual passion into unstoppable movements.",
  },
  {
    icon: BookOpen,
    title: "Eco-Learning",
    desc: "Bite-sized courses on climate science, advocacy, and sustainability — earn points as you learn.",
  },
  {
    icon: Shield,
    title: "EcoMarket",
    desc: "Discover and promote verified eco-friendly products and services from across Kenya.",
  },
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
            <button onClick={() => scrollTo("about")} className="hover:text-foreground transition-colors">About</button>
            <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollTo("why")} className="hover:text-foreground transition-colors">Our Why</button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/role-select")} className="eco-gradient-bg text-primary-foreground border-0">
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
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div custom={0} variants={fadeUp} className="eco-badge mb-6">
              <Globe className="w-3.5 h-3.5" /> Your Digital Agora
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6"
            >
              Unite Voices for{" "}
              <span className="eco-gradient-text">Planet-Positive</span>{" "}
              Change
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8"
            >
              EcoSwarm empowers young Kenyans to organise, learn, and act on the
              environmental issues that matter most — one swarm at a time.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/role-select")}
                className="eco-gradient-bg text-primary-foreground border-0 text-base px-8 gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="text-base px-8"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <button
          onClick={() => scrollTo("stats")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce text-muted-foreground"
        >
          <ChevronDown className="w-7 h-7" />
        </button>
      </section>

      {/* ── Stats Bar ── */}
      <section id="stats" className="py-12 md:py-16 border-b border-border/50">
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

      {/* ── About ── */}
      <section id="about" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="eco-badge mb-4 inline-flex"><Heart className="w-3.5 h-3.5" /> About EcoSwarm</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              A <span className="eco-gradient-text">Digital Agora</span> for Climate Activism
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              EcoSwarm is a community-powered platform that transforms climate
              anxiety into collective action. We give every voice a megaphone and
              every action a ripple effect — connecting eco-warriors, organisations,
              and change-makers across Kenya and beyond.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div id="features" className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="eco-card-elevated flex gap-4 p-6"
              >
                <div className="w-12 h-12 rounded-xl eco-gradient-bg flex-shrink-0 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
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

      {/* ── Our Why ── */}
      <section id="why" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 eco-gradient-bg opacity-[0.04]" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <span className="eco-badge mb-4 inline-flex"><Leaf className="w-3.5 h-3.5" /> Our Why</span>
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              From Powerlessness to <span className="eco-gradient-text">Purpose</span>
            </h2>

            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Growing up in Kenya, I watched rivers shrink, forests disappear, and
                communities bear the brunt of a crisis they didn't create. The
                frustration of wanting to act — but feeling too small, too isolated,
                too voiceless — was overwhelming.
              </p>
              <p>
                EcoSwarm was born from that fire. It's the tool I wished I had: a
                place where one person's concern becomes a thousand people's campaign,
                where learning leads to doing, and where no voice is too quiet to
                matter.
              </p>
              <p className="font-semibold text-foreground text-lg">
                Our mission is simple: turn climate anxiety into collective power.
                Our vision is a generation that doesn't just inherit the Earth — but
                actively heals it.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/role-select")}
                className="eco-gradient-bg text-primary-foreground border-0 gap-2"
              >
                Join the Movement <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </div>
          </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Make Your Voice Count?
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
              Join thousands of eco-warriors already creating change. Sign up in
              seconds and start your first action today.
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
                onClick={() => navigate("/about")}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg eco-gradient-bg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-extrabold text-lg">EcoSwarm</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your Digital Agora — empowering communities to unite for
                planet-positive change.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/about")} className="hover:text-foreground transition-colors">About</button></li>
                <li><button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate("/feedback")} className="hover:text-foreground transition-colors">Feedback</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-sm">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@ecoswarm.app" className="hover:text-foreground transition-colors">hello@ecoswarm.app</a>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a href="https://ecoswarm.lovable.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">ecoswarm.lovable.app</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} EcoSwarm. Built with 💚 for the planet.
          </div>
        </div>
      </footer>
    </div>
  );
}
