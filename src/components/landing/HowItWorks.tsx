import { motion } from "framer-motion";
import { MousePointerClick, Smartphone, Award } from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    title: "Pick a course or product",
    desc: "Browse the Capacity Hub for climate courses
      Browse the EcoMarket for sustainable products.",
  },
  {
    icon: Smartphone,
    title: "Learn or pay with M-Pesa",
    desc: "Work through the course sections at your pace
      Check out securely with M-Pesa.",
  },
  {
    icon: Award,
    title: "Get your certificate or delivery",
    desc: "Pass the quiz for a certificate 
      Track your order through to delivery.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 md:py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            How <span className="eco-gradient-text">EcoSwarm</span> works
          </h2>
          <p className="text-muted-foreground mt-3 md:text-lg"></p>
        </div>

        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="eco-card p-6 relative"
            >
              <span className="absolute top-5 right-5 text-4xl font-black text-muted-foreground/20">{i + 1}</span>
              <div className="w-12 h-12 rounded-2xl eco-gradient-bg flex items-center justify-center mb-4">
                <s.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
