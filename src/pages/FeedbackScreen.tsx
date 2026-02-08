import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useApp } from "@/context/AppContext";
import { ChevronLeft, MessageCircle, Send, Loader2, Bug, Lightbulb, ThumbsUp, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const feedbackSchema = z.object({
  type: z.string().min(1, "Please select a feedback type"),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject must be less than 100 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

export function FeedbackScreen() {
  const navigate = useNavigate();
  const { user } = useApp();

  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const feedbackTypes = [
    { id: "bug", label: "Bug Report", icon: Bug, color: "text-destructive" },
    { id: "feature", label: "Feature Request", icon: Lightbulb, color: "text-eco-gold" },
    { id: "praise", label: "Praise", icon: ThumbsUp, color: "text-primary" },
    { id: "help", label: "Help Needed", icon: HelpCircle, color: "text-secondary" },
  ];

  const handleSubmit = async () => {
    setErrors({});

    const validation = feedbackSchema.safeParse({ type, subject, message });
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate sending feedback (in production, this would go to a database or email service)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Thank you for your feedback! 💚");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Send Feedback</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Intro */}
        <div className="eco-card p-6 text-center">
          <div className="w-16 h-16 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">We Would Love to Hear From You!</h2>
          <p className="text-muted-foreground text-sm">Your feedback helps us make EcoSwarm better for everyone.</p>
        </div>

        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">What type of feedback?</label>
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypes.map((item) => (
              <button
                key={item.id}
                onClick={() => setType(item.id)}
                className={`eco-card p-4 flex flex-col items-center gap-2 transition-all ${
                  type === item.id ? "ring-2 ring-primary bg-primary/5" : ""
                }`}
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
          {errors.type && <p className="text-destructive text-xs mt-2">{errors.type}</p>}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your feedback"
            className="w-full eco-input"
            maxLength={100}
          />
          {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Your Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more about your feedback..."
            className="w-full eco-input min-h-[150px] resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            {errors.message && <p className="text-destructive text-xs">{errors.message}</p>}
            <p className="text-xs text-muted-foreground ml-auto">{message.length}/1000</p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="eco-card p-4 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Submitting as:</p>
            <p className="font-medium text-foreground">{user.name}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full eco-button-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Feedback
            </>
          )}
        </button>
      </div>
    </AppLayout>
  );
}
