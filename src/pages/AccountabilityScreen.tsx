import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Shield, Clock, CheckCircle2, AlertTriangle, XCircle, Users, ExternalLink, Loader2 } from 'lucide-react';

interface AdvocacyWithResponse {
  id: string;
  title: string;
  the_ask: string;
  problem_statement: string;
  status: string;
  response_status: string;
  response_date: string | null;
  created_at: string;
  target_name?: string;
  target_org?: string;
  signer_count: number;
  latest_evidence?: string;
  latest_summary?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  no_response: { label: 'No Response', color: 'text-destructive', icon: XCircle, bg: 'bg-destructive/10' },
  acknowledged: { label: 'Acknowledged', color: 'text-[hsl(var(--eco-gold))]', icon: Clock, bg: 'bg-[hsl(var(--eco-gold))]/10' },
  committed: { label: 'Committed', color: 'text-[hsl(var(--eco-blue))]', icon: CheckCircle2, bg: 'bg-[hsl(var(--eco-blue))]/10' },
  fulfilled: { label: 'Fulfilled', color: 'text-primary', icon: CheckCircle2, bg: 'bg-primary/10' },
  rejected: { label: 'Rejected', color: 'text-destructive', icon: AlertTriangle, bg: 'bg-destructive/10' },
};

export function AccountabilityScreen() {
  usePageMeta('Wall of Accountability', 'Track responses from advocacy targets — holding leaders accountable for environmental commitments.');
  const [items, setItems] = useState<AdvocacyWithResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: advocacies } = await supabase
        .from('business_advocacy')
        .select('id, title, the_ask, problem_statement, status, response_status, response_date, created_at, target_recipient_id')
        .in('status', ['sent', 'collecting']);

      if (!advocacies?.length) { setItems([]); setIsLoading(false); return; }

      const recipientIds = advocacies.map(a => a.target_recipient_id).filter(Boolean);
      const [{ data: recipients }, { data: signers }, { data: responses }] = await Promise.all([
        recipientIds.length > 0
          ? supabase.from('recipients').select('id, name, organization').in('id', recipientIds as string[])
          : { data: [] },
        supabase.from('advocacy_signers').select('advocacy_id'),
        supabase.from('advocacy_responses').select('advocacy_id, evidence_url, summary, created_at').order('created_at', { ascending: false }),
      ]);

      const recipientMap = Object.fromEntries((recipients || []).map(r => [r.id, r]));
      const signerCounts: Record<string, number> = {};
      (signers || []).forEach(s => { signerCounts[s.advocacy_id] = (signerCounts[s.advocacy_id] || 0) + 1; });
      const latestResponse: Record<string, any> = {};
      (responses || []).forEach(r => { if (!latestResponse[r.advocacy_id]) latestResponse[r.advocacy_id] = r; });

      const mapped: AdvocacyWithResponse[] = advocacies.map(a => {
        const recipient = a.target_recipient_id ? recipientMap[a.target_recipient_id] : null;
        const resp = latestResponse[a.id];
        return {
          id: a.id,
          title: a.title,
          the_ask: a.the_ask,
          problem_statement: a.problem_statement,
          status: a.status,
          response_status: a.response_status || 'no_response',
          response_date: a.response_date,
          created_at: a.created_at,
          target_name: recipient?.name,
          target_org: recipient?.organization,
          signer_count: signerCounts[a.id] || 0,
          latest_evidence: resp?.evidence_url,
          latest_summary: resp?.summary,
        };
      });

      setItems(mapped.sort((a, b) => {
        const order = ['no_response', 'acknowledged', 'committed', 'rejected', 'fulfilled'];
        return order.indexOf(a.response_status) - order.indexOf(b.response_status);
      }));
    } catch (err) {
      console.error('Accountability load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const daysSince = (dateStr: string) => Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  const filtered = filter === 'all' ? items : items.filter(i => i.response_status === filter);

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Wall of Accountability
        </h1>
        <p className="text-xs text-muted-foreground">Tracking responses from advocacy targets</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['all', 'no_response', 'acknowledged', 'committed', 'fulfilled', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No advocacy campaigns found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const config = STATUS_CONFIG[item.response_status] || STATUS_CONFIG.no_response;
              const StatusIcon = config.icon;
              const days = daysSince(item.created_at);

              return (
                <div key={item.id} className="eco-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                      {item.target_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          To: {item.target_name} — {item.target_org}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${config.bg} ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{item.the_ask}</p>

                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {item.signer_count} signers</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {days} days ago</span>
                    {item.response_date && (
                      <span className="flex items-center gap-1 text-primary">
                        Responded {daysSince(item.response_date)}d ago
                      </span>
                    )}
                  </div>

                  {item.latest_summary && (
                    <div className="bg-muted/50 rounded-lg p-2.5 text-xs text-foreground">
                      <p className="font-medium mb-1">Latest Response:</p>
                      <p className="text-muted-foreground">{item.latest_summary}</p>
                      {item.latest_evidence && (
                        <a href={item.latest_evidence} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary mt-1 hover:underline">
                          <ExternalLink className="w-3 h-3" /> View Evidence
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
