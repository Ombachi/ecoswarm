import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Briefcase, Send, Users, Clock, Plus, ChevronRight, Check, Loader2, Shield, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Advocacy {
  id: string;
  title: string;
  problem_statement: string;
  the_ask: string;
  impact_report: string | null;
  status: string;
  min_signers: number;
  created_at: string;
  signer_count?: number;
}

export function BusinessAdvocacyPanel() {
  const { user } = useApp();
  const [advocacies, setAdvocacies] = useState<Advocacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [theAsk, setTheAsk] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');

  useEffect(() => {
    if (user) {
      loadAdvocacies();
      loadRecipients();
    }
  }, [user]);

  const loadAdvocacies = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('business_advocacy')
      .select('*')
      .order('created_at', { ascending: false });

    // Get signer counts
    const ids = (data || []).map(a => a.id);
    let signerCounts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: signers } = await supabase
        .from('advocacy_signers')
        .select('advocacy_id');
      if (signers) {
        signers.forEach(s => {
          signerCounts[s.advocacy_id] = (signerCounts[s.advocacy_id] || 0) + 1;
        });
      }
    }

    setAdvocacies((data || []).map(a => ({ ...a, signer_count: signerCounts[a.id] || 0 })));
    setIsLoading(false);
  };

  const loadRecipients = async () => {
    const { data } = await supabase.from('recipients').select('*').eq('is_active', true).order('sort_order');
    setRecipients(data || []);
  };

  const handleCreate = async () => {
    if (!user || !title.trim() || !problemStatement.trim() || !theAsk.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      const { error } = await supabase.from('business_advocacy').insert({
        creator_id: user.id,
        title: title.trim(),
        problem_statement: problemStatement.trim(),
        the_ask: theAsk.trim(),
        target_recipient_id: selectedRecipient || null,
        impact_report: `Market Impact Report — Generated for: ${title}\n\nThis advocacy campaign represents the collective voice of EcoDevelopers in the green economy sector. Detailed impact metrics will be compiled upon reaching minimum co-signer threshold.`,
      });
      if (error) throw error;
      toast.success('Advocacy campaign created!');
      setShowCreate(false);
      setTitle(''); setProblemStatement(''); setTheAsk(''); setSelectedRecipient('');
      await loadAdvocacies();
    } catch {
      toast.error('Failed to create advocacy');
    } finally {
      setCreating(false);
    }
  };

  const handleSign = async (advocacyId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('advocacy_signers').insert({
        advocacy_id: advocacyId,
        user_id: user.id,
      });
      if (error) {
        if (error.message.includes('duplicate')) {
          toast.info('You already signed this advocacy');
        } else throw error;
        return;
      }
      toast.success('Signed! Your voice matters 🐝');
      await loadAdvocacies();
    } catch {
      toast.error('Failed to sign');
    }
  };

  const statusColor = (status: string) => {
    if (status === 'sent') return 'bg-primary/10 text-primary';
    if (status === 'draft') return 'bg-muted text-muted-foreground';
    if (status === 'collecting') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Business Advocacy
          </h2>
          <p className="text-xs text-muted-foreground">Collective voice for EcoDevelopers</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {/* Info card */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">How Business Advocacy works:</p>
        <p>• Create a campaign addressing a specific policy barrier</p>
        <p>• Get at least 5 EcoDeveloper co-signers</p>
        <p>• AI generates a Market Impact Report automatically</p>
        <p>• Campaign is sent to the target recipient</p>
      </div>

      {/* Advocacy list */}
      {advocacies.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-foreground font-semibold">No campaigns yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start the first Business Advocacy campaign!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {advocacies.map(a => (
            <div key={a.id} className="eco-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(a.status)}`}>
                      {a.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{a.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.problem_statement}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-foreground">
                  <Users className="w-3.5 h-3.5" /> {a.signer_count || 0}/{a.min_signers} signers
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" /> Impact Report {a.impact_report ? '✓' : '—'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full eco-gradient-bg rounded-full transition-all"
                  style={{ width: `${Math.min(((a.signer_count || 0) / a.min_signers) * 100, 100)}%` }}
                />
              </div>

              {a.status !== 'sent' && a.creator_id !== user?.id && (
                <Button onClick={() => handleSign(a.id)} size="sm" variant="outline" className="w-full gap-1 text-xs">
                  <Check className="w-3.5 h-3.5" /> Co-Sign This Campaign
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">New Advocacy Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Campaign Title *</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Remove VAT on Solar Panels" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Problem Statement *</label>
                <Textarea value={problemStatement} onChange={e => setProblemStatement(e.target.value)} placeholder="Describe the specific policy barrier..." className="min-h-[100px]" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">The Ask *</label>
                <Textarea value={theAsk} onChange={e => setTheAsk(e.target.value)} placeholder="What specific action do you want taken?" className="min-h-[80px]" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Target Recipient</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recipients.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRecipient(r.id === selectedRecipient ? '' : r.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left text-xs transition-all ${
                        selectedRecipient === r.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-muted-foreground">{r.title}, {r.organization}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
