import { useState } from 'react';
import { X, Target, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { id: 'Water', label: 'Water', emoji: '💧' },
  { id: 'Air Quality', label: 'Air Quality', emoji: '💨' },
  { id: 'Reforestation', label: 'Reforestation', emoji: '🌳' },
  { id: 'Waste', label: 'Waste Management', emoji: '♻️' },
  { id: 'Wildlife', label: 'Wildlife', emoji: '🦁' },
  { id: 'Energy', label: 'Clean Energy', emoji: '⚡' },
];

interface CreateSwarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwarmCreated: (swarm: {
    name: string;
    description: string;
    goal: string;
    category: string;
    targetSignatures: number;
  }) => void;
}

export function CreateSwarmModal({ isOpen, onClose, onSwarmCreated }: CreateSwarmModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [targetSignatures, setTargetSignatures] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim() && description.trim() && goal.trim() && category && parseInt(targetSignatures) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSwarmCreated({
        name: name.trim(),
        description: description.trim(),
        goal: goal.trim(),
        category,
        targetSignatures: parseInt(targetSignatures),
      });

      // Reset form
      setName('');
      setDescription('');
      setGoal('');
      setCategory('');
      setTargetSignatures('1000');
      onClose();
      toast.success('Swarm created! 🐝');
    } catch (err) {
      toast.error('Failed to create swarm');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Create a Swarm</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-muted text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Clean Air Nairobi"
              className="eco-input"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    category === cat.id
                      ? 'border-primary bg-eco-green-light'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <span className="text-xl block mb-1">{cat.emoji}</span>
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this campaign is about..."
              className="eco-input min-h-[100px] resize-none"
            />
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Campaign Goal
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What do you want to achieve? e.g., Reduce industrial emissions by 50%"
              className="eco-input min-h-[80px] resize-none"
            />
          </div>

          {/* Target Signatures */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Target Signatures
            </label>
            <input
              type="number"
              value={targetSignatures}
              onChange={(e) => setTargetSignatures(e.target.value)}
              min="100"
              max="1000000"
              className="eco-input"
            />
            <p className="text-xs text-muted-foreground">
              How many signatures do you need to make an impact?
            </p>
          </div>

          {/* Submit Button - Added padding at bottom to prevent overlap */}
          <div className="pb-6">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  🐝 Launch Swarm (+50 pts)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
