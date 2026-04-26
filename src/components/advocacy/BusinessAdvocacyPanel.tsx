import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Briefcase, Send, Users, Clock, Plus, ChevronRight, Check, Loader2, Shield, X, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Advocacy {
  id: string;
  creator_id: string;
  title: string;
  problem_statement: string;
  the_ask: string;
  impact_report: string | null;
  status: string;
  min_signers: number;
  created_at: string;
  cooldown_until: string | null;
  signer_count?: number;
  has_signed?: boolean;
  creator_name?: string;
}

export function BusinessAdvocacyPanel() {
  const { user } = useApp();
  const [advocacies, setAdvocacies] = useState<Advocacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);

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
    
    // Load all visible campaigns (own + collecting + sent)
    const { data } = await supabase
      .from('business_advocacy')
      .select('*')
      .order('created_at', { ascending: false });

    // Get all signer data
    const ids = (data || []).map(a => a.id);
    let signerCounts: Record<string, number> = {};
    let userSigned = new Set<string>();
    
    if (ids.length > 0) {
      const { data: signers } = await supabase
        .from('advocacy_signers')
        .select('advocacy_id, user_id');
      if (signers) {
        signers.forEach(s => {
          signerCounts[s.advocacy_id] = (signerCounts[s.advocacy_id] || 0) + 1;
          if (s.user_id === user.id) userSigned.add(s.advocacy_id);
        });
      }
    }

    // Get creator names
    const creatorIds = [...new Set((data || []).map(a => a.creator_id))];
    let nameMap: Record<string, string> = {};
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, name')
        .in('user_id', creatorIds);
      if (profiles) profiles.forEach(p => { if (p.user_id && p.name) nameMap[p.user_id] = p.name; });
    }

    setAdvocacies((data || []).map(a => ({
      ...a,
      signer_count: signerCounts[a.id] || 0,
      has_signed: userSigned.has(a.id),
      creator_name: nameMap[a.creator_id] || 'EcoDeveloper',
    })));
    setIsLoading(false);
  };

  const loadRecipients = async () => {
    const { data, error } = await supabase
      .from('public_recipients')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.warn('loadRecipients: public_recipients query failed', error.message);
    }

    if (data && data.length > 0) {
      setRecipients(data);
      return;
    }

    // Fallback: a curated default list so EcoDevelopers always have at least
    // one decision-maker to address. Used when the public_recipients view is
    // empty or unreadable for the current role.
    setRecipients([
      { id: 'fallback-cs-environment', name: 'Hon. Aden Duale', title: 'Cabinet Secretary', organization: 'Ministry of Environment, Climate Change & Forestry' },
      { id: 'fallback-cs-trade', name: 'Hon. Salim Mvurya', title: 'Cabinet Secretary', organization: 'Ministry of Investments, Trade & Industry' },
      { id: 'fallback-cs-energy', name: 'Hon. Opiyo Wandayi', title: 'Cabinet Secretary', organization: 'Ministry of Energy & Petroleum' },
      { id: 'fallback-nema', name: 'Director General', title: 'NEMA', organization: 'National Environment Management Authority' },
      { id: 'fallback-kepsa', name: 'CEO', title: 'KEPSA', organization: 'Kenya Private Sector Alliance' },
    ]);
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
        status: 'collecting',
        impact_report: `Market Impact Report — Generated for: ${title}\n\nThis advocacy campaign represents the collective voice of EcoDevelopers in the green economy sector. Detailed impact metrics will be compiled upon reaching minimum co-signer threshold.`,
      });
      if (error) throw error;

      // Auto-sign as creator
      const { data: newCampaign } = await supabase
        .from('business_advocacy')
        .select('id')
        .eq('creator_id', user.id)
        .eq('title', title.trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (newCampaign) {
        await supabase.from('advocacy_signers').insert({
          advocacy_id: newCampaign.id,
          user_id: user.id,
        });
      }

      toast.success('Campaign created! Share it with fellow EcoDevelopers 🐝');
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
    setSigningId(advocacyId);
    try {
      const { error } = await supabase.from('advocacy_signers').insert({
        advocacy_id: advocacyId,
        user_id: user.id,
      });
      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          toast.info('You already co-signed this campaign');
        } else throw error;
        return;
      }
      toast.success('Co-signed! Your voice matters 🐝');
      await loadAdvocacies();
    } catch {
      toast.error('Failed to co-sign');
    } finally {
      setSigningId(null);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'sent') return 'bg-primary/10 text-primary';
    if (status === 'draft') return 'bg-muted text-muted-foreground';
    if (status === 'collecting') return 'bg-[hsl(var(--eco-gold))]/10 text-[hsl(var(--eco-gold))]';
    return 'bg-muted text-muted-foreground';
  };

  const statusLabel = (status: string) => {
    if (status === 'sent') return '✓ Sent';
    if (status === 'collecting') return '📢 Collecting Signers';
    return status;
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
          {advocacies.map(a => {
            const isExpanded = expandedId === a.id;
            const canSign = a.status === 'collecting' && !a.has_signed && a.creator_id !== user?.id;
            const meetsThreshold = (a.signer_count || 0) >= a.min_signers;
            
            return (
              <div key={a.id} className="eco-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(a.status)}`}>
                        {statusLabel(a.status)}
                      </span>
                      {a.creator_id === user?.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">
                          Your Campaign
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-foreground text-sm">{a.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      by {a.creator_name} • {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Signer progress */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-foreground">
                    <Users className="w-3.5 h-3.5" /> {a.signer_count || 0}/{a.min_signers} co-signers
                  </span>
                  {meetsThreshold && (
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <Check className="w-3.5 h-3.5" /> Threshold met!
                    </span>
                  )}
                  {a.has_signed && (
                    <span className="flex items-center gap-1 text-primary text-[10px]">
                      <Check className="w-3 h-3" /> You signed
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full eco-gradient-bg rounded-full transition-all"
                    style={{ width: `${Math.min(((a.signer_count || 0) / a.min_signers) * 100, 100)}%` }}
                  />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-border animate-slide-up">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Problem Statement</p>
                      <p className="text-sm text-foreground">{a.problem_statement}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">The Ask</p>
                      <p className="text-sm text-foreground">{a.the_ask}</p>
                    </div>
                    {a.impact_report && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-semibold text-primary flex items-center gap-1 mb-1">
                          <FileText className="w-3 h-3" /> Market Impact Report
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{a.impact_report}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Co-sign button */}
                {canSign && (
                  <Button
                    onClick={() => handleSign(a.id)}
                    disabled={signingId === a.id}
                    size="sm"
                    variant="outline"
                    className="w-full gap-1 text-xs"
                  >
                    {signingId === a.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Co-Sign This Campaign
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => !creating && setShowCreate(false)}>
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-auto animate-slide-up" onClick={e => e.stopPropagation()}>
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
