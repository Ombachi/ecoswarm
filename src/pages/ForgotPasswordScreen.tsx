import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Check your email 📧",
        description: "We sent you a password reset link",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
        <div className="absolute top-0 left-0 right-0 h-64 eco-gradient-bg opacity-95" />
        
        <div className="relative z-10 pt-12 pb-8 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Check Your Email</h1>
          <p className="text-white/80 mt-1">We've sent you a reset link</p>
        </div>

        <div className="relative z-10 flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-8 pb-6">
          <div className="text-center space-y-6">
            <div className="eco-card p-6">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Password Reset Email Sent
              </h2>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and click the link to reset your password.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setIsSuccess(false)}
                className="text-primary font-medium"
              >
                try again
              </button>
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full eco-button-secondary py-3"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-64 eco-gradient-bg opacity-95" />
      
      <div className="relative z-10 pt-12 pb-8 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
          <Leaf className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Forgot Password?</h1>
        <p className="text-white/80 mt-1">No worries, we'll help you reset it</p>
      </div>

      <div className="relative z-10 flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-8 pb-6">
        <form onSubmit={handleResetRequest} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoComplete="email"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the email address you used to create your account
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <Link 
          to="/login"
          className="flex items-center justify-center gap-2 mt-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
