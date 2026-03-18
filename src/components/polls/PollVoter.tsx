import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, MessageSquare, ThermometerSun, CheckCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface PollOption {
  label: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  poll_type: string;
  options: PollOption[];
  is_active: boolean;
  created_at: string;
}

interface PollVoterProps {
  pollId?: string;
  onClose?: () => void;
}

export function PollVoter({ pollId, onClose }: PollVoterProps) {
  const { user } = useApp();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPolls();
  }, [user, pollId]);

  const loadPolls = async () => {
    if (!user) return;
    setIsLoading(true);

    let query = supabase.from('polls').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (pollId) query = query.eq('id', pollId);

    const { data: pollsData } = await query;
    const mapped = (pollsData || []).map((p: any) => ({ ...p, options: p.options as PollOption[] }));
    setPolls(mapped);

    // Check user's existing votes
    if (mapped.length > 0) {
      const { data: responses } = await supabase
        .from('poll_responses')
        .select('poll_id, selected_option')
        .eq('user_id', user.id)
        .in('poll_id', mapped.map(p => p.id));
      const votes: Record<string, number> = {};
      (responses || []).forEach((r: any) => { votes[r.poll_id] = r.selected_option; });
      setUserVotes(votes);
    }
    setIsLoading(false);
  };

  const handleVote = async (poll: Poll) => {
    const selected = selectedOptions[poll.id];
    if (selected === null || selected === undefined || !user) return;
    setSubmittingId(poll.id);

    try {
      const { error } = await supabase.from('poll_responses').insert({
        poll_id: poll.id,
        user_id: user.id,
        selected_option: selected,
        feedback_text: feedbackTexts[poll.id]?.trim() || null,
      });
      if (error) throw error;

      // Update local options vote count
      const updatedOptions = poll.options.map((opt, i) =>
        i === selected ? { ...opt, votes: opt.votes + 1 } : opt
      );
      await supabase.from('polls').update({ options: updatedOptions as any }).eq('id', poll.id);

      setUserVotes(prev => ({ ...prev, [poll.id]: selected }));
      toast.success('Vote submitted! 🗳️');
    } catch (err: any) {
      toast.error(err.message || 'Failed to vote');
    } finally {
      setSubmittingId(null);
    }
  };

  const typeIcon = (type: string) => {
    if (type === 'feedback') return <MessageSquare className="w-4 h-4 text-amber-600" />;
    if (type === 'campaign') return <ThermometerSun className="w-4 h-4 text-emerald-600" />;
    return <BarChart3 className="w-4 h-4 text-primary" />;
  };

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (polls.length === 0) return null;

  return (
    <div className="space-y-4">
      {polls.map(poll => {
        const hasVoted = userVotes[poll.id] !== undefined;
        const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0) + (hasVoted ? 0 : 0);

        return (
          <div key={poll.id} className="eco-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {typeIcon(poll.poll_type)}
                <h3 className="font-semibold text-foreground text-sm">{poll.title}</h3>
              </div>
              {onClose && (
                <button onClick={onClose} className="p-1 rounded-full text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {poll.description && <p className="text-xs text-muted-foreground">{poll.description}</p>}

            {hasVoted ? (
              // Show results
              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const count = opt.votes + (userVotes[poll.id] === i ? 1 : 0);
                  const total = totalVotes + 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-0.5">
                        <span className={`text-foreground ${userVotes[poll.id] === i ? 'font-semibold' : ''}`}>
                          {opt.label} {userVotes[poll.id] === i && <CheckCircle className="w-3 h-3 inline text-primary" />}
                        </span>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-muted-foreground text-center">✅ You voted • {totalVotes + 1} responses</p>
              </div>
            ) : (
              // Show voting options
              <div className="space-y-2">
                {poll.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOptions(prev => ({ ...prev, [poll.id]: i }))}
                    className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                      selectedOptions[poll.id] === i
                        ? 'border-primary bg-primary/5 font-medium text-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                {poll.poll_type === 'feedback' && (
                  <Textarea
                    placeholder="Share your thoughts (optional)..."
                    value={feedbackTexts[poll.id] || ''}
                    onChange={(e) => setFeedbackTexts(prev => ({ ...prev, [poll.id]: e.target.value }))}
                    className="min-h-[60px] text-sm"
                  />
                )}
                <Button
                  onClick={() => handleVote(poll)}
                  disabled={selectedOptions[poll.id] === null || selectedOptions[poll.id] === undefined || submittingId === poll.id}
                  className="w-full gap-2"
                  size="sm"
                >
                  {submittingId === poll.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Submit Vote
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
