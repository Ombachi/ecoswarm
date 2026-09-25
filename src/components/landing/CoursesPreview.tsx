import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLandingNav } from "@/hooks/useLandingNav";

type Course = {
  id: string;
  title: string;
  description: string;
  duration: string | null;
  category: string | null;
};

export function CoursesPreview() {
  const go = useLandingNav();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("courses")
        .select("id,title,description,duration,category")
        .eq("is_active", true)
        .order("sort_order")
        .limit(6);
      setCourses(data || []);
    })();
  }, []);

  if (courses.length === 0) return null;

  return (
    <section id="courses" className="py-14 md:py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-12">
          <div className="max-w-2xl">
            <span className="eco-badge mb-4 inline-flex">
              <GraduationCap className="w-3.5 h-3.5" /> Climate Academy
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Courses built for climate action
            </h2>
            <p className="text-muted-foreground mt-3 md:text-lg">
              Short, practical climate courses with certificates you can share.
            </p>
          </div>
          <Button variant="outline" onClick={() => go("/tools")}>
            Browse all courses <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="eco-card p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                {c.category && <span className="eco-badge text-[10px]">{c.category}</span>}
                {c.duration && (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {c.duration}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg leading-snug mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{c.description}</p>
              <Button
                className="mt-4 w-full"
                onClick={() => go(`/module/${c.id}`)}
              >
                Start learning <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
