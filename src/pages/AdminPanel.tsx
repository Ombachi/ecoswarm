import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, Mail, Users, Shield, AlertTriangle, Wallet, DollarSign,
  BarChart3, LogOut, Megaphone, Building2, Package, Truck, Loader2, Crown, FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';

// Extracted tab components
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';
import { AdminBroadcastTab } from '@/components/admin/AdminBroadcastTab';
import { AdminMerchTab } from '@/components/admin/AdminMerchTab';
import { AdminOrdersTab } from '@/components/admin/AdminOrdersTab';
import { AdminCoursesTab } from '@/components/admin/AdminCoursesTab';
import { AdminTemplatesTab } from '@/components/admin/AdminTemplatesTab';
import { AdminDisputesTab } from '@/components/admin/AdminDisputesTab';
import { AdminPayoutsTab } from '@/components/admin/AdminPayoutsTab';
import { AdminTransactionsTab } from '@/components/admin/AdminTransactionsTab';
import { AdminSponsorsTab } from '@/components/admin/AdminSponsorsTab';
import { AdminSubscriptionsTab } from '@/components/admin/AdminSubscriptionsTab';
import { AdminExperimentsTab } from '@/components/admin/AdminExperimentsTab';

export function AdminPanel() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useApp();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(!isAdmin);
  const [badgeCounts, setBadgeCounts] = useState({ disputes: 0, payouts: 0, sponsors: 0 });

  useEffect(() => {
    if (isAdmin) {
      setIsCheckingAdmin(false);
      loadBadgeCounts();
    } else if (user) {
      supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
        .then(({ data }) => {
          setIsCheckingAdmin(false);
          if (data) loadBadgeCounts();
        });
    }
  }, [user, isAdmin]);

  const loadBadgeCounts = async () => {
    const [d, p, s] = await Promise.all([
      supabase.from('transaction_disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('seller_payouts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('course_sponsorships').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    setBadgeCounts({
      disputes: d.count || 0,
      payouts: p.count || 0,
      sponsors: s.count || 0,
    });
  };

  if (isCheckingAdmin) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <Shield className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </AppLayout>
    );
  }

  const CountBadge = ({ count }: { count: number }) => count > 0 ? (
    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-[9px] flex items-center justify-center">{count}</span>
  ) : null;

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">EcoSwarm Control Panel</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={async () => { await logout(); toast.success('Logged out'); navigate('/'); }}>
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="analytics">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1.5">
            <TabsTrigger value="analytics" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><BarChart3 className="w-3.5 h-3.5" /> Analytics</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><Users className="w-3.5 h-3.5" /> Users</TabsTrigger>
            <TabsTrigger value="courses" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><GraduationCap className="w-3.5 h-3.5" /> Courses</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><Mail className="w-3.5 h-3.5" /> Letters</TabsTrigger>
            <TabsTrigger value="disputes" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2 relative"><AlertTriangle className="w-3.5 h-3.5" /> Disputes<CountBadge count={badgeCounts.disputes} /></TabsTrigger>
            <TabsTrigger value="payouts" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2 relative"><Wallet className="w-3.5 h-3.5" /> Payouts<CountBadge count={badgeCounts.payouts} /></TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><DollarSign className="w-3.5 h-3.5" /> Txns</TabsTrigger>
            <TabsTrigger value="broadcast" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><Megaphone className="w-3.5 h-3.5" /> Broadcast</TabsTrigger>
            <TabsTrigger value="sponsors" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2 relative"><Building2 className="w-3.5 h-3.5" /> Sponsors<CountBadge count={badgeCounts.sponsors} /></TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><Crown className="w-3.5 h-3.5" /> Premium</TabsTrigger>
            <TabsTrigger value="merch" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><Package className="w-3.5 h-3.5" /> Merch</TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><Truck className="w-3.5 h-3.5" /> Orders</TabsTrigger>
            <TabsTrigger value="experiments" className="gap-1.5 text-[10px] sm:text-xs px-2 py-2"><FlaskConical className="w-3.5 h-3.5" /> A/B Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics"><AdminAnalyticsTab /></TabsContent>
          <TabsContent value="users"><AdminUsersTab /></TabsContent>
          <TabsContent value="courses"><AdminCoursesTab /></TabsContent>
          <TabsContent value="templates"><AdminTemplatesTab /></TabsContent>
          <TabsContent value="disputes"><AdminDisputesTab /></TabsContent>
          <TabsContent value="payouts"><AdminPayoutsTab /></TabsContent>
          <TabsContent value="transactions"><AdminTransactionsTab /></TabsContent>
          <TabsContent value="broadcast"><AdminBroadcastTab /></TabsContent>
          <TabsContent value="sponsors"><AdminSponsorsTab /></TabsContent>
          <TabsContent value="subscriptions"><AdminSubscriptionsTab /></TabsContent>
          <TabsContent value="merch"><AdminMerchTab /></TabsContent>
          <TabsContent value="orders"><AdminOrdersTab /></TabsContent>
          <TabsContent value="experiments"><AdminExperimentsTab /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
