import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Sponsorship {
  id: string; course_id: string; sponsor_user_id: string; sponsor_name: string; sponsor_logo_url: string | null; message: string | null; status: string; admin_notes: string | null; created_at: string;
}

interface Course { id: string; title: string; }

export function AdminSponsorsTab() {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const [sp, c] = await Promise.all([
      supabase.from('course_sponsorships').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title'),
    ]);
    const all = (sp.data as Sponsorship[]) || [];
    setSponsorships(all);
    setCourses(c.data || []);

    const ids = [...new Set(all.map(s => s.sponsor_user_id))];
    if (ids.length > 0) {
      const { data: profiles } = await supabase.from('public_profiles').select('user_id, name').in('user_id', ids);
      const n: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { if (p.user_id) n[p.user_id] = p.name || 'Unknown'; });
      setNames(n);
    }
    setIsLoading(false);
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('course_sponsorships').update({ status: action, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast.success(`Sponsorship ${action}`);
      await load();
    } catch { toast.error('Failed to update'); }
  };

  const getName = (id: string) => names[id] || id.slice(0, 8);
  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      approved: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] || { variant: 'secondary' as const, icon: null };
    return <Badge variant={s.variant} className="gap-1 text-[10px]">{s.icon} {status}</Badge>;
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      {sponsorships.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No sponsorship requests yet</p></div>
      ) : sponsorships.map((s) => {
        const course = courses.find(c => c.id === s.course_id);
        return (
          <div key={s.id} className="eco-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">{statusBadge(s.status)}<span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span></div>
                <div className="flex items-center gap-2 mb-1">
                  {s.sponsor_logo_url && <img src={s.sponsor_logo_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-muted p-0.5" />}
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.sponsor_name}</p>
                    <p className="text-xs text-primary">Course: {course?.title || 'Unknown'}</p>
                  </div>
                </div>
                {s.message && <p className="text-xs text-muted-foreground">{s.message}</p>}
                <p className="text-[10px] text-muted-foreground">By: {getName(s.sponsor_user_id)}</p>
              </div>
              {s.status === 'pending' && (
                <div className="flex flex-col gap-1">
                  <Button size="sm" className="text-xs gap-1" onClick={() => handleAction(s.id, 'approved')}><CheckCircle className="w-3 h-3" /> Approve</Button>
                  <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={() => handleAction(s.id, 'rejected')}><XCircle className="w-3 h-3" /> Reject</Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
