import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import merch from "@/assets/hero-shop-1.avif";
import cleaning from "@/assets/hero-community-restoration.jpg";
import caring from "@/assets/hero-planting.jpg";
import reading from "@/assets/hero-learn-1.avif";
import happy from "@/assets/hero-community-action-day.jpg";

const moments = [
  { src: merch, label: "Wearing our merch", span: "md:col-span-2 md:row-span-2" },
  { src: cleaning, label: "Cleaning up our spaces", span: "" },
  { src: caring, label: "Caring for the planet", span: "" },
  { src: reading, label: "Reading & learning", span: "" },
  { src: happy, label: "Happy together", span: "" },
];

export function LiveTheChange() {
  return (
    <section id="live-the-change" className="py-14 md:py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <span className="eco-badge mb-4 inline-flex">
            <Leaf className="w-3.5 h-3.5" /> Live the change
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Real people, <span className="eco-gradient-text">real change</span>
          </h2>
          <p className="text-muted-foreground mt-3 md:text-lg">
            Our community wears the change, cleans up, plants, reads and grows together.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[520px]">
          {moments.map((m, i) => (
            <motion.figure
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`relative overflow-hidden rounded-2xl aspect-square md:aspect-auto ${m.span} ${
                i === 0 ? "col-span-2 aspect-[4/3]" : ""
              }`}
            >
              <img
                src={m.src}
                alt={m.label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-foreground/70 to-transparent text-background text-sm font-semibold">
                {m.label}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
