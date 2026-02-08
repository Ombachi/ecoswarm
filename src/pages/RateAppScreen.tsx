import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { 
  ChevronLeft, 
  Star, 
  Send, 
  Loader2,
  Heart,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Confetti } from '@/components/common/Confetti';

export function RateAppScreen() {
  const navigate = useNavigate();
  const { user, addPoints, showNotification } = useApp();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const ratingLabels = [
    '',
    'Poor 😞',
    'Fair 😐',
    'Good 🙂',
    'Great 😊',
    'Excellent! 🌟',
  ];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowConfetti(true);
      setHasSubmitted(true);
      addPoints(10);
      showNotification('Thanks for rating! 💚', 10);
      
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <AppLayout>
        {showConfetti && <Confetti />}
        
        <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-muted text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Rate EcoSwarm</h1>
          </div>
        </div>

        <div className="px-4 py-12 text-center">
          <div className="w-24 h-24 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <Heart className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">Thank You! 💚</h2>
          
          <p className="text-muted-foreground mb-8">
            Your feedback means the world to us and helps make EcoSwarm better for all young EcoWarriors in Kenya!
          </p>

          <div className="flex justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${star <= rating ? 'text-eco-gold fill-eco-gold' : 'text-muted-foreground'}`}
              />
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="eco-button-primary py-3 px-8"
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-muted text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Rate EcoSwarm</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Intro */}
        <div className="eco-card p-6 text-center">
          <div className="w-16 h-16 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">How's Your Experience?</h2>
          <p className="text-muted-foreground text-sm">
            Rate EcoSwarm and earn 10 EcoPoints! Your feedback helps us grow.
          </p>
        </div>

        {/* Star Rating */}
        <div className="eco-card p-6 text-center">
          <p className="text-sm font-semibold text-foreground mb-4">Tap to rate:</p>
          
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-eco-gold fill-eco-gold'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          {(rating > 0 || hoveredRating > 0) && (
            <p className="text-lg font-semibold text-foreground animate-slide-up">
              {ratingLabels[hoveredRating || rating]}
            </p>
          )}
        </div>

        {/* Optional Review */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Tell us more (optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="What do you love about EcoSwarm? Any suggestions?"
            className="w-full eco-input min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{review.length}/500</p>
        </div>

        {/* Points Reward */}
        <div className="eco-card p-4 bg-eco-green-light border-none flex items-center gap-4">
          <div className="w-12 h-12 rounded-full eco-gradient-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Earn +10 EcoPoints!</p>
            <p className="text-xs text-muted-foreground">
              Thanks for taking the time to rate us
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full eco-button-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Rating
            </>
          )}
        </button>
      </div>
    </AppLayout>
  );
}
