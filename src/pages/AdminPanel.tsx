import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Mail,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Shield,
  BookOpen,
  AlertTriangle,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  LogOut,
  Megaphone,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { CourseContentEditor } from '@/components/admin/CourseContentEditor';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  points: number;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface LetterTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  is_active: boolean;
  sort_order: number;
}

interface Recipient {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  is_active: boolean;
  sort_order: number;
}

interface Dispute {
  id: string;
  transaction_id: string;
  raised_by: string;
  reason: string;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface Payout {
  id: string;
  seller_id: string;
  amount: number;
  status: string;
  mpesa_phone: string | null;
  mpesa_receipt: string | null;
  created_at: string;
  processed_at: string | null;
}

interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_name: string;
  points_used: number;
  cash_paid: number;
  total_price: number;
  status: string;
  payment_method: string | null;
  verification_status: string | null;
  mpesa_receipt: string | null;
  created_at: string;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useApp();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(!isAdmin);

  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile name cache
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  // Edit modal state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'course' | 'template' | 'recipient' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingContentCourseId, setEditingContentCourseId] = useState<string | null>(null);
  const [editingContentCourseTitle, setEditingContentCourseTitle] = useState('');

  // Dispute resolution modal
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Payout approval
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      setIsCheckingAdmin(false);
      loadAll();
    } else if (user) {
      // Fallback check for direct URL navigation
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()
        .then(({ data }) => {
          setIsCheckingAdmin(false);
          if (data) loadAll();
        });
    }
  }, [user, isAdmin]);

  const loadAll = async () => {
    setIsLoading(true);
    const [c, t, r, d, p, tx] = await Promise.all([
      supabase.from('courses').select('*').order('sort_order'),
      supabase.from('letter_templates').select('*').order('sort_order'),
      supabase.from('recipients').select('*').order('sort_order'),
      supabase.from('transaction_disputes').select('*').order('created_at', { ascending: false }),
      supabase.from('seller_payouts').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setCourses(c.data || []);
    setTemplates(t.data || []);
    setRecipients(r.data || []);
    setDisputes((d.data as Dispute[]) || []);
    setPayouts((p.data as Payout[]) || []);
    setTransactions((tx.data as Transaction[]) || []);

    // Collect unique user IDs to resolve names
    const userIds = new Set<string>();
    (d.data || []).forEach((item: any) => userIds.add(item.raised_by));
    (p.data || []).forEach((item: any) => userIds.add(item.seller_id));
    (tx.data || []).forEach((item: any) => { userIds.add(item.buyer_id); userIds.add(item.seller_id); });

    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, name')
        .in('user_id', Array.from(userIds));
      const names: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { if (p.user_id) names[p.user_id] = p.name || 'Unknown'; });
      setProfileNames(names);
    }

    setIsLoading(false);
  };

  const getName = (userId: string) => profileNames[userId] || userId.slice(0, 8);

  const openCreate = (type: 'course' | 'template' | 'recipient') => {
    setEditType(type);
    if (type === 'course') {
      setEditingItem({ title: '', description: '', duration: '15 min', points: 30, category: 'Knowledge', is_active: true, sort_order: courses.length + 1 });
    } else if (type === 'template') {
      setEditingItem({ title: '', category: '', content: '', is_active: true, sort_order: templates.length + 1 });
    } else {
      setEditingItem({ name: '', title: '', organization: '', email: '', is_active: true, sort_order: recipients.length + 1 });
    }
  };

  const openEdit = (item: any, type: 'course' | 'template' | 'recipient') => {
    setEditType(type);
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem || !editType) return;
    setIsSaving(true);

    try {
      const table = editType === 'course' ? 'courses' : editType === 'template' ? 'letter_templates' : 'recipients';
      const isNew = !editingItem.id;
      
      const payload = { ...editingItem };
      if (isNew) {
        delete payload.id;
        payload.created_by = user?.id;
      } else {
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.created_by;
      }

      const { error } = isNew
        ? await supabase.from(table).insert(payload)
        : await supabase.from(table).update(payload).eq('id', editingItem.id);

      if (error) throw error;
      toast.success(isNew ? 'Created successfully!' : 'Updated successfully!');
      setEditingItem(null);
      setEditType(null);
      await loadAll();
    } catch (error) {
      console.error('Save error:', (error as Error)?.message || 'An error occurred');
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'course' | 'template' | 'recipient') => {
    const table = type === 'course' ? 'courses' : type === 'template' ? 'letter_templates' : 'recipients';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted successfully!');
      await loadAll();
    }
  };

  const handleResolveDispute = async () => {
    if (!resolvingDispute || !resolutionText.trim()) return;
    setIsResolving(true);
    try {
      const { error } = await supabase
        .from('transaction_disputes')
        .update({
          status: 'resolved',
          resolution: resolutionText.trim(),
          resolved_at: new Date().toISOString(),
        })
        .eq('id', resolvingDispute.id);
      if (error) throw error;
      toast.success('Dispute resolved');
      setResolvingDispute(null);
      setResolutionText('');
      await loadAll();
    } catch {
      toast.error('Failed to resolve dispute');
    } finally {
      setIsResolving(false);
    }
  };

  const handlePayoutAction = async (payoutId: string, action: 'approved' | 'rejected') => {
    setProcessingPayoutId(payoutId);
    try {
      const { error } = await supabase
        .from('seller_payouts')
        .update({
          status: action,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payoutId);
      if (error) throw error;
      toast.success(`Payout ${action}`);
      await loadAll();
    } catch {
      toast.error('Failed to update payout');
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      open: { variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
      resolved: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      approved: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      completed: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      failed: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      pending_payment: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
    };
    const s = map[status] || { variant: 'outline' as const, icon: null };
    return (
      <Badge variant={s.variant} className="gap-1 text-[10px]">
        {s.icon} {status}
      </Badge>
    );
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

  const openDisputeCount = disputes.filter(d => d.status === 'open').length;
  const pendingPayoutCount = payouts.filter(p => p.status === 'pending').length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">EcoSwarm Control Panel</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={async () => {
              await logout();
              toast.success('Logged out');
              navigate('/');
            }}
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>
      </div>

      <div className="p-4">
        {editingContentCourseId ? (
          <CourseContentEditor
            courseId={editingContentCourseId}
            courseTitle={editingContentCourseTitle}
            onBack={() => setEditingContentCourseId(null)}
          />
        ) : (
        <Tabs defaultValue="analytics">
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="analytics" className="flex-1 gap-1 text-[10px] px-2">
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 gap-1 text-[10px] px-2">
              <Users className="w-3.5 h-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex-1 gap-1 text-[10px] px-2">
              <GraduationCap className="w-3.5 h-3.5" /> Courses
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1 gap-1 text-[10px] px-2">
              <Mail className="w-3.5 h-3.5" /> Letters
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex-1 gap-1 text-[10px] px-2 relative">
              <AlertTriangle className="w-3.5 h-3.5" /> Disputes
              {openDisputeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 text-[9px] flex items-center justify-center">
                  {openDisputeCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex-1 gap-1 text-[10px] px-2 relative">
              <Wallet className="w-3.5 h-3.5" /> Payouts
              {pendingPayoutCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[9px] flex items-center justify-center">
                  {pendingPayoutCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1 gap-1 text-[10px] px-2">
              <DollarSign className="w-3.5 h-3.5" /> Txns
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AdminAnalyticsTab />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-3 pt-3">
            <Button onClick={() => openCreate('course')} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Add Course
            </Button>
            {courses.map((c) => (
              <div key={c.id} className={`eco-card p-4 ${!c.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
                      <span className="eco-badge text-[10px]">{c.category}</span>
                      {!c.is_active && <span className="text-[10px] px-2 py-0.5 bg-destructive/20 text-destructive rounded-full">Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                    <p className="text-xs text-primary mt-1">{c.duration} • {c.points} pts • Order: {c.sort_order}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingContentCourseId(c.id); setEditingContentCourseTitle(c.title); }}
                      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20"
                      title="Manage Content"
                    >
                      <BookOpen className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => openEdit(c, 'course')} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(c.id, 'course')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Letters Tab (Templates + Recipients) */}
          <TabsContent value="templates" className="space-y-4 pt-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Templates</h3>
              <Button onClick={() => openCreate('template')} className="w-full gap-2 mb-3" size="sm">
                <Plus className="w-4 h-4" /> Add Template
              </Button>
              {templates.map((t) => (
                <div key={t.id} className={`eco-card p-4 mb-2 ${!t.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                        <span className="eco-badge text-[10px]">{t.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.content.substring(0, 100)}...</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t, 'template')} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(t.id, 'template')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Recipients</h3>
              <Button onClick={() => openCreate('recipient')} className="w-full gap-2 mb-3" size="sm">
                <Plus className="w-4 h-4" /> Add Recipient
              </Button>
              {recipients.map((r) => (
                <div key={r.id} className={`eco-card p-4 mb-2 ${!r.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{r.name}</h3>
                      <p className="text-xs text-muted-foreground">{r.title}, {r.organization}</p>
                      <p className="text-xs text-primary">{r.email}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r, 'recipient')} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(r.id, 'recipient')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-3 pt-3">
            {disputes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No disputes yet</p>
              </div>
            ) : (
              disputes.map((d) => (
                <div key={d.id} className="eco-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(d.status)}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(d.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-medium">Raised by: {getName(d.raised_by)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{d.reason}</p>
                      {d.resolution && (
                        <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-[10px] font-medium text-primary">Resolution:</p>
                          <p className="text-xs text-foreground">{d.resolution}</p>
                        </div>
                      )}
                    </div>
                    {d.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => { setResolvingDispute(d); setResolutionText(''); }}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-3 pt-3">
            {payouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No payout requests yet</p>
              </div>
            ) : (
              payouts.map((p) => (
                <div key={p.id} className="eco-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(p.status)}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">KSh {Number(p.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Seller: {getName(p.seller_id)}</p>
                      {p.mpesa_phone && <p className="text-xs text-muted-foreground">Phone: {p.mpesa_phone}</p>}
                      {p.mpesa_receipt && <p className="text-xs text-primary">Receipt: {p.mpesa_receipt}</p>}
                    </div>
                    {p.status === 'pending' && (
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          className="text-xs gap-1"
                          disabled={processingPayoutId === p.id}
                          onClick={() => handlePayoutAction(p.id, 'approved')}
                        >
                          {processingPayoutId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs gap-1"
                          disabled={processingPayoutId === p.id}
                          onClick={() => handlePayoutAction(p.id, 'rejected')}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-3 pt-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="eco-card p-4 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{tx.product_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {statusBadge(tx.status)}
                        {tx.verification_status && (
                          <Badge variant="outline" className="text-[10px]">
                            {tx.verification_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>Buyer: {getName(tx.buyer_id)}</span>
                        <span>→</span>
                        <span>Seller: {getName(tx.seller_id)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-foreground font-medium">KSh {Number(tx.total_price).toLocaleString()}</span>
                        {tx.points_used > 0 && <span className="text-primary">{tx.points_used} pts</span>}
                        {Number(tx.cash_paid) > 0 && <span className="text-muted-foreground">+ KSh {Number(tx.cash_paid).toLocaleString()} cash</span>}
                      </div>
                      {tx.mpesa_receipt && <p className="text-[10px] text-muted-foreground mt-0.5">M-Pesa: {tx.mpesa_receipt}</p>}
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tx.payment_method} • {new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingItem && editType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingItem.id ? 'Edit' : 'Create'} {editType === 'course' ? 'Course' : editType === 'template' ? 'Template' : 'Recipient'}
              </h2>
              <button onClick={() => { setEditingItem(null); setEditType(null); }} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {editType === 'course' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                    <Input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                    <Textarea value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Duration</label>
                      <Input value={editingItem.duration} onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Points</label>
                      <Input type="number" value={editingItem.points} onChange={(e) => setEditingItem({ ...editingItem, points: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                      <Input value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Sort Order</label>
                      <Input type="number" value={editingItem.sort_order} onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editingItem.is_active} onCheckedChange={(val) => setEditingItem({ ...editingItem, is_active: val })} />
                    <label className="text-sm text-foreground">Active</label>
                  </div>
                </>
              )}

              {editType === 'template' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                    <Input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                    <Input value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
                    <Textarea className="min-h-[200px]" value={editingItem.content} onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editingItem.is_active} onCheckedChange={(val) => setEditingItem({ ...editingItem, is_active: val })} />
                    <label className="text-sm text-foreground">Active</label>
                  </div>
                </>
              )}

              {editType === 'recipient' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                    <Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title/Position</label>
                    <Input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Organization</label>
                    <Input value={editingItem.organization} onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input type="email" value={editingItem.email} onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editingItem.is_active} onCheckedChange={(val) => setEditingItem({ ...editingItem, is_active: val })} />
                    <label className="text-sm text-foreground">Active</label>
                  </div>
                </>
              )}

              <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Resolve Dispute</h2>
              <button onClick={() => setResolvingDispute(null)} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Reason:</p>
                <p className="text-sm text-foreground">{resolvingDispute.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Resolution</label>
                <Textarea
                  placeholder="Describe how this dispute was resolved..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleResolveDispute} disabled={isResolving || !resolutionText.trim()} className="w-full gap-2">
                {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isResolving ? 'Resolving...' : 'Mark as Resolved'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
