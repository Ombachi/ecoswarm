import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Megaphone, Send, Loader2, Plus, X, BarChart3,
  MessageSquare, ThermometerSun, Star, Trash2, Eye,
} from 'lucide-react';
import { toast } from 'sonner';

type PollType = 'poll' | 'feedback' | 'campaign';

interface PollOption {
  label: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  poll_type: PollType;
  options: PollOption[];
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
}

export function AdminBroadcastTab() {
  const { user } = useApp();

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Polls state
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [viewingPoll, setViewingPoll] = useState<Poll | null>(null);
  const [pollResponses, setPollResponses] = useState<any[]>([]);

  // New poll form
  const [newPollType, setNewPollType] = useState<PollType>('poll');
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [isSavingPoll, setIsSavingPoll] = useState(false);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setIsLoadingPolls(true);
    const { data } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });
    setPolls((data || []).map((p: any) => ({ ...p, options: p.options as PollOption[] })));
    setIsLoadingPolls(false);
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    try {
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('user_id');
      if (profilesErr) throw profilesErr;
      if (!profiles || profiles.length === 0) throw new Error('No users found');

      const notifications = profiles.map((p) => ({
        user_id: p.user_id,
        type: 'broadcast',
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
      }));

      for (let i = 0; i < notifications.length; i += 500) {
        const chunk = notifications.slice(i, i + 500);
        const { error } = await supabase.from('notifications').insert(chunk);
        if (error) throw error;
      }

      toast.success(`Broadcast sent to ${profiles.length} users!`);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPollTitle.trim()) return;
    const validOptions = newPollOptions.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error('Need at least 2 options');
      return;
    }
    setIsSavingPoll(true);
    try {
      const options: PollOption[] = validOptions.map((label) => ({ label: label.trim(), votes: 0 }));
      const { error } = await supabase.from('polls').insert({
        created_by: user?.id,
        title: newPollTitle.trim(),
        description: newPollDesc.trim() || null,
        poll_type: newPollType,
        options,
        is_active: true,
      });
      if (error) throw error;

      // Notify all users about the new poll
      const { data: profiles } = await supabase.from('profiles').select('user_id');
      if (profiles && profiles.length > 0) {
        const typeLabel = newPollType === 'feedback' ? '📝 Feedback Survey' : newPollType === 'campaign' ? '🌍 Campaign' : '📊 New Poll';
        const notifications = profiles.map((p) => ({
          user_id: p.user_id,
          type: 'poll',
          title: typeLabel,
          message: newPollTitle.trim(),
          reference_id: 'poll',
        }));
        for (let i = 0; i < notifications.length; i += 500) {
          await supabase.from('notifications').insert(notifications.slice(i, i + 500));
        }
      }

      toast.success('Poll created & users notified!');
      setShowCreatePoll(false);
      setNewPollTitle('');
      setNewPollDesc('');
      setNewPollOptions(['', '']);
      setNewPollType('poll');
      await loadPolls();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create poll');
    } finally {
      setIsSavingPoll(false);
    }
  };

  const handleDeletePoll = async (id: string) => {
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Poll deleted'); await loadPolls(); }
  };

  const handleTogglePoll = async (id: string, active: boolean) => {
    await supabase.from('polls').update({ is_active: !active }).eq('id', id);
    await loadPolls();
  };

  const viewPollResults = async (poll: Poll) => {
    setViewingPoll(poll);
    const { data } = await supabase
      .from('poll_responses')
      .select('selected_option, feedback_text, created_at')
      .eq('poll_id', poll.id);
    setPollResponses(data || []);
  };

  const pollTypeConfig: Record<PollType, { label: string; icon: any; color: string; presets: string[] }> = {
    poll: {
      label: 'Poll',
      icon: BarChart3,
      color: 'text-primary',
      presets: [],
    },
    feedback: {
      label: 'Feedback',
      icon: MessageSquare,
      color: 'text-amber-600',
      presets: ['Climate Anxiety Survey', 'User Experience Feedback', 'App Utility Rating'],
    },
    campaign: {
      label: 'Campaign',
      icon: ThermometerSun,
      color: 'text-emerald-600',
      presets: [],
    },
  };

  const applyPreset = (preset: string) => {
    setNewPollTitle(preset);
    if (preset === 'Climate Anxiety Survey') {
      setNewPollDesc('How concerned are you about climate change and its impact on your daily life?');
      setNewPollOptions(['Very concerned', 'Somewhat concerned', 'Neutral', 'Not concerned']);
    } else if (preset === 'User Experience Feedback') {
      setNewPollDesc('How would you rate your overall experience using EcoSwarm?');
      setNewPollOptions(['Excellent', 'Good', 'Average', 'Needs Improvement']);
    } else if (preset === 'App Utility Rating') {
      setNewPollDesc('Which EcoSwarm feature is most useful to you?');
      setNewPollOptions(['Agora (Social)', 'EcoMarket', 'Capacity Hub', 'EcoLetter', 'Swarms']);
    }
  };

  return (
    <div className="space-y-6 pt-3">
      {/* Announcement Section */}
      <div className="eco-card p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Send Announcement</h3>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
          <Input placeholder="e.g. 📢 New Feature Launch!" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
          <Textarea placeholder="Write your announcement..." value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} className="min-h-[80px]" />
        </div>
        <Button onClick={handleBroadcast} disabled={isBroadcasting || !broadcastTitle.trim() || !broadcastMessage.trim()} className="w-full gap-2">
          {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isBroadcasting ? 'Sending...' : 'Send to All Users'}
        </Button>
      </div>

      {/* Polls & Campaigns Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Polls, Campaigns & Feedback</h3>
          <Button size="sm" className="gap-1" onClick={() => setShowCreatePoll(true)}>
            <Plus className="w-3.5 h-3.5" /> Create
          </Button>
        </div>

        {isLoadingPolls ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : polls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No polls yet. Create one above!</div>
        ) : (
          <div className="space-y-3">
            {polls.map((p) => {
              const cfg = pollTypeConfig[p.poll_type as PollType] || pollTypeConfig.poll;
              const totalVotes = p.options.reduce((s, o) => s + o.votes, 0);
              return (
                <div key={p.id} className={`eco-card p-4 ${!p.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <cfg.icon className={`w-3 h-3 ${cfg.color}`} />
                          {cfg.label}
                        </Badge>
                        {!p.is_active && <Badge variant="secondary" className="text-[10px]">Closed</Badge>}
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">{p.title}</h4>
                      {p.description && <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{totalVotes} responses • {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => viewPollResults(p)} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleTogglePoll(p.id, p.is_active)} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                        <Star className={`w-4 h-4 ${p.is_active ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      </button>
                      <button onClick={() => handleDeletePoll(p.id)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Create Poll / Campaign</h2>
              <button onClick={() => setShowCreatePoll(false)} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Type Selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <div className="flex gap-2">
                  {(['poll', 'feedback', 'campaign'] as PollType[]).map((t) => {
                    const cfg = pollTypeConfig[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setNewPollType(t)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          newPollType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <cfg.icon className="w-4 h-4" /> {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Presets for feedback */}
              {pollTypeConfig[newPollType].presets.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quick Presets</label>
                  <div className="flex flex-wrap gap-1.5">
                    {pollTypeConfig[newPollType].presets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                <Input value={newPollTitle} onChange={(e) => setNewPollTitle(e.target.value)} placeholder="What do you want to ask?" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Description (optional)</label>
                <Textarea value={newPollDesc} onChange={(e) => setNewPollDesc(e.target.value)} placeholder="Add context..." className="min-h-[60px]" />
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Options</label>
                {newPollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      className="flex-1"
                      value={opt}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) => {
                        const updated = [...newPollOptions];
                        updated[i] = e.target.value;
                        setNewPollOptions(updated);
                      }}
                    />
                    {newPollOptions.length > 2 && (
                      <button
                        onClick={() => setNewPollOptions(newPollOptions.filter((_, j) => j !== i))}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
                {newPollOptions.length < 6 && (
                  <Button variant="outline" size="sm" className="w-full gap-1 mt-1" onClick={() => setNewPollOptions([...newPollOptions, ''])}>
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </Button>
                )}
              </div>

              <Button onClick={handleCreatePoll} disabled={isSavingPoll} className="w-full gap-2">
                {isSavingPoll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSavingPoll ? 'Creating...' : 'Create & Notify Users'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Results Modal */}
      {viewingPoll && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Results</h2>
              <button onClick={() => setViewingPoll(null)} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-foreground">{viewingPoll.title}</h3>
              <p className="text-xs text-muted-foreground">{pollResponses.length} total responses</p>

              {/* Option breakdown */}
              <div className="space-y-2">
                {viewingPoll.options.map((opt, i) => {
                  const count = pollResponses.filter((r) => r.selected_option === i).length;
                  const pct = pollResponses.length > 0 ? Math.round((count / pollResponses.length) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{opt.label}</span>
                        <span className="text-muted-foreground text-xs">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feedback text responses */}
              {pollResponses.some((r) => r.feedback_text) && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Written Feedback</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pollResponses
                      .filter((r) => r.feedback_text)
                      .map((r, i) => (
                        <div key={i} className="p-2 bg-muted rounded-lg">
                          <p className="text-xs text-foreground">{r.feedback_text}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
