import { useState, useEffect, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useApp } from "@/context/AppContext";
import { SwahiliToggle } from "@/components/common/SwahiliToggle";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { EcoSwarmChatbot } from "@/components/chat/EcoSwarmChatbot";
import { useVisibilityRefetch } from "@/hooks/useVisibilityRefetch";
import { getLatestCourseProgress, CourseProgress } from "@/lib/courseProgress";
import {
  ShoppingBag, Moon, Sun, LogOut, GraduationCap,
  ArrowRight, Play, ChevronRight,

} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  duration: string | null;
}

interface Product {
  id: string;
  product_name: string;
  price: number;
  media_url: string | null;
  org_name: string | null;
}


export function DashboardScreen() {
  const navigate = useNavigate();
  const { user, isDarkMode, toggleDarkMode, isSwahili, refreshUser, logout } = useApp();
  usePageMeta('Home', 'Continue learning climate courses and discover sustainable products on EcoSwarm.');

  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  const loadFeed = useCallback(async () => {
    const [coursesRes, productsRes] = await Promise.all([
      supabase.from("courses").select("id,title,description,category,duration").order("created_at", { ascending: false }).limit(8),
      supabase.from("products").select("id,product_name,price,media_url,org_name").order("created_at", { ascending: false }).limit(8),
    ]);
    setCourses((coursesRes.data as Course[]) || []);
    setProducts((productsRes.data as Product[]) || []);
    setProgress(getLatestCourseProgress());
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handleVisibilityRefetch = useCallback(() => {
    if (user) { refreshUser(); loadFeed(); }
  }, [user, refreshUser, loadFeed]);

  useVisibilityRefetch(handleVisibilityRefetch);

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const resumeCourse = progress;
  const resumePercent = resumeCourse
    ? Math.min(Math.round(((resumeCourse.section + 1) / Math.max(resumeCourse.total, 1)) * 100), 100)
    : 0;

  const newCourses = courses.filter((c) => c.id !== resumeCourse?.courseId);


  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <SwahiliToggle />
            <NotificationBell />
            <button onClick={toggleDarkMode} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all" aria-label="Toggle theme">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={logout} className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all" title={isSwahili ? "Ondoka" : "Log Out"}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Continue learning — biggest card */}
        <section>
          <h2 className="font-semibold text-foreground mb-3">
            {isSwahili ? "Endelea Kusoma" : "Continue learning"}
          </h2>
          {resumeCourse ? (
            <button
              onClick={() => navigate(`/module/${resumeCourse.courseId}`)}
              className="eco-card-elevated w-full text-left p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div className="w-full h-full eco-gradient-bg rounded-full blur-2xl" />
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    {isSwahili ? "Sehemu" : "Section"} {resumeCourse.section + 1} {isSwahili ? "ya" : "of"} {resumeCourse.total}
                  </p>
                  <h3 className="text-lg font-bold text-foreground leading-snug mb-3 line-clamp-2">
                    {resumeCourse.courseTitle}
                  </h3>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full eco-gradient-bg rounded-full transition-all" style={{ width: `${resumePercent}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{resumePercent}% {isSwahili ? "imekamilika" : "complete"}</p>
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate("/tools")}
              className="eco-card-elevated w-full text-left p-6 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">
                  {isSwahili ? "Anza kozi yako ya kwanza" : "Start your first course"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSwahili ? "Jifunze na upate cheti" : "Learn climate skills and earn a certificate"}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </section>

        {/* New courses for you */}
        {newCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">
                {isSwahili ? "Kozi Mpya Kwako" : "New courses for you"}
              </h2>
              <button onClick={() => navigate("/tools")} className="text-xs font-medium text-primary inline-flex items-center">
                {isSwahili ? "Zote" : "See all"} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1 snap-x">
              {newCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/module/${c.id}`)}
                  className="eco-card p-4 w-[15rem] flex-shrink-0 text-left snap-start"
                >
                  <div className="w-9 h-9 rounded-xl eco-gradient-bg flex items-center justify-center mb-3">
                    <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {c.category && <span className="eco-badge text-[10px]">{c.category}</span>}
                    {c.duration && <span className="text-[10px] text-muted-foreground">{c.duration}</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Fresh in EcoMarket */}
        {products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">
                {isSwahili ? "Mpya katika EcoMarket" : "Fresh in EcoMarket"}
              </h2>
              <button onClick={() => navigate("/ecomarket")} className="text-xs font-medium text-primary inline-flex items-center">
                {isSwahili ? "Zote" : "See all"} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1 snap-x">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate("/ecomarket")}
                  className="eco-card w-[10.5rem] flex-shrink-0 text-left overflow-hidden snap-start"
                >
                  <div className="w-full h-28 bg-muted">
                    {p.media_url ? (
                      <img src={p.media_url} alt={p.product_name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{p.product_name}</h3>
                    {p.org_name && <p className="text-[10px] text-muted-foreground truncate">{p.org_name}</p>}
                    <p className="text-sm font-bold eco-gradient-text mt-1">KES {p.price?.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>


      <EcoSwarmChatbot />
    </AppLayout>
  );
}
