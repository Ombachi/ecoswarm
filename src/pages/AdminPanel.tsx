import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, Mail, Users, Shield, AlertTriangle, Wallet, DollarSign,
  BarChart3, LogOut, Megaphone, Building2, Package, Truck, Loader2, Crown, FlaskConical, Home,
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


  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">EcoSwarm Control Panel</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={async () => { await logout(); toast.success('Logged out'); navigate('/'); }}>
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="analytics">
          <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 mb-4 h-auto bg-transparent p-0">
            {[
              { value: 'analytics', icon: BarChart3, label: 'Analytics', badge: 0 },
              { value: 'users', icon: Users, label: 'Users', badge: 0 },
              { value: 'courses', icon: GraduationCap, label: 'Courses', badge: 0 },
              { value: 'disputes', icon: AlertTriangle, label: 'Disputes', badge: badgeCounts.disputes },
              { value: 'payouts', icon: Wallet, label: 'Payouts', badge: badgeCounts.payouts },
              { value: 'transactions', icon: DollarSign, label: 'Txns', badge: 0 },
              { value: 'broadcast', icon: Megaphone, label: 'Broadcast', badge: 0 },
              { value: 'merch', icon: Package, label: 'Merch', badge: 0 },
              { value: 'orders', icon: Truck, label: 'Orders', badge: 0 },
              { value: 'experiments', icon: FlaskConical, label: 'A/B Tests', badge: 0 },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative flex flex-col items-center gap-1 p-3 rounded-xl border border-border/50 bg-card data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all h-auto"
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-[9px] flex items-center justify-center">{tab.badge}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="analytics"><AdminAnalyticsTab /></TabsContent>
          <TabsContent value="users"><AdminUsersTab /></TabsContent>
          <TabsContent value="courses"><AdminCoursesTab /></TabsContent>
          <TabsContent value="disputes"><AdminDisputesTab /></TabsContent>
          <TabsContent value="payouts"><AdminPayoutsTab /></TabsContent>
          <TabsContent value="transactions"><AdminTransactionsTab /></TabsContent>
          <TabsContent value="broadcast"><AdminBroadcastTab /></TabsContent>
          <TabsContent value="merch"><AdminMerchTab /></TabsContent>
          <TabsContent value="orders"><AdminOrdersTab /></TabsContent>
          <TabsContent value="experiments"><AdminExperimentsTab /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
