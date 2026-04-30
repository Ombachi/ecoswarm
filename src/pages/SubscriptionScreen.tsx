import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ChevronLeft, Crown, ShieldCheck, TrendingDown,
  Phone, Loader2, Check, Star, BarChart3, Zap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SubscriptionScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  usePageMeta('Premium Subscription', 'Upgrade to EcoDeveloper Premium for priority listings, reduced commission, and a verified badge.');

  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [phone, setPhone] = useState('');
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkStatus();
    checkRole();
  }, [user]);

  const checkRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    setIsDeveloper(data?.role === 'ecodeveloper');
  };

  const checkStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-subscription', {
        body: { action: 'check' },
      });
      if (!error && data) {
        setIsPremium(data.isPremium);
        setSubscription(data.subscription);
      }
    } catch (e) {
      console.error('Failed to check subscription:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!phone.trim()) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }
    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-subscription', {
        body: { action: 'subscribe', phoneNumber: phone.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('🌟 Premium subscription activated!');
      setIsPremium(true);
      setSubscription(data.subscription);
    } catch (e: any) {
      toast.error(e.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const perks = [
    { icon: Zap, title: 'Priority Listing', desc: 'Your products appear first in EcoMarket search results' },
    { icon: TrendingDown, title: '5% Commission', desc: 'Reduced platform commission (down from 10%)' },
    { icon: ShieldCheck, title: 'Verified Badge', desc: 'Trusted seller badge on all your products' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Detailed sales analytics and product insights' },
  ];

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Premium</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <Crown className="w-10 h-10 mb-3" />
          <h2 className="text-2xl font-bold">EcoDeveloper Premium</h2>
          <p className="text-amber-100 mt-1">Grow your green business faster</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold">KSh 500</span>
            <span className="text-amber-200">/month</span>
          </div>
        </div>

        {/* Status badge */}
        {isPremium && subscription && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Check className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">Premium Active</p>
              <p className="text-xs text-muted-foreground">
                Expires {new Date(subscription.expires_at).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* Perks */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Premium Perks</h3>
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <perk.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{perk.title}</p>
                <p className="text-xs text-muted-foreground">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe / Not eligible */}
        {!isPremium && !loading && (
          isDeveloper ? (
            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-foreground">Subscribe via M-Pesa</h3>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. 0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {subscribing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><Crown className="w-4 h-4 mr-2" /> Subscribe — KSh 500/mo</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                An M-Pesa prompt will be sent to your phone. Subscription auto-renews monthly.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-xl text-center">
              <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Premium is available for EcoDeveloper accounts. Switch to an EcoDeveloper role to unlock.
              </p>
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
