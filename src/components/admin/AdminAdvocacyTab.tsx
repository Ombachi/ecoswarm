import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, Clock, CheckCircle2, AlertTriangle, XCircle, Loader2, ExternalLink, Save } from 'lucide-react';

interface AdvocacyItem {
  id: string;
  title: string;
  the_ask: string;
  response_status: string;
  response_date: string | null;
  created_at: string;
  target_name: string;
  target_org: string;
  signer_count: number;
}

const STATUS_OPTIONS = [
  { value: 'no_response', label: 'No Response', icon: XCircle, color: 'text-destructive' },
  { value: 'acknowledged', label: 'Acknowledged', icon: Clock, color: 'text-[hsl(var(--eco-gold))]' },
  { value: 'committed', label: 'Committed', icon: CheckCircle2, color: 'text-[hsl(var(--eco-blue))]' },
  { value: 'fulfilled', label: 'Fulfilled', icon: CheckCircle2, color: 'text-primary' },
  { value: 'rejected', label: 'Rejected', icon: AlertTriangle, color: 'text-destructive' },
];

export function AdminAdvocacyTab() {
  const [items, setItems] = useState<AdvocacyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editEvidence, setEditEvidence] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: advocacies } = await supabase
        .from('business_advocacy')
        .select('id, title, the_ask, response_status, response_date, created_at, target_recipient_id')
        .in('status', ['sent', 'collecting'])
        .order('created_at', { ascending: false });

      if (!advocacies?.length) { setItems([]); setIsLoading(false); return; }

      const recipientIds = advocacies.map(a => a.target_recipient_id).filter(Boolean);
      const [{ data: recipients }, { data: signers }] = await Promise.all([
        recipientIds.length > 0
          ? supabase.from('recipients').select('id, name, organization').in('id', recipientIds as string[])
          : { data: [] },
        supabase.from('advocacy_signers').select('advocacy_id'),
      ]);

      const recipientMap = Object.fromEntries((recipients || []).map(r => [r.id, r]));
      const signerCounts: Record<string, number> = {};
      (signers || []).forEach(s => { signerCounts[s.advocacy_id] = (signerCounts[s.advocacy_id] || 0) + 1; });

      setItems(advocacies.map(a => {
        const r = a.target_recipient_id ? recipientMap[a.target_recipient_id] : null;
        return {
          id: a.id,
          title: a.title,
          the_ask: a.the_ask,
          response_status: a.response_status || 'no_response',
          response_date: a.response_date,
          created_at: a.created_at,
          target_name: r?.name || 'Unknown',
          target_org: r?.organization || '',
          signer_count: signerCounts[a.id] || 0,
        };
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load advocacy data');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item: AdvocacyItem) => {
    setEditingId(item.id);
    setEditStatus(item.response_status);
    setEditEvidence('');
    setEditSummary('');
  };

  const handleSave = async () => {
    if (!editingId || !editSummary.trim()) {
      toast.error('Please provide a response summary');
      return;
    }
    setIsSaving(true);
    try {
      // Update advocacy status
      await supabase
        .from('business_advocacy')
        .update({
          response_status: editStatus,
          response_date: new Date().toISOString(),
        })
        .eq('id', editingId);

      // Insert response record
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('advocacy_responses').insert({
        advocacy_id: editingId,
        response_status: editStatus,
        summary: editSummary.trim(),
        evidence_url: editEvidence.trim() || null,
        updated_by: user?.id || null,
      });

      // Notify all signers
      const { data: signerData } = await supabase
        .from('advocacy_signers')
        .select('user_id')
        .eq('advocacy_id', editingId);

      const item = items.find(i => i.id === editingId);
      if (signerData && item) {
        const statusLabel = STATUS_OPTIONS.find(s => s.value === editStatus)?.label || editStatus;
        const notifications = signerData.map(s => ({
          user_id: s.user_id,
          type: 'advocacy',
          title: '📢 Advocacy Update',
          message: `"${item.title}" status changed to ${statusLabel}`,
          reference_id: editingId,
        }));
        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }

      toast.success('Response status updated & signers notified');
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Wall of Accountability
        </h2>
        <span className="text-xs text-muted-foreground">{items.length} campaigns</span>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No advocacy campaigns yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const statusOpt = STATUS_OPTIONS.find(s => s.value === item.response_status) || STATUS_OPTIONS[0];
            const StatusIcon = statusOpt.icon;
            const isEditing = editingId === item.id;

            return (
              <div key={item.id} className="border border-border rounded-xl p-4 space-y-3 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">To: {item.target_name} — {item.target_org}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.the_ask}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${statusOpt.color} bg-muted`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusOpt.label}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>{item.signer_count} signers</span>
                  {item.response_date && <span>Responded {Math.floor((Date.now() - new Date(item.response_date).getTime()) / 86400000)}d ago</span>}
                </div>

                {isEditing ? (
                  <div className="space-y-3 border-t border-border pt-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Response Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="eco-input py-2 text-sm w-full"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Summary *</label>
                      <textarea
                        value={editSummary}
                        onChange={(e) => setEditSummary(e.target.value)}
                        placeholder="Describe the response or update..."
                        className="eco-input py-2 text-sm w-full min-h-[80px]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Evidence URL (optional)</label>
                      <input
                        type="url"
                        value={editEvidence}
                        onChange={(e) => setEditEvidence(e.target.value)}
                        placeholder="https://..."
                        className="eco-input py-2 text-sm w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isSaving}>Cancel</Button>
                      <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1">
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save & Notify
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEdit(item)} className="text-xs">
                    Update Response Status
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}