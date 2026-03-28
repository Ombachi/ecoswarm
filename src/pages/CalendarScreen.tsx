import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, Users, Clock, Megaphone } from 'lucide-react';
import { CreateSwarmModal } from '@/components/swarms/CreateSwarmModal';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClimateDate {
  date: string; // MM-DD
  title: string;
  description: string;
  emoji: string;
  suggestedActions: string[];
}

const climateDates: ClimateDate[] = [
  { date: '01-28', title: 'International Day of Clean Energy', description: 'Promoting universal access to clean energy.', emoji: '⚡', suggestedActions: ['Share clean energy tips', 'Launch a Solar Swarm'] },
  { date: '02-02', title: 'World Wetlands Day', description: 'Raising awareness of the value of wetlands.', emoji: '🌊', suggestedActions: ['Visit a wetland', 'Join a clean-up swarm'] },
  { date: '03-03', title: 'World Wildlife Day', description: 'Celebrating and raising awareness of wild animals and plants.', emoji: '🦁', suggestedActions: ['Share wildlife photos', 'Support conservation efforts'] },
  { date: '03-21', title: 'International Day of Forests', description: 'Celebrating forests and raising awareness of sustainable management.', emoji: '🌳', suggestedActions: ['Plant a tree', 'Launch a reforestation swarm'] },
  { date: '03-22', title: 'World Water Day', description: 'Highlighting the importance of freshwater.', emoji: '💧', suggestedActions: ['Share water-saving tips', 'Send a letter on water policy'] },
  { date: '04-22', title: 'Earth Day', description: 'The largest environmental event worldwide.', emoji: '🌍', suggestedActions: ['Launch a swarm', 'Share your eco story', 'Send an EcoLetter'] },
  { date: '05-22', title: 'International Day for Biological Diversity', description: 'Raising awareness of biodiversity issues.', emoji: '🦋', suggestedActions: ['Document local species', 'Join biodiversity campaigns'] },
  { date: '06-05', title: 'World Environment Day', description: "The UN's principal vehicle for encouraging environmental awareness.", emoji: '🌱', suggestedActions: ['Organize a clean-up', 'Share your eco impact'] },
  { date: '06-08', title: 'World Oceans Day', description: 'Honoring and protecting our oceans.', emoji: '🐋', suggestedActions: ['Beach clean-up swarm', 'Share ocean facts'] },
  { date: '06-17', title: 'World Day to Combat Desertification', description: 'Fighting land degradation and drought.', emoji: '🏜️', suggestedActions: ['Plant trees', 'Share anti-desertification tips'] },
  { date: '07-26', title: 'International Day of Mangrove Conservation', description: 'Protecting coastal mangrove ecosystems.', emoji: '🌿', suggestedActions: ['Support mangrove planting', 'Send an advocacy letter'] },
  { date: '09-16', title: 'International Day for the Preservation of the Ozone Layer', description: 'Commemorating the Montreal Protocol.', emoji: '🛡️', suggestedActions: ['Share ozone layer facts'] },
  { date: '09-21', title: 'Zero Emissions Day', description: 'A day to reflect on carbon emissions.', emoji: '🚫', suggestedActions: ['Go car-free', 'Track your CO2 savings'] },
  { date: '10-04', title: 'World Animal Day', description: 'Raising the status of animals to improve welfare.', emoji: '🐾', suggestedActions: ['Support animal welfare', 'Share stories'] },
  { date: '11-06', title: 'International Day for Climate Action', description: 'Focused action to address climate change.', emoji: '🔥', suggestedActions: ['Launch a policy petition swarm', 'Send letters to MPs'] },
  { date: '12-05', title: 'World Soil Day', description: 'Promoting healthy soils and sustainable management.', emoji: '🪴', suggestedActions: ['Composting challenge', 'Share soil health tips'] },
  { date: '12-11', title: 'International Mountain Day', description: 'Sustainable development of mountains.', emoji: '⛰️', suggestedActions: ['Hike and clean', 'Awareness campaign'] },
];

function getUpcoming(dates: ClimateDate[]): (ClimateDate & { fullDate: Date; daysUntil: number })[] {
  const now = new Date();
  const year = now.getFullYear();
  
  return dates
    .map(d => {
      const [month, day] = d.date.split('-').map(Number);
      let fullDate = new Date(year, month - 1, day);
      if (fullDate < now) {
        fullDate = new Date(year + 1, month - 1, day);
      }
      const daysUntil = Math.ceil((fullDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...d, fullDate, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function CalendarScreen() {
  const navigate = useNavigate();
  const { user, addPoints, showNotification, updateStats } = useApp();
  const upcoming = getUpcoming(climateDates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSwarmModal, setShowSwarmModal] = useState(false);
  const [swarmPrefill, setSwarmPrefill] = useState<{ name: string; description: string; goal: string; category: string } | null>(null);
  const [activeDeadlines, setActiveDeadlines] = useState<{ id: string; name: string; end_date: string; category: string; participants: number }[]>([]);

  useEffect(() => {
    supabase
      .from('swarms')
      .select('id, name, end_date, category, participants')
      .gt('end_date', new Date().toISOString())
      .order('end_date', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data) setActiveDeadlines(data as any);
      });
  }, []);

  const handleLaunchSwarm = (event: ClimateDate & { fullDate: Date }) => {
    // Map climate date to a swarm category
    const catMap: Record<string, string> = {
      '💧': 'Water', '🌊': 'Water', '🐋': 'Water',
      '🌳': 'Reforestation', '🌿': 'Reforestation', '🪴': 'Reforestation',
      '🦁': 'Wildlife', '🦋': 'Wildlife', '🐾': 'Wildlife',
      '⚡': 'Energy', '🚫': 'Energy',
      '💨': 'Air Quality', '🏜️': 'Air Quality', '🔥': 'Air Quality',
      '♻️': 'Waste',
    };
    const category = catMap[event.emoji] || 'Reforestation';

    setSwarmPrefill({
      name: `${event.title} Campaign ${event.fullDate.getFullYear()}`,
      description: `${event.description} Join this swarm to take collective action on ${event.title}.`,
      goal: event.suggestedActions[0] || 'Take collective action',
      category,
    });
    setShowSwarmModal(true);
  };

  const handleSwarmCreated = async (swarmData: any) => {
    if (!user) return;
    try {
      const { data: newSwarm, error } = await supabase
        .from('swarms')
        .insert({
          name: swarmData.name,
          description: swarmData.description,
          goal: swarmData.goal,
          category: swarmData.category,
          target_signatures: swarmData.targetSignatures,
          current_signatures: 1,
          participants: 1,
          created_by: user.id,
          org_name: swarmData.orgName || null,
          social_links: swarmData.socialLinks || null,
          phone: swarmData.phone || null,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('swarm_memberships').insert({
        swarm_id: newSwarm.id,
        user_id: user.id,
        votes: 1,
      });

      await supabase.from('posts').insert({
        user_id: user.id,
        user_name: user.name,
        content: `🐝 New Swarm Launched: "${swarmData.name}"!\n\n${swarmData.description}\n\n🎯 Goal: ${swarmData.goal}\n\nJoin the campaign!`,
        tags: [swarmData.category.replace(/\s+/g, ''), 'EcoSwarm', 'JoinTheSwarm', `swarm_${newSwarm.id}`],
      });

      addPoints(50);
      updateStats({ postsCreated: user.stats.postsCreated + 1 });
      showNotification('Swarm created from Calendar! 🐝', 50);
    } catch {
      toast.error('Failed to create swarm');
    }
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted text-muted-foreground">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Eco Calendar
            </h1>
            <p className="text-xs text-muted-foreground">Planet-positive dates & campaigns</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-3">
        {/* Active Swarm Deadlines */}
        {activeDeadlines.length > 0 && (
          <div className="eco-card p-4 border-l-4 border-l-secondary mb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-secondary" /> Active Swarm Deadlines
            </h3>
            <div className="space-y-2">
              {activeDeadlines.map(d => {
                const daysLeft = Math.ceil((new Date(d.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <button key={d.id} onClick={() => navigate('/swarms')} className="w-full flex items-center justify-between text-left p-2 rounded-lg bg-muted/50 hover:bg-muted">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">{d.participants} members · {d.category}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      {daysLeft}d left
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Advocacy Link */}
        <button
          onClick={() => navigate('/tools')}
          className="w-full eco-card p-4 flex items-center gap-3 text-left border-l-4 border-l-primary mb-2"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Business Advocacy</p>
            <p className="text-[10px] text-muted-foreground">Launch advocacy campaigns tied to climate events</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        {upcoming.map((event, index) => {
          const isExpanded = expandedId === event.date;
          const isToday = event.daysUntil === 0;
          const isSoon = event.daysUntil <= 3;

          return (
            <button
              key={event.date}
              onClick={() => setExpandedId(isExpanded ? null : event.date)}
              className={`w-full eco-card p-4 text-left transition-all animate-slide-up ${
                isToday ? 'border-l-4 border-l-primary bg-primary/5' : isSoon ? 'border-l-4 border-l-eco-gold' : ''
              }`}
              style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{event.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">{event.title}</h3>
                    {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full eco-gradient-bg text-white font-bold">TODAY</span>}
                    {isSoon && !isToday && <span className="text-[10px] px-2 py-0.5 rounded-full bg-eco-gold/20 text-eco-gold font-bold">SOON</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.fullDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'long' })}
                    {' · '}
                    {isToday ? 'Today!' : `${event.daysUntil} day${event.daysUntil !== 1 ? 's' : ''} away`}
                  </p>

                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Suggested Actions:</p>
                        {event.suggestedActions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-primary">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {action}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLaunchSwarm(event); }}
                          className="flex-1 py-2 px-3 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" /> Create Swarm
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/tools'); }}
                          className="flex-1 py-2 px-3 rounded-xl bg-secondary/10 text-secondary text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          ✉️ Send Letter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>

      {showSwarmModal && (
        <CreateSwarmModal
          isOpen={showSwarmModal}
          onClose={() => { setShowSwarmModal(false); setSwarmPrefill(null); }}
          onSwarmCreated={handleSwarmCreated}
          prefill={swarmPrefill || undefined}
        />
      )}
    </AppLayout>
  );
}
