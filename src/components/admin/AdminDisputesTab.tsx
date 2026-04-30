import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Dispute {
  id: string; transaction_id: string; raised_by: string; reason: string; status: string; resolution: string | null; created_at: string; resolved_at: string | null;
}

const statusBadge = (status: string) => {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    open: { variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
    resolved: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
  };
  const s = map[status] || { variant: 'outline' as const, icon: null };
  return <Badge variant={s.variant} className="gap-1 text-[10px]">{s.icon} {status}</Badge>;
};

export function AdminDisputesTab() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [resolving, setResolving] = useState<Dispute | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('transaction_disputes').select('*').order('created_at', { ascending: false });
    const allDisputes = (data as Dispute[]) || [];
    setDisputes(allDisputes);

    const userIds = [...new Set(allDisputes.map(d => d.raised_by))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('public_profiles').select('user_id, name').in('user_id', userIds);
      const n: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { if (p.user_id) n[p.user_id] = p.name || 'Unknown'; });
      setNames(n);
    }
    setIsLoading(false);
  };

  const handleResolve = async () => {
    if (!resolving || !resolutionText.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('transaction_disputes').update({ status: 'resolved', resolution: resolutionText.trim(), resolved_at: new Date().toISOString() }).eq('id', resolving.id);
      if (error) throw error;
      toast.success('Dispute resolved');
      setResolving(null); setResolutionText('');
      await load();
    } catch { toast.error('Failed to resolve'); }
    finally { setIsSubmitting(false); }
  };

  const getName = (id: string) => names[id] || id.slice(0, 8);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      {disputes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No disputes yet</p></div>
      ) : disputes.map((d) => (
        <div key={d.id} className="eco-card p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">{statusBadge(d.status)}<span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span></div>
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
              <Button size="sm" variant="outline" className="text-xs" onClick={() => { setResolving(d); setResolutionText(''); }}>Resolve</Button>
            )}
          </div>
        </div>
      ))}

      {resolving && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Resolve Dispute</h2>
              <button onClick={() => setResolving(null)} className="p-2 rounded-full bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs font-medium text-muted-foreground mb-1">Reason:</p><p className="text-sm text-foreground">{resolving.reason}</p></div>
              <div><label className="text-sm font-medium text-foreground mb-1 block">Resolution</label><Textarea placeholder="Describe how this dispute was resolved..." value={resolutionText} onChange={(e) => setResolutionText(e.target.value)} className="min-h-[100px]" /></div>
              <Button onClick={handleResolve} disabled={isSubmitting || !resolutionText.trim()} className="w-full gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isSubmitting ? 'Resolving...' : 'Mark as Resolved'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
