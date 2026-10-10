import { useEffect, useMemo, useState } from "react";
import { CourseCover } from "@/components/common/CourseCover";
import { courseCategoryUrl } from "@/lib/courseCategories";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, Clock, Search, ArrowRight, Award } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";

type Course = { image_url: string | null; id: string; title: string; description: string; duration: string | null; category: string | null };

export function PublicCoursesScreen() {
  const navigate = useNavigate();
  usePageMeta("Climate Academy Courses", "Free, practical climate courses with certificates from EcoSwarm.");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [params, setParams] = useSearchParams();
  const cat = params.get("category") || "All";
  const setCat = (category: string) => { const next = new URLSearchParams(params); if (category === "All") next.delete("category"); else next.set("category", category); setParams(next); };

  useEffect(() => {
    supabase.from("courses").select("id,title,description,duration,category,image_url").eq("is_active", true).order("sort_order")
      .then(({ data }) => { setCourses((data as Course[]) || []); setLoading(false); });
  }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean) as string[]))], [courses]);
  const list = courses.filter((c) => (cat === "All" || c.category === cat) &&
    (c.title + " " + c.description).toLowerCase().includes(q.toLowerCase()));

  return (
    <PublicLayout>
      <section className="border-b border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-3"><GraduationCap className="w-4 h-4" /> Climate Academy</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Learn climate skills that matter</h1>
          <p className="text-muted-foreground mt-3 md:text-lg max-w-2xl">Short, practical courses. Pass the quiz with 70% or more and earn a verifiable certificate. Free for every EcoWarrior.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses" className="pl-9" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
            {cats.map((c) => (
              <Button variant="outline" key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>{c}</Button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-2xl bg-muted animate-pulse" />)}</div>
        ) : list.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No courses match your search.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((c) => (
              <article key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                <CourseCover src={c.image_url} title={c.title} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-muted-foreground">
                    {c.category && <Button variant="ghost" size="sm" className="h-auto p-0 whitespace-normal text-left text-xs text-primary" onClick={() => navigate(courseCategoryUrl(c.category || ""))}>{c.category}</Button>}
                    {c.duration && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration}</span>}
                  </div>
                  <h2 className="font-bold text-lg leading-snug mb-2">{c.title}</h2>
                  <p className="text-sm text-muted-foreground flex-1">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Certificate on completion</p>
                  <Button className="mt-4 w-full" onClick={() => navigate(`/signup`)}>Start learning <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
