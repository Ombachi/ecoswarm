import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, TrendingUp, Leaf, Mail, TreePine, ShoppingBag, GraduationCap, BookOpen, DollarSign, Eye, Search as SearchIcon, MousePointer } from 'lucide-react';

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
  totalCommissions: number;
  totalPageViews: number;
  totalSearches: number;
  totalActions: number;
}

interface CourseCompletion {
  courseTitle: string;
  count: number;
}

interface TopPage {
  page: string;
  views: number;
}

interface TopSearch {
  query: string;
  count: number;
}

export function AdminAnalyticsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [courseCompletions, setCourseCompletions] = useState<CourseCompletion[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [topSearches, setTopSearches] = useState<TopSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setIsLoading(true);
    const periodFilter = period === 'all' ? undefined : new Date(Date.now() - (period === '7d' ? 7 : 30) * 86400000).toISOString();

    const queries: Promise<any>[] = [
      supabase.from('profiles').select('eco_points, letters_sent, co2_saved'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('total_price, status'),
      supabase.from('swarms').select('id', { count: 'exact', head: true }),
      supabase.from('course_completions').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id, title', { count: 'exact' }),
      supabase.from('course_completions').select('module_id'),
      supabase.from('platform_commissions' as any).select('commission_amount'),
    ];

    // Platform analytics queries
    let analyticsQuery = supabase.from('platform_analytics' as any).select('event_type, event_data, page');
    if (periodFilter) analyticsQuery = analyticsQuery.gte('created_at', periodFilter);
    queries.push(analyticsQuery);

    const [profilesRes, productsRes, txRes, swarmsRes, completionsRes, coursesRes, allCompletionsRes, commissionsRes, analyticsRes] = await Promise.all(queries);

    const profiles = profilesRes.data || [];
    const completedTx = (txRes.data || []).filter((t: any) => t.status === 'completed');
    const courses = coursesRes.data || [];
    const allCompletions = allCompletionsRes.data || [];
    const commissions = commissionsRes.data || [];
    const analyticsData = analyticsRes.data || [];

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

    // Platform usage analytics
    const pageViewCounts: Record<string, number> = {};
    const searchCounts: Record<string, number> = {};
    let totalPageViews = 0;
    let totalSearches = 0;
    let totalActions = 0;

    analyticsData.forEach((e: any) => {
      if (e.event_type === 'page_view') {
        totalPageViews++;
        const pg = e.page || 'unknown';
        pageViewCounts[pg] = (pageViewCounts[pg] || 0) + 1;
      } else if (e.event_type === 'search') {
        totalSearches++;
        const q = e.event_data?.query || 'unknown';
        searchCounts[q] = (searchCounts[q] || 0) + 1;
      } else {
        totalActions++;
      }
    });

    setTopPages(
      Object.entries(pageViewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }))
    );

    setTopSearches(
      Object.entries(searchCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }))
    );

    const totalCommissions = commissions.reduce((s: number, c: any) => s + Number(c.commission_amount || 0), 0);

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
      totalCommissions,
      totalPageViews,
      totalSearches,
      totalActions,
    });
    setIsLoading(false);
  };

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-primary' },
    { label: 'EcoPoints Issued', value: stats.totalEcoPoints.toLocaleString(), icon: Leaf, color: 'text-emerald-600' },
    { label: 'GMV (KSh)', value: stats.totalRevenue.toLocaleString(), icon: TrendingUp, color: 'text-amber-600' },
    { label: 'Platform Revenue', value: `KSh ${stats.totalCommissions.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Transactions', value: stats.totalTransactions.toLocaleString(), icon: ShoppingBag, color: 'text-primary' },
    { label: 'Total Courses', value: stats.totalCourses.toLocaleString(), icon: BookOpen, color: 'text-primary' },
    { label: 'Course Completions', value: stats.totalCourseCompletions.toLocaleString(), icon: GraduationCap, color: 'text-violet-600' },
    { label: 'Letters Sent', value: stats.totalLettersSent.toLocaleString(), icon: Mail, color: 'text-violet-600' },
    { label: 'CO₂ Saved (kg)', value: stats.totalCO2Saved.toLocaleString(), icon: TreePine, color: 'text-emerald-600' },
    { label: 'Products Listed', value: stats.totalProducts.toLocaleString(), icon: ShoppingBag, color: 'text-sky-600' },
    { label: 'Swarms Created', value: stats.totalSwarmsCreated.toLocaleString(), icon: Users, color: 'text-amber-600' },
    { label: 'Page Views', value: stats.totalPageViews.toLocaleString(), icon: Eye, color: 'text-sky-600' },
    { label: 'Searches', value: stats.totalSearches.toLocaleString(), icon: SearchIcon, color: 'text-violet-600' },
    { label: 'User Actions', value: stats.totalActions.toLocaleString(), icon: MousePointer, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-4 pt-3">
      {/* Period selector */}
      <div className="flex gap-2">
        {(['7d', '30d', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="eco-card p-4 text-center">
            <c.icon className={`w-6 h-6 ${c.color} mx-auto mb-1.5`} />
            <p className="text-xl font-bold text-foreground">{c.value}</p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Revenue (Commission) Section */}
      <div className="eco-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Revenue Breakdown (10% Commission)
        </h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">KSh {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total GMV</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-600">KSh {stats.totalCommissions.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Platform Earnings</p>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      {topPages.length > 0 && (
        <div className="eco-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-600" />
            Most Visited Pages
          </h3>
          <div className="space-y-2">
            {topPages.map((tp, i) => {
              const maxViews = topPages[0]?.views || 1;
              const pct = Math.round((tp.views / maxViews) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-0.5">
                    <span className="text-foreground text-xs truncate flex-1">{tp.page}</span>
                    <span className="text-muted-foreground text-xs ml-2">{tp.views}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Searches */}
      {topSearches.length > 0 && (
        <div className="eco-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-violet-600" />
            Top Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {topSearches.map((ts, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-foreground">
                "{ts.query}" <span className="text-muted-foreground">({ts.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

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
