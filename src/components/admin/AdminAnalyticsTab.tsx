import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, TrendingUp, Leaf, Mail, TreePine, ShoppingBag, GraduationCap } from 'lucide-react';

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
}

export function AdminAnalyticsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    const [profilesRes, productsRes, txRes, swarmsRes, completionsRes] = await Promise.all([
      supabase.from('profiles').select('eco_points, letters_sent, co2_saved'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('total_price, status'),
      supabase.from('swarms').select('id', { count: 'exact', head: true }),
      supabase.from('course_completions').select('id', { count: 'exact', head: true }),
    ]);

    const profiles = profilesRes.data || [];
    const completedTx = (txRes.data || []).filter((t: any) => t.status === 'completed');

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
    { label: 'Course Completions', value: stats.totalCourseCompletions.toLocaleString(), icon: GraduationCap, color: 'text-violet-600' },
    { label: 'Letters Sent', value: stats.totalLettersSent.toLocaleString(), icon: Mail, color: 'text-violet-600' },
    { label: 'CO₂ Saved (kg)', value: stats.totalCO2Saved.toLocaleString(), icon: TreePine, color: 'text-emerald-600' },
    { label: 'Products Listed', value: stats.totalProducts.toLocaleString(), icon: ShoppingBag, color: 'text-sky-600' },
    { label: 'Swarms Created', value: stats.totalSwarmsCreated.toLocaleString(), icon: Users, color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 pt-3">
      {cards.map((c) => (
        <div key={c.label} className="eco-card p-4 text-center">
          <c.icon className={`w-6 h-6 ${c.color} mx-auto mb-1.5`} />
          <p className="text-xl font-bold text-foreground">{c.value}</p>
          <p className="text-[10px] text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
