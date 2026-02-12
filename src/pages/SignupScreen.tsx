import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, ChevronLeft, ChevronRight, User, MapPin, Heart, Phone, Mail, CheckCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const counties = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Kiambu",
  "Machakos",
  "Kajiado",
  "Uasin Gishu",
  "Nyeri",
  "Meru",
  "Kilifi",
  "Kakamega",
  "Bungoma",
  "Kisii",
  "Nyamira",
  "Trans Nzoia",
  "Nandi",
  "Kericho",
  "Bomet",
];

const roles = [
  { id: "ecowarrior", label: "EcoWarrior", emoji: "🌍", description: "Activist / User — browse, post, send letters, join hubs", tooltip: "EcoWarrior: Join, share, act. Browse eco-content, post in Agora Square, send letters to leaders, and join capacity hubs." },
  { id: "ecodeveloper", label: "EcoDeveloper", emoji: "🏢", description: "Org / Company — all above + create products in EcoMarket", tooltip: "EcoDeveloper: For orgs/devs to market eco-products. Everything Warriors get, plus create and manage product listings in EcoMarket." },
];

const concerns = [
  { id: "climate", label: "Climate Action", emoji: "🌡️" },
  { id: "environmental", label: "Environmental Challenges", emoji: "🌍" },
  { id: "ecosystem", label: "Ecosystem Challenges", emoji: "🦋" },
  { id: "global-commons", label: "Global Commons", emoji: "🌐" },
  { id: "education", label: "Climate Education", emoji: "📚" },
  { id: "environment", label: "Environmental Protection", emoji: "🌳" },
];

export function SignupScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [phone, setPhone] = useState("");
  const [topConcern, setTopConcern] = useState("");
  const [selectedRole, setSelectedRole] = useState("ecowarrior");
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const canProceed = () => {
    switch (step) {
      case 0:
        return email && password && confirmPassword && password === confirmPassword && password.length >= 6;
      case 1:
        return name && sex;
      case 2:
        return county && phone;
      case 3:
        return topConcern;
      case 4:
        return selectedRole;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate("/");
    }
  };

  const handleSignup = async () => {
    if (!canProceed()) return;

    setIsLoading(true);
    try {
      // First, sign up with Supabase to create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            name,
            sex,
            county,
            phone,
            top_concern: topConcern,
            role: selectedRole,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Create profile immediately (user exists but email not verified yet)
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          email,
          name,
          sex,
          county,
          phone,
          location: county,
          top_concern: topConcern,
          streak: 1,
          last_active_at: new Date().toISOString(),
        });

        // Assign role
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: selectedRole as any,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Profile might already exist, that's okay
        }

        // Award First Steps badge
        await supabase.from("user_badges").insert({
          user_id: data.user.id,
          badge_id: "1", // First Steps badge
        });

        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          // User already exists
          toast.error("An account with this email already exists. Please sign in.");
          navigate("/login");
          return;
        }

        // Show verification message - don't navigate to dashboard
        toast.success("Please check your email to verify your account! 📧");
        navigate("/login");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Create Your Account</h2>
            <p className="text-muted-foreground mb-6 text-center">Join the movement for change</p>
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="eco-input"
                autoFocus
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="eco-input"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="eco-input"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Tell Us About Yourself</h2>
            <p className="text-muted-foreground mb-6 text-center">Help us personalize your experience</p>
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="eco-input"
                autoFocus
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sex</p>
                <div className="grid grid-cols-3 gap-3">
                  {["Male", "Female", "Other"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSex(option)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        sex === option
                          ? "border-primary bg-eco-green-light"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium text-sm">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Where Are You Based?</h2>
            <p className="text-muted-foreground mb-6 text-center">We'll connect you with local communities</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">County</p>
                <select value={county} onChange={(e) => setCounty(e.target.value)} className="eco-input">
                  {counties.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <div className="flex gap-2">
                  <div className="eco-input w-20 flex items-center justify-center bg-muted">
                    <Phone className="w-4 h-4 mr-1" />
                    +254
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7XX XXX XXX"
                    className="eco-input flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">What Issue Matters Most?</h2>
            <p className="text-muted-foreground mb-6 text-center">We'll personalize your feed based on your passion</p>
            <div className="grid grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pb-4">
              {concerns.map((concern) => (
                <button
                  key={concern.id}
                  onClick={() => setTopConcern(concern.label)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    topConcern === concern.label
                      ? "border-primary bg-eco-green-light"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{concern.emoji}</span>
                  <span className="font-medium text-sm">{concern.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Choose Your Role</h2>
            <p className="text-muted-foreground mb-6 text-center">You can always change this later</p>
            <TooltipProvider delayDuration={200}>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="relative">
                    <button
                      onClick={() => setSelectedRole(role.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedRole === role.id
                          ? "border-primary bg-eco-green-light"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{role.emoji}</span>
                        <div className="flex-1">
                          <span className="font-bold text-foreground block">{role.label}</span>
                          <span className="text-xs text-muted-foreground">{role.description}</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="w-4 h-4" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[260px] text-xs">
                            {role.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center">
        <button onClick={handleBack} className="p-2 rounded-full bg-muted text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "eco-gradient-bg" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-auto">{renderStep()}</div>

      {/* Footer */}
      <div className="p-6">
        <button
          onClick={handleNext}
          disabled={!canProceed() || isLoading}
          className="w-full eco-button-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            "Creating account..."
          ) : step === 4 ? (
            <>🌍 Join EcoSwarm</>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
