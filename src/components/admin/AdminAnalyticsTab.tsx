import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, TrendingUp, Leaf, Mail, TreePine, ShoppingBag, GraduationCap, BookOpen } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalEcoPoints: number;
  totalLettersSent: number;
  totalSwarmsCreated: number;
  totalProducts: number;
  totalTransactions: number;
  totalRevenue: number;
  totalCO2Saved: number;
  totalCourseCompletions: number;
  totalCourses: number;
}

interface CourseCompletion {
  courseTitle: string;
  count: number;
}

export function AdminAnalyticsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [courseCompletions, setCourseCompletions] = useState<CourseCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    const [profilesRes, productsRes, txRes, swarmsRes, completionsRes, coursesRes, allCompletionsRes] = await Promise.all([
      supabase.from('profiles').select('eco_points, letters_sent, co2_saved'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('total_price, status'),
      supabase.from('swarms').select('id', { count: 'exact', head: true }),
      supabase.from('course_completions').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id, title', { count: 'exact' }),
      supabase.from('course_completions').select('module_id'),
    ]);

    const profiles = profilesRes.data || [];
    const completedTx = (txRes.data || []).filter((t: any) => t.status === 'completed');
    const courses = coursesRes.data || [];
    const allCompletions = allCompletionsRes.data || [];

    // Tally per-course completions
    const countMap: Record<string, number> = {};
    allCompletions.forEach((c: any) => {
      countMap[c.module_id] = (countMap[c.module_id] || 0) + 1;
    });
    const perCourse: CourseCompletion[] = courses.map((c: any) => ({
      courseTitle: c.title,
      count: countMap[c.id] || 0,
    })).sort((a, b) => b.count - a.count);
    setCourseCompletions(perCourse);

    setStats({
      totalUsers: profiles.length,
      totalEcoPoints: profiles.reduce((s, p) => s + (p.eco_points || 0), 0),
      totalLettersSent: profiles.reduce((s, p) => s + (p.letters_sent || 0), 0),
      totalCO2Saved: profiles.reduce((s, p) => s + Number(p.co2_saved || 0), 0),
      totalProducts: productsRes.count || 0,
      totalTransactions: completedTx.length,
      totalRevenue: completedTx.reduce((s: number, t: any) => s + Number(t.total_price), 0),
      totalSwarmsCreated: swarmsRes.count || 0,
      totalCourseCompletions: completionsRes.count || 0,
      totalCourses: coursesRes.count || 0,
    });
    setIsLoading(false);
  };

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-primary' },
    { label: 'EcoPoints Issued', value: stats.totalEcoPoints.toLocaleString(), icon: Leaf, color: 'text-emerald-600' },
    { label: 'GMV (KSh)', value: stats.totalRevenue.toLocaleString(), icon: TrendingUp, color: 'text-amber-600' },
    { label: 'Transactions', value: stats.totalTransactions.toLocaleString(), icon: ShoppingBag, color: 'text-primary' },
    { label: 'Total Courses', value: stats.totalCourses.toLocaleString(), icon: BookOpen, color: 'text-primary' },
    { label: 'Course Completions', value: stats.totalCourseCompletions.toLocaleString(), icon: GraduationCap, color: 'text-violet-600' },
    { label: 'Letters Sent', value: stats.totalLettersSent.toLocaleString(), icon: Mail, color: 'text-violet-600' },
    { label: 'CO₂ Saved (kg)', value: stats.totalCO2Saved.toLocaleString(), icon: TreePine, color: 'text-emerald-600' },
    { label: 'Products Listed', value: stats.totalProducts.toLocaleString(), icon: ShoppingBag, color: 'text-sky-600' },
    { label: 'Swarms Created', value: stats.totalSwarmsCreated.toLocaleString(), icon: Users, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-4 pt-3">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="eco-card p-4 text-center">
            <c.icon className={`w-6 h-6 ${c.color} mx-auto mb-1.5`} />
            <p className="text-xl font-bold text-foreground">{c.value}</p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Per-Course Completion Breakdown */}
      {courseCompletions.length > 0 && (
        <div className="eco-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Completions by Course
          </h3>
          <div className="space-y-2">
            {courseCompletions.map((cc, i) => {
              const maxCount = courseCompletions[0]?.count || 1;
              const pct = Math.round((cc.count / maxCount) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-0.5">
                    <span className="text-foreground text-xs truncate flex-1">{cc.courseTitle}</span>
                    <span className="text-muted-foreground text-xs ml-2">{cc.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
