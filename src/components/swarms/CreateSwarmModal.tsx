import { useState } from 'react';
import { X, Target, Users, Loader2, Building2, Link, Phone, MapPin, Calendar, Globe, Lock, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const goalTypes = [
  { id: 'Conservation Effort', label: 'Conservation Effort', emoji: '🌿' },
  { id: 'Clean-up', label: 'Clean-up', emoji: '🧹' },
  { id: 'Tree Planting', label: 'Tree Planting', emoji: '🌳' },
  { id: 'Policy Petition', label: 'Policy Petition', emoji: '📜' },
  { id: 'Product Drive', label: 'Product Drive', emoji: '📦' },
  { id: 'Skill-Building Challenge', label: 'Skill-Building', emoji: '🎓' },
];

const categories = [
  { id: 'Water', label: 'Water', emoji: '💧' },
  { id: 'Air Quality', label: 'Air Quality', emoji: '💨' },
  { id: 'Reforestation', label: 'Reforestation', emoji: '🌳' },
  { id: 'Waste', label: 'Waste Management', emoji: '♻️' },
  { id: 'Wildlife', label: 'Wildlife', emoji: '🦁' },
  { id: 'Energy', label: 'Clean Energy', emoji: '⚡' },
];

const inviteMethods = [
  { id: 'public', label: 'Public', icon: Globe, desc: 'Anyone can join' },
  { id: 'private', label: 'Private', icon: Lock, desc: 'Invite only' },
  { id: 'link', label: 'Shareable Link', icon: Share2, desc: 'Auto-generated link' },
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
    orgName?: string;
    socialLinks?: string;
    phone?: string;
    goalType: string;
    targetNumber: number;
    endDate: string;
    inviteMethod: string;
    location?: string;
  }) => void;
  prefill?: {
    name: string;
    description: string;
    goal: string;
    category: string;
  };
}

export function CreateSwarmModal({ isOpen, onClose, onSwarmCreated }: CreateSwarmModalProps) {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [phone, setPhone] = useState('');
  const [goalType, setGoalType] = useState('Conservation Effort');
  const [targetNumber, setTargetNumber] = useState('50');
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [inviteMethod, setInviteMethod] = useState('public');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceedStep1 = name.trim() && category;
  const canProceedStep2 = description.trim() && goal.trim() && goalType;
  const canSubmit = canProceedStep1 && canProceedStep2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSwarmCreated({
        name: name.trim(),
        description: description.trim(),
        goal: goal.trim(),
        category,
        targetSignatures: parseInt(targetNumber) || 50,
        orgName: orgName.trim() || undefined,
        socialLinks: socialLinks.trim() || undefined,
        phone: phone.trim() || undefined,
        goalType,
        targetNumber: parseInt(targetNumber),
        endDate: new Date(endDate).toISOString(),
        inviteMethod,
        location: location.trim() || undefined,
      });
      setStep(1);
      setOrgName(''); setName(''); setDescription(''); setGoal('');
      setCategory(''); setSocialLinks('');
      setPhone(''); setGoalType('Conservation Effort'); setTargetNumber('50');
      setInviteMethod('public'); setLocation('');
      onClose();
      toast.success('Swarm launched! 🐝');
    } catch {
      toast.error('Failed to create swarm');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up pb-safe">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="p-1.5 rounded-full bg-muted text-muted-foreground">
                <X className="w-4 h-4 rotate-45" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-foreground">🐝 Launch a Swarm</h2>
              <p className="text-xs text-muted-foreground">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1 px-4 pt-3">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'eco-gradient-bg' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="p-6 space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Swarm Title *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder='e.g., "Join our Mau Forest Conservation Drive"' className="eco-input" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        category === cat.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
                      }`}>
                      <span className="text-xl block mb-1" aria-hidden="true">{cat.emoji}</span>
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Organization (optional)
                </label>
                <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Green Earth Foundation" className="eco-input" />
              </div>

              <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                className="w-full eco-button-primary py-3 text-base disabled:opacity-50">
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Short Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this swarm is about..." className="eco-input min-h-[100px] resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Goal Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {goalTypes.map((gt) => (
                    <button key={gt.id} onClick={() => setGoalType(gt.id)}
                      className={`p-2.5 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${
                        goalType === gt.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
                      }`}>
                      <span aria-hidden="true">{gt.emoji}</span>
                      <span className="text-xs font-medium">{gt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Campaign Goal *
                </label>
                <textarea value={goal} onChange={(e) => setGoal(e.target.value)}
                  placeholder='e.g., "Send 50 advocacy letters to MPs"' className="eco-input min-h-[70px] resize-none" />
              </div>

              <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                className="w-full eco-button-primary py-3 text-base disabled:opacity-50">
                Next →
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Target Number
                </label>
                <input type="number" value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)}
                  placeholder="e.g., 50 volunteers, 200 trees" min="1" className="eco-input" />
                <p className="text-xs text-muted-foreground">e.g., 50 volunteers, 200 trees, 1000 EcoPoints</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> End Date
                </label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} className="eco-input" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Location (optional)
                </label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Mau Forest, Narok County" className="eco-input" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Invite Method</label>
                <div className="space-y-2">
                  {inviteMethods.map((m) => (
                    <button key={m.id} onClick={() => setInviteMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        inviteMethod === m.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
                      }`}>
                      <m.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Link className="w-3 h-3" /> Social Link
                  </label>
                  <input type="url" value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)}
                    placeholder="Optional" className="eco-input text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional" className="eco-input text-sm" />
                </div>
              </div>

              <div className="pb-8">
                <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}
                  className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Launching...</>
                  ) : (
                    <>🐝 Launch Swarm (+50 pts)</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
