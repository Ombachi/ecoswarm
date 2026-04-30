import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, ChevronRight, User, MapPin, Heart, Phone, Mail,
  Building2, Globe, FileUp, Briefcase, Eye, EyeOff, Check, X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { kenyanCounties } from "@/data/kenyanCounties";
import { Textarea } from "@/components/ui/textarea";

const companyTypes = [
  "Startup", "NGO", "Cooperative", "Social Enterprise",
  "Government Agency", "Individual Developer", "Other",
];

const productServiceTags = [
  "Solar Products", "Waste Management", "Water Solutions",
  "Reforestation Tools", "Clean Energy", "Carbon Credits",
  "Eco-Fashion", "Organic Farming", "Recycling", "Conservation",
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
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get("role") === "ecodeveloper" ? "ecodeveloper" : "ecowarrior";
  const isDevRole = selectedRole === "ecodeveloper";

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const certFileRef = useRef<HTMLInputElement>(null);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [topConcern, setTopConcern] = useState("");

  // EcoDeveloper-only fields
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [descriptionOfWork, setDescriptionOfWork] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [mainProductsServices, setMainProductsServices] = useState<string[]>([]);

  // Steps differ by role
  const warriorSteps = ["account", "personal", "location", "concern"];
  const devSteps = ["account", "company", "social", "location", "products", "concern"];
  const steps = isDevRole ? devSteps : warriorSteps;
  const totalSteps = steps.length;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

  const canProceed = () => {
    const currentStep = steps[step];
    switch (currentStep) {
      case "account":
        return email && allPasswordChecksPassed && confirmPassword && password === confirmPassword;
      case "personal":
        return name && sex;
      case "company":
        return name && companyName && companyType;
      case "social":
        return true; // All optional
      case "location":
        return county && phone && (county !== "International (Outside Kenya)" || country.trim().length > 0);
      case "products":
        return mainProductsServices.length > 0;
      case "concern":
        return topConcern;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/role-select");
  };

  const toggleProductService = (tag: string) => {
    setMainProductsServices((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const uploadCertification = async (userId: string): Promise<string | null> => {
    if (!certFile) return null;
    const ext = certFile.name.split(".").pop();
    const path = `${userId}/certification.${ext}`;
    const { error } = await supabase.storage.from("eco-certifications").upload(path, certFile, { upsert: true });
    if (error) { console.error("Cert upload error:", error?.message || 'An error occurred'); return null; }
    return path;
  };

  const handleSignup = async () => {
    if (!canProceed()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            name,
            sex,
            county,
            country: county === "International (Outside Kenya)" ? country.trim() : undefined,
            phone,
            top_concern: topConcern,
            role: selectedRole,
          },
        },
      });

      if (error) { toast.error(error.message); return; }

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          toast.error("An account with this email already exists. Please sign in.");
          navigate("/login");
          return;
        }

        // Attempt to create profile, role, badge now (best-effort).
        // If email confirmation is required, auth.uid() may be null and RLS
        // will reject these inserts. That's OK — ensureProfileExists in
        // AppContext will retry everything on first login.
        const userId = data.user.id;

        await supabase.from("profiles").insert({
          user_id: userId,
          email,
          name,
          sex,
          county,
          phone,
          location: county === "International (Outside Kenya)" ? country.trim() : county,
          top_concern: topConcern,
          streak: 1,
          last_active_at: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.warn('Signup profile insert (may retry on login):', error?.message);
        });

        await supabase.from("user_roles").insert({
          user_id: userId,
          role: selectedRole as any,
        }).then(({ error }) => {
          if (error) console.warn('Signup role insert (may retry on login):', error?.message);
        });

        await supabase.from("user_badges").insert({
          user_id: userId,
          badge_id: "1",
        }).then(({ error }) => {
          if (error) console.warn('Signup badge insert (may retry on login):', error?.message);
        });

        // EcoDeveloper: create org profile
        if (isDevRole) {
          const certPath = await uploadCertification(userId);
          await supabase.from("org_profiles" as any).insert({
            user_id: userId,
            company_name: companyName,
            company_type: companyType,
            website_url: websiteUrl || null,
            social_twitter: socialTwitter || null,
            social_instagram: socialInstagram || null,
            social_facebook: socialFacebook || null,
            social_linkedin: socialLinkedin || null,
            description_of_work: descriptionOfWork || null,
            certifications_url: certPath,
            main_products_services: mainProductsServices,
          }).then(({ error }) => {
            if (error) console.warn('Signup org_profile insert (may retry on login):', error?.message);
          });
        }

        toast.success("Please check your email to verify your account! 📧");
        navigate("/login");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const currentStep = steps[step];

    switch (currentStep) {
      case "account":
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Create Your Account</h2>
            <p className="text-muted-foreground mb-6 text-center">
              {isDevRole ? "Register your organization" : "Join the movement for change"}
            </p>
            <div className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" className="eco-input" autoFocus />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password" className="eco-input pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength indicators */}
              {password && (
                <div className="space-y-1.5 px-1">
                  {[
                    { key: "minLength", label: "At least 8 characters" },
                    { key: "hasUpper", label: "One uppercase letter" },
                    { key: "hasLower", label: "One lowercase letter" },
                    { key: "hasNumber", label: "One number" },
                    { key: "hasSpecial", label: "One special character (!@#$...)" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      {passwordChecks[key as keyof typeof passwordChecks] ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-destructive" />
                      )}
                      <span className={passwordChecks[key as keyof typeof passwordChecks] ? "text-primary" : "text-muted-foreground"}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password" className="eco-input pr-12" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>
          </div>
        );

      case "personal":
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Tell Us About Yourself</h2>
            <p className="text-muted-foreground mb-6 text-center">Help us personalize your experience</p>
            <div className="space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" className="eco-input" autoFocus />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sex</p>
                <div className="grid grid-cols-3 gap-3">
                  {["Male", "Female", "Other"].map((option) => (
                    <button key={option} onClick={() => setSex(option)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        sex === option ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
                      }`}>
                      <span className="font-medium text-sm">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "company":
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Organization Details</h2>
            <p className="text-muted-foreground mb-6 text-center">Tell us about your organization</p>
            <div className="space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full name (contact person)" className="eco-input" autoFocus />
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company / Organization name" className="eco-input" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Company Type</p>
                <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className="eco-input">
                  <option value="">Select type...</option>
                  {companyTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Brief Description of Work</p>
                <Textarea value={descriptionOfWork} onChange={(e) => setDescriptionOfWork(e.target.value)}
                  placeholder="1-2 sentences about what your organization does"
                  className="eco-input min-h-[80px]" maxLength={300} />
              </div>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Online Presence</h2>
            <p className="text-muted-foreground mb-6 text-center">All fields are optional</p>
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pb-4">
              <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="Website URL" className="eco-input" />
              <input type="text" value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="X / Twitter handle" className="eco-input" />
              <input type="text" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="Instagram handle" className="eco-input" />
              <input type="text" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="Facebook page" className="eco-input" />
              <input type="text" value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)}
                placeholder="LinkedIn profile" className="eco-input" />
              <div className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileUp className="w-4 h-4" /> Eco-Proof / Certifications
                </p>
                <input ref={certFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  className="eco-input text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium" />
                {certFile && <p className="text-xs text-muted-foreground">📎 {certFile.name}</p>}
              </div>
            </div>
          </div>
        );

      case "location":
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
                <select value={county} onChange={(e) => { setCounty(e.target.value); if (e.target.value !== "International (Outside Kenya)") setCountry(""); }} className="eco-input">
                  {kenyanCounties.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {county === "International (Outside Kenya)" && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your Country</p>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Uganda, Tanzania, Nigeria..."
                    className="eco-input"
                    autoFocus
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <div className="flex gap-2">
                  <div className="eco-input w-20 flex items-center justify-center bg-muted">
                    <Phone className="w-4 h-4 mr-1" />+254
                  </div>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="7XX XXX XXX" className="eco-input flex-1" />
                </div>
              </div>
            </div>
          </div>
        );

      case "products":
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Products & Services</h2>
            <p className="text-muted-foreground mb-6 text-center">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pb-4">
              {productServiceTags.map((tag) => (
                <button key={tag} onClick={() => toggleProductService(tag)}
                  className={`p-3 rounded-xl border-2 transition-all text-left text-sm font-medium ${
                    mainProductsServices.includes(tag)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        );

      case "concern":
        return (
          <div className="animate-slide-up">
            <div className="w-20 h-20 rounded-2xl eco-gradient-bg flex items-center justify-center mb-6 mx-auto">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">What Issue Matters Most?</h2>
            <p className="text-muted-foreground mb-6 text-center">We'll personalize your feed based on your passion</p>
            <div className="grid grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pb-4">
              {concerns.map((concern) => (
                <button key={concern.id} onClick={() => setTopConcern(concern.label)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    topConcern === concern.label
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}>
                  <span className="text-2xl mb-2 block">{concern.emoji}</span>
                  <span className="font-medium text-sm">{concern.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button onClick={handleBack} className="p-2 rounded-full bg-muted text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {isDevRole ? "🏢 EcoDeveloper" : "🌍 EcoWarrior"} Sign Up
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "eco-gradient-bg" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-auto">{renderStep()}</div>

      {/* Footer */}
      <div className="p-6">
        <button onClick={handleNext} disabled={!canProceed() || isLoading}
          className="w-full eco-button-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isLoading ? "Creating account..." : step === totalSteps - 1 ? (
            <>🌍 Join EcoSwarm</>
          ) : (
            <>Continue <ChevronRight className="w-5 h-5" /></>
          )}
        </button>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">Sign In</button>
        </p>
      </div>
    </div>
  );
}
