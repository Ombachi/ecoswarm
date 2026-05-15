import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChevronLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

export function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: `We collect information you provide directly to us, including:
      
• **Account Information**: Name, email address, phone number, county, age, and gender when you create an account.
• **Profile Information**: Bio, avatar, and environmental concerns you choose to share.
• **Activity Data**: Posts, comments, likes, swarm memberships, letters sent, and courses completed.
• **Device Information**: Basic device and browser information for app functionality.

We do NOT collect or store sensitive personal data beyond what is necessary for app functionality.`,
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: `Your information is used to:

• Provide and maintain EcoSwarm services
• Track your EcoPoints, badges, and streaks
• Display your contributions on the public leaderboard
• Enable you to participate in swarms and send EcoLetters
• Improve and personalize your experience
• Send important notifications about your account and campaigns
• Analyze app usage to improve our platform

We never sell your personal data to third parties.`,
    },
    {
      icon: Lock,
      title: "Data Security",
      content: `We take data security seriously:

• All data is encrypted in transit using TLS/SSL
• Passwords are securely hashed and never stored in plain text
• Database access is protected by Row-Level Security policies
• Regular security audits are conducted
• We use industry-standard cloud infrastructure (Supabase)

While we implement strong security measures, no system is 100% secure. We encourage you to use strong passwords and keep your account credentials safe.`,
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: `You have the right to:

• **Access**: Request a copy of your personal data
• **Correction**: Update or correct your information via your profile
• **Deletion**: Request deletion of your account and associated data
• **Portability**: Export your data in a machine-readable format
• **Opt-out**: Disable notifications and certain data collection

To exercise these rights, contact us through the Send Feedback feature or email us directly.`,
    },
    {
      icon: Shield,
      title: "Data Retention",
      content: `We retain your data as follows:

• **Account Data**: Kept until you delete your account
• **Activity Data**: Posts and contributions remain for community benefit unless you delete them
• **Analytics Data**: Anonymized after 12 months

When you delete your account, we remove your personal data within 30 days, except where required by law.`,
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: `For privacy-related questions or concerns:

• Use the **Send Feedback** feature in Settings
• Email: feedback@ecoswarm.ke
• Address: EcoSwarm Kenya, Nairobi, Kenya

We respond to all privacy inquiries within 7 business days.

**Last Updated**: February 2026`,
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Intro */}
        <div className="eco-card p-6 text-center">
          <div className="w-16 h-16 rounded-full eco-gradient-bg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Your Privacy Matters</h2>
          <p className="text-muted-foreground text-sm">
            EcoSwarm is committed to protecting your privacy and being transparent about how we handle your data.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div key={index} className="eco-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">{section.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{section.content}</div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>© 2026 EcoSwarm. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
}
