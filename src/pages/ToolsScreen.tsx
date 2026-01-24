import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { mockLetterTemplates, mockRecipients, mockLearningModules } from '@/data/mockData';
import { Confetti } from '@/components/common/Confetti';
import {
  Mail,
  GraduationCap,
  ChevronRight,
  X,
  Check,
  Play,
  Lock,
  Share2,
} from 'lucide-react';

export function ToolsScreen() {
  const { user, addPoints, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'letter' | 'learn'>('letter');
  const [letterStep, setLetterStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [personalStory, setPersonalStory] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmitLetter = () => {
    setShowConfetti(true);
    setShowSuccess(true);
    addPoints(50);
    showNotification('EcoLetter sent! 📨', 50);
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const resetLetter = () => {
    setLetterStep(0);
    setSelectedTemplate('');
    setPersonalStory('');
    setSelectedRecipient('');
    setShowPreview(false);
    setShowSuccess(false);
  };

  const getPreviewLetter = () => {
    const template = mockLetterTemplates.find((t) => t.id === selectedTemplate);
    const recipient = mockRecipients.find((r) => r.id === selectedRecipient);
    if (!template || !recipient || !user) return '';

    return template.content
      .replace('[Recipient]', `${recipient.title} ${recipient.name}`)
      .replace('[PERSONAL_STORY]', personalStory || 'I have personally witnessed...')
      .replace('[YOUR_NAME]', user.name)
      .replace('[YOUR_LOCATION]', user.location);
  };

  return (
    <AppLayout>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground">Activist Tools</h1>
          <p className="text-xs text-muted-foreground">Make your voice heard</p>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'letter'
                ? 'eco-gradient-bg text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            EcoLetter Forge
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'learn'
                ? 'eco-gradient-bg text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Capacity Hub
          </button>
        </div>
      </div>

      {/* EcoLetter Forge */}
      {activeTab === 'letter' && !showSuccess && (
        <div className="p-4">
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-6">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    letterStep > step
                      ? 'eco-gradient-bg text-white'
                      : letterStep === step
                      ? 'border-2 border-primary text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {letterStep > step ? <Check className="w-4 h-4" /> : step + 1}
                </div>
                {step < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      letterStep > step ? 'eco-gradient-bg' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Template */}
          {letterStep === 0 && (
            <div className="animate-slide-up space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Choose a Template</h2>
              <p className="text-sm text-muted-foreground">
                Select an advocacy letter template for your cause
              </p>

              <div className="space-y-3">
                {mockLetterTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-eco-green-light'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="eco-badge text-[10px] mb-1">{template.category}</span>
                        <p className="font-semibold text-foreground">{template.title}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setLetterStep(1)}
                disabled={!selectedTemplate}
                className="w-full eco-button-primary py-4 mt-4 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Add Personal Story */}
          {letterStep === 1 && (
            <div className="animate-slide-up space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Add Your Story</h2>
              <p className="text-sm text-muted-foreground">
                Make it personal - how does this issue affect you?
              </p>

              <textarea
                value={personalStory}
                onChange={(e) => setPersonalStory(e.target.value)}
                placeholder="Share your experience... For example: 'I live near Dandora dumpsite and the air quality affects my family's health daily...'"
                className="eco-input min-h-[150px] resize-none"
              />

              <p className="text-xs text-muted-foreground">
                💡 Tip: Personal stories are 3x more effective than facts alone
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setLetterStep(0)}
                  className="flex-1 eco-button-secondary py-3"
                >
                  Back
                </button>
                <button
                  onClick={() => setLetterStep(2)}
                  disabled={!personalStory}
                  className="flex-1 eco-button-primary py-3 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Recipient */}
          {letterStep === 2 && (
            <div className="animate-slide-up space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Select Recipient</h2>
              <p className="text-sm text-muted-foreground">
                Choose who will receive your advocacy letter
              </p>

              <div className="space-y-3">
                {mockRecipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => setSelectedRecipient(recipient.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRecipient === recipient.id
                        ? 'border-primary bg-eco-green-light'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <p className="font-semibold text-foreground">{recipient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {recipient.title}, {recipient.organization}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setLetterStep(1)}
                  className="flex-1 eco-button-secondary py-3"
                >
                  Back
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!selectedRecipient}
                  className="flex-1 eco-button-primary py-3 disabled:opacity-50"
                >
                  Preview Letter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {activeTab === 'letter' && showSuccess && (
        <div className="p-6 text-center animate-bounce-in">
          <div className="w-24 h-24 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Letter Sent! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Your voice has been heard. You earned +50 EcoPoints!
          </p>

          <div className="eco-card p-4 mb-6">
            <p className="text-sm font-medium text-foreground mb-2">Share your action:</p>
            <div className="bg-eco-gradient-light p-4 rounded-xl text-center">
              <p className="font-semibold text-foreground">
                "I just sent my EcoLetter to advocate for Kenya's environment! 🌍"
              </p>
              <p className="text-primary text-sm mt-1">#EcoSwarm #ClimateAction</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 eco-button-secondary py-3 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share to X
            </button>
            <button onClick={resetLetter} className="flex-1 eco-button-primary py-3">
              Send Another
            </button>
          </div>
        </div>
      )}

      {/* Letter Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-card w-full rounded-t-3xl max-h-[90vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Letter Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-full bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-muted rounded-xl p-4 mb-6 font-mono text-sm whitespace-pre-line text-foreground">
                {getPreviewLetter()}
              </div>

              <button
                onClick={handleSubmitLetter}
                className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Send EcoLetter (+50 pts)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Hub */}
      {activeTab === 'learn' && (
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Build your advocacy skills and earn badges
          </p>

          <div className="grid gap-4">
            {mockLearningModules.map((module, index) => (
              <div
                key={module.id}
                className="eco-card p-4 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      module.completed
                        ? 'eco-gradient-bg'
                        : 'bg-muted'
                    }`}
                  >
                    {module.completed ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : module.progress && module.progress > 0 ? (
                      <Play className="w-6 h-6 text-primary" />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{module.title}</h3>
                      <span className="eco-badge text-[10px]">{module.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        ⏱️ {module.duration}
                      </span>
                      <span className="text-xs text-primary font-medium">
                        +{module.points} pts
                      </span>
                    </div>

                    {module.progress !== undefined && module.progress > 0 && !module.completed && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full eco-gradient-bg rounded-full"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {module.progress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
