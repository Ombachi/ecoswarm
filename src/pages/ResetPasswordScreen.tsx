import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
    };
    
    // Handle the hash fragment from the email link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => setIsValidSession(true))
        .catch(() => {
          toast({
            title: "Invalid link",
            description: "This reset link has expired. Please request a new one.",
            variant: "destructive",
          });
        });
    } else {
      checkSession();
    }
  }, [toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

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
        title: "Password updated! 🎉",
        description: "You can now sign in with your new password",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
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
          <h1 className="text-3xl font-black tracking-tight">Password Reset!</h1>
          <p className="text-white/80 mt-1">You're all set</p>
        </div>

        <div className="relative z-10 flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-8 pb-6">
          <div className="text-center space-y-6">
            <div className="eco-card p-6">
              <div className="w-16 h-16 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Password Successfully Updated
              </h2>
              <p className="text-muted-foreground text-sm">
                Redirecting you to sign in...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Verifying Link...</h1>
          <p className="text-muted-foreground">Please wait while we verify your reset link</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-64 eco-gradient-bg opacity-95" />
      
      <div className="relative z-10 pt-12 pb-8 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
          <Lock className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">New Password</h1>
        <p className="text-white/80 mt-1">Create a new secure password</p>
      </div>

      <div className="relative z-10 flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-8 pb-6">
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoComplete="new-password"
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-500">Passwords don't match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || password !== confirmPassword}
            className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
