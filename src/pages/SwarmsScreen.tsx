import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { CreateSwarmModal } from "@/components/swarms/CreateSwarmModal";
import { toast } from "sonner";
import { Users, Target, ChevronRight, X, Plus, Droplets, Wind, TreePine, Trash2, Loader2, Phone, Link as LinkIcon, Building2 } from "lucide-react";

interface Swarm {
  id: string;
  name: string;
  description: string;
  goal: string;
  category: string;
  target_signatures: number;
  current_signatures: number;
  participants: number;
  image_url?: string;
  created_by: string;
  created_at: string;
  isJoined?: boolean;
}

const categoryIcons: Record<string, any> = {
  Water: Droplets,
  "Air Quality": Wind,
  Reforestation: TreePine,
  Waste: Trash2,
};

export function SwarmsScreen() {
  const { user, addPoints, showNotification, updateStats, earnBadge } = useApp();
  const [swarms, setSwarms] = useState<Swarm[]>([]);
  const [selectedSwarm, setSelectedSwarm] = useState<Swarm | null>(null);
  const [voteValue, setVoteValue] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userMemberships, setUserMemberships] = useState<string[]>([]);

  useEffect(() => {
    loadSwarms();
  }, [user]);

  const loadSwarms = async () => {
    setIsLoading(true);
    try {
      // Fetch all swarms
      const { data: swarmsData, error: swarmsError } = await supabase
        .from("swarms")
        .select("*")
        .order("created_at", { ascending: false });

      if (swarmsError) throw swarmsError;

      // Fetch user's memberships if logged in
      let memberships: string[] = [];
      if (user) {
        const { data: membershipData } = await supabase
          .from("swarm_memberships")
          .select("swarm_id")
          .eq("user_id", user.id);

        memberships = membershipData?.map((m) => m.swarm_id) || [];
        setUserMemberships(memberships);
      }

      // Mark joined swarms
      const swarmsWithJoinStatus = (swarmsData || []).map((swarm) => ({
        ...swarm,
        isJoined: memberships.includes(swarm.id),
      }));

      setSwarms(swarmsWithJoinStatus);
    } catch (error) {
      console.error("Error loading swarms:", (error as Error)?.message || 'An error occurred');
      toast.error("Failed to load swarms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSwarm = async (swarmId: string) => {
    if (!user) {
      toast.error("Please log in to join a swarm");
      return;
    }

    try {
      // Use secure RPC function to join swarm atomically
      const { data, error } = await supabase.rpc('join_swarm', {
        p_swarm_id: swarmId,
        p_votes: voteValue,
      });

      if (error) throw error;

      const result = data as { participants: number; current_signatures: number };

      // Update local state with server values
      setSwarms(
        swarms.map((s) =>
          s.id === swarmId
            ? {
                ...s,
                isJoined: true,
                participants: result.participants,
                current_signatures: result.current_signatures,
              }
            : s,
        ),
      );
      setUserMemberships([...userMemberships, swarmId]);

      addPoints(30);
      const newCount = user.stats.swarmsJoined + 1;
      updateStats({ swarmsJoined: newCount });

      // Award Swarm Leader badge on 5th swarm
      if (newCount >= 5) {
        await earnBadge("3");
      }

      showNotification("Joined swarm! 🐝", 30);
      setSelectedSwarm(null);
      setVoteValue(1);
    } catch (error) {
      console.error("Error joining swarm:", (error as Error)?.message || 'An error occurred');
      toast.error("Failed to join swarm");
    }
  };

  const handleSwarmCreated = async (swarmData: {
    name: string;
    description: string;
    goal: string;
    category: string;
    targetSignatures: number;
    orgName?: string;
    socialLinks?: string;
    phone?: string;
  }) => {
    if (!user) {
      toast.error("Please log in to create a swarm");
      return;
    }

    try {
      const { data: newSwarm, error } = await supabase
        .from("swarms")
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

      // Auto-join the creator
      await supabase.from("swarm_memberships").insert({
        swarm_id: newSwarm.id,
        user_id: user.id,
        votes: 1,
      });

      setSwarms([{ ...newSwarm, isJoined: true }, ...swarms]);
      setUserMemberships([...userMemberships, newSwarm.id]);

      // Auto-post to Agora Square with all details
      const postContent = [
        `🐝 New Swarm Launched: Join "${swarmData.name}"!`,
        swarmData.orgName ? `🏢 By: ${swarmData.orgName}` : '',
        swarmData.socialLinks ? `🔗 ${swarmData.socialLinks}` : '',
        swarmData.phone ? `📞 ${swarmData.phone}` : '',
        `\n${swarmData.description}`,
        `\n🎯 Goal: ${swarmData.goal}`,
        `\nJoin the campaign and make your voice heard!`,
      ].filter(Boolean).join('\n');

      await supabase.from("posts").insert({
        user_id: user.id,
        user_name: user.name,
        content: postContent,
        tags: [swarmData.category.replace(/\s+/g, ''), 'EcoSwarm', 'JoinTheSwarm', `swarm_${newSwarm.id}`],
      });

      // Notify all users about the new swarm
      const { data: allProfiles } = await supabase
        .from("public_profiles")
        .select("user_id")
        .neq("user_id", user.id);

      if (allProfiles && allProfiles.length > 0) {
        const notifications = allProfiles
          .filter((p) => p.user_id)
          .map((p) => ({
            user_id: p.user_id!,
            type: 'swarm',
            title: '🐝 New Swarm Launched!',
            message: `Join "${swarmData.name}" — ${swarmData.description.substring(0, 80)}...`,
            reference_id: newSwarm.id,
          }));

        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications);
        }
      }

      addPoints(50);
      updateStats({ postsCreated: user.stats.postsCreated + 1 });
      showNotification("Swarm created & posted to Agora! 🐝", 50);
    } catch (error) {
      console.error("Error creating swarm:", (error as Error)?.message || 'An error occurred');
      toast.error("Failed to create swarm");
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Swarms Hub</h1>
            <p className="text-xs text-muted-foreground">Join campaigns that matter</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="eco-button-primary py-2 px-4 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Swarms List */}
      <div className="p-4 space-y-4">
        {swarms.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No swarms yet. Be the first to create one!</p>
          </div>
        ) : (
          swarms.map((swarm, index) => {
            const Icon = categoryIcons[swarm.category] || Users;
            const progress = getProgressPercentage(swarm.current_signatures, swarm.target_signatures);

            return (
              <button
                key={swarm.id}
                onClick={() => setSelectedSwarm(swarm)}
                className="w-full eco-card p-4 text-left animate-slide-up hover:shadow-lg transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{swarm.name}</h3>
                      {swarm.isJoined && <span className="eco-badge text-[10px]">Joined</span>}
                    </div>
                    {(swarm as any).org_name && (
                      <p className="text-xs text-primary font-medium mb-0.5">🏢 {(swarm as any).org_name}</p>
                    )}
                    {(swarm as any).social_links && (
                      <a
                        href={(swarm as any).social_links}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-0.5"
                      >
                        <LinkIcon className="w-3 h-3" />
                        {(swarm as any).social_links}
                      </a>
                    )}
                    {(swarm as any).phone && (
                      <a
                        href={`tel:${(swarm as any).phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-1"
                      >
                        <Phone className="w-3 h-3" />
                        {(swarm as any).phone}
                      </a>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{swarm.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full eco-gradient-bg rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {swarm.current_signatures.toLocaleString()} / {swarm.target_signatures.toLocaleString()}{" "}
                          signatures
                        </span>
                        <span className="text-xs font-semibold text-primary">{Math.round(progress)}%</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {swarm.participants.toLocaleString()} EcoWarriors joined
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Swarm Detail Modal */}
      {selectedSwarm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[80vh] overflow-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{selectedSwarm.name}</h2>
              <button
                onClick={() => {
                  setSelectedSwarm(null);
                  setVoteValue(1);
                }}
                className="p-2 rounded-full bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Org & Contact Info */}
              {((selectedSwarm as any).org_name || (selectedSwarm as any).social_links || (selectedSwarm as any).phone) && (
                <div className="eco-card p-4 space-y-2">
                  {(selectedSwarm as any).org_name && (
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {(selectedSwarm as any).org_name}
                    </p>
                  )}
                  {(selectedSwarm as any).social_links && (
                    <a
                      href={(selectedSwarm as any).social_links}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {(selectedSwarm as any).social_links}
                    </a>
                  )}
                  {(selectedSwarm as any).phone && (
                    <a
                      href={`tel:${(selectedSwarm as any).phone}`}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {(selectedSwarm as any).phone}
                    </a>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-muted-foreground leading-relaxed">{selectedSwarm.description}</p>
              </div>

              {/* Goal */}
              <div className="eco-card p-4 bg-eco-green-light border-none">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Campaign Goal</p>
                    <p className="text-sm text-muted-foreground">{selectedSwarm.goal}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedSwarm.current_signatures.toLocaleString()} signatures
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full eco-gradient-bg rounded-full transition-all"
                    style={{
                      width: `${getProgressPercentage(
                        selectedSwarm.current_signatures,
                        selectedSwarm.target_signatures,
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Goal: {selectedSwarm.target_signatures.toLocaleString()} signatures
                </p>
              </div>

              {/* Quadratic Voting */}
              {!selectedSwarm.isJoined && (
                <div className="eco-card p-4">
                  <h3 className="font-semibold text-foreground mb-2">Quadratic Voting Power</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose how many votes to contribute. Your influence = votes²
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={voteValue}
                      onChange={(e) => setVoteValue(parseInt(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <div className="w-16 text-center">
                      <span className="text-2xl font-bold text-primary">{voteValue}</span>
                      <p className="text-[10px] text-muted-foreground">votes</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                    <span className="text-sm text-muted-foreground">Your influence:</span>
                    <span className="text-lg font-bold eco-gradient-text">{voteValue * voteValue} signatures</span>
                  </div>
                </div>
              )}

              {/* Join Button */}
              {!selectedSwarm.isJoined ? (
                <button
                  onClick={() => handleJoinSwarm(selectedSwarm.id)}
                  className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Join Swarm (+30 pts)
                </button>
              ) : (
                <div className="eco-card p-4 bg-eco-green-light border-none text-center">
                  <p className="font-semibold text-primary">✓ You're part of this swarm!</p>
                  <p className="text-sm text-muted-foreground mt-1">Check back for updates and actions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Swarm Modal */}
      <CreateSwarmModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSwarmCreated={handleSwarmCreated}
      />
    </AppLayout>
  );
}
