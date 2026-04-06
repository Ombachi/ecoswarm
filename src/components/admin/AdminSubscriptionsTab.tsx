import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, TrendingUp, DollarSign, Users, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  amount: number;
  starts_at: string;
  expires_at: string;
  mpesa_phone: string | null;
  mpesa_receipt: string | null;
  created_at: string;
}

export function AdminSubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');

  useEffect(() => { loadSubscriptions(); }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { toast.error('Failed to load subscriptions'); setLoading(false); return; }
    setSubscriptions(data || []);

    // Load profile names
    const userIds = [...new Set((data || []).map(s => s.user_id))];
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);
      const map: Record<string, string> = {};
      (profs || []).forEach(p => { map[p.user_id] = p.name; });
      setProfiles(map);
    }
    setLoading(false);
  };

  const toggleStatus = async (sub: Subscription) => {
    const newStatus = sub.status === 'active' ? 'cancelled' : 'active';
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', sub.id);

    if (error) { toast.error('Failed to update'); return; }

    // Notify user
    await supabase.from('notifications').insert({
      user_id: sub.user_id,
      type: 'subscription',
      title: newStatus === 'active' ? '🌟 Subscription Reactivated' : '⚠️ Subscription Cancelled',
      message: newStatus === 'active'
        ? 'Your premium subscription has been reactivated by an admin.'
        : 'Your premium subscription has been cancelled by an admin.',
    });

    toast.success(`Subscription ${newStatus === 'active' ? 'activated' : 'cancelled'}`);
    loadSubscriptions();
  };

  const now = new Date();
  const filtered = subscriptions.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'active') return s.status === 'active' && new Date(s.expires_at) > now;
    if (filter === 'expired') return new Date(s.expires_at) <= now;
    if (filter === 'cancelled') return s.status === 'cancelled';
    return true;
  });

  const activeCount = subscriptions.filter(s => s.status === 'active' && new Date(s.expires_at) > now).length;
  const totalRevenue = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + Number(s.amount), 0);
  const monthlyRevenue = subscriptions
    .filter(s => {
      const created = new Date(s.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    })
    .reduce((sum, s) => sum + Number(s.amount), 0);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Active Plans</p>
              <p className="text-xl font-bold text-foreground">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Subs</p>
              <p className="text-xl font-bold text-foreground">{subscriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-foreground">KSh {totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-xl font-bold text-foreground">KSh {monthlyRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'expired', 'cancelled'] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">
            {f}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Subscriptions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">User</TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Expires</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(sub => {
                const isExpired = new Date(sub.expires_at) <= now;
                const statusLabel = sub.status === 'cancelled' ? 'cancelled' : isExpired ? 'expired' : sub.status;
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="text-xs font-medium">{profiles[sub.user_id] || sub.user_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs capitalize">{sub.plan}</TableCell>
                    <TableCell>
                      <Badge variant={statusLabel === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">KSh {Number(sub.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{format(new Date(sub.expires_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() => toggleStatus(sub)}
                      >
                        {sub.status === 'active' ? (
                          <><XCircle className="w-3 h-3" /> Cancel</>
                        ) : (
                          <><CheckCircle className="w-3 h-3" /> Activate</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
