import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { mockSwarms } from '@/data/mockData';
import { Swarm } from '@/types/ecoswarm';
import { CreateSwarmModal } from '@/components/swarms/CreateSwarmModal';
import {
  Users,
  Target,
  ChevronRight,
  X,
  Plus,
  Droplets,
  Wind,
  TreePine,
  Trash2,
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  Water: Droplets,
  'Air Quality': Wind,
  Reforestation: TreePine,
  Waste: Trash2,
};

export function SwarmsScreen() {
  const { user, addPoints, showNotification, updateStats, earnBadge } = useApp();
  const [swarms, setSwarms] = useState<Swarm[]>(mockSwarms);
  const [selectedSwarm, setSelectedSwarm] = useState<Swarm | null>(null);
  const [voteValue, setVoteValue] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleJoinSwarm = async (swarmId: string) => {
    setSwarms(
      swarms.map((swarm) =>
        swarm.id === swarmId
          ? {
              ...swarm,
              isJoined: true,
              participants: swarm.participants + 1,
              currentSignatures: swarm.currentSignatures + voteValue * voteValue,
            }
          : swarm
      )
    );
    addPoints(30);
    if (user) {
      const newCount = user.stats.swarmsJoined + 1;
      updateStats({ swarmsJoined: newCount });

      // Award Swarm Leader badge on 5th swarm
      if (newCount >= 5) {
        await earnBadge('3');
      }
    }
    showNotification('Joined swarm! 🐝', 30);
    setSelectedSwarm(null);
    setVoteValue(1);
  };

  const handleSwarmCreated = (swarmData: {
    name: string;
    description: string;
    goal: string;
    category: string;
    targetSignatures: number;
  }) => {
    const newSwarm: Swarm = {
      id: Date.now().toString(),
      name: swarmData.name,
      description: swarmData.description,
      goal: swarmData.goal,
      category: swarmData.category,
      targetSignatures: swarmData.targetSignatures,
      currentSignatures: 1,
      participants: 1,
      createdAt: new Date(),
      isJoined: true,
    };

    setSwarms([newSwarm, ...swarms]);
    addPoints(50);
    showNotification('Swarm created! 🐝', 50);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

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
        {swarms.map((swarm, index) => {
          const Icon = categoryIcons[swarm.category] || Users;
          const progress = getProgressPercentage(
            swarm.currentSignatures,
            swarm.targetSignatures
          );

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
                    <h3 className="font-semibold text-foreground truncate">
                      {swarm.name}
                    </h3>
                    {swarm.isJoined && (
                      <span className="eco-badge text-[10px]">Joined</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {swarm.description}
                  </p>

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
                        {swarm.currentSignatures.toLocaleString()} /{' '}
                        {swarm.targetSignatures.toLocaleString()} signatures
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {swarm.participants.toLocaleString()} Gen Z joined
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Swarm Detail Modal */}
      {selectedSwarm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-card w-full rounded-t-3xl max-h-[90vh] overflow-auto animate-slide-up">
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
              {/* Description */}
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedSwarm.description}
                </p>
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
                    {selectedSwarm.currentSignatures.toLocaleString()} signatures
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full eco-gradient-bg rounded-full transition-all"
                    style={{
                      width: `${getProgressPercentage(
                        selectedSwarm.currentSignatures,
                        selectedSwarm.targetSignatures
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Goal: {selectedSwarm.targetSignatures.toLocaleString()} signatures
                </p>
              </div>

              {/* Quadratic Voting */}
              {!selectedSwarm.isJoined && (
                <div className="eco-card p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    Quadratic Voting Power
                  </h3>
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
                    <span className="text-lg font-bold eco-gradient-text">
                      {voteValue * voteValue} signatures
                    </span>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back for updates and actions
                  </p>
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
