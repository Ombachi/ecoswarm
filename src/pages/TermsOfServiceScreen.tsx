import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePageMeta } from "@/hooks/usePageMeta";

export function TermsOfServiceScreen() {
  const navigate = useNavigate();
  usePageMeta('Terms of Service', 'Read the EcoSwarm Terms of Service governing your use of our climate action platform, marketplace, and community features.');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">Last updated: February 2026</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">
          {/* Introduction */}
          <div className="eco-card p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Welcome to EcoSwarm</h2>
              <p className="text-sm text-muted-foreground">
                Please read these terms carefully before using our platform.
              </p>
            </div>
          </div>

          {/* Terms Content */}
          <div className="space-y-6 text-foreground">
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                1. Acceptance of Terms
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                By accessing or using EcoSwarm ("the Platform"), you agree to be bound by these Terms of Service. If you
                do not agree to these terms, please do not use the Platform. EcoSwarm is designed for users aged 13 and
                older in Kenya who are passionate about environmental and social activism.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Description of Service</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                EcoSwarm is a digital activism platform that enables users to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 ml-2">
                <li>Share environmental and social stories in the Agora Square</li>
                <li>Join collective action campaigns ("Swarms")</li>
                <li>Send advocacy letters to decision-makers through EcoLetter Forge</li>
                <li>Learn about environmental issues in the Climate Academy</li>
                <li>Earn EcoPoints and badges for positive actions</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. User Accounts</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. You agree to provide accurate and complete information when
                creating your account and to update your information as necessary.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. User Conduct</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">When using EcoSwarm, you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 ml-2">
                <li>Respect other users and engage in constructive dialogue</li>
                <li>Share accurate information and avoid spreading misinformation</li>
                <li>Not post content that is hateful, violent, or illegal</li>
                <li>Not impersonate others or create misleading content</li>
                <li>Not use the platform for spam or commercial solicitation</li>
                <li>Comply with all applicable Kenyan laws and regulations</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Content Ownership</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You retain ownership of content you create and share on EcoSwarm. By posting content, you grant EcoSwarm
                a non-exclusive, worldwide license to display, distribute, and promote your content within the Platform
                for the purpose of advancing environmental activism.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. EcoLetter Communications</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                When you send EcoLetters through our platform, you acknowledge that these are real communications sent
                to actual recipients. You agree to use this feature responsibly and in good faith for legitimate
                advocacy purposes only.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. EcoPoints and Badges</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                EcoPoints and badges are digital recognition of your activism and have monetary value. They can be
                exchanged, transferred, or redeemed for eco-goods. EcoSwarm reserves the right to modify the points
                system at any time.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. Privacy</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your use of EcoSwarm is also governed by our{" "}
                <button onClick={() => navigate("/privacy-policy")} className="text-primary font-medium underline">
                  Privacy Policy
                </button>
                , which describes how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. Termination</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                EcoSwarm reserves the right to suspend or terminate your account if you violate these Terms of Service
                or engage in behavior that harms the community or the Platform's reputation.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">10. Disclaimer</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                EcoSwarm is provided "as is" without warranties of any kind. We do not guarantee that the Platform will
                be uninterrupted, error-free, or that advocacy actions will achieve specific outcomes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">11. Changes to Terms</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We may update these Terms of Service from time to time. We will notify users of significant changes
                through the Platform. Your continued use of EcoSwarm after changes are posted constitutes acceptance of
                the modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">12. Contact Us</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If you have questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@ecoswarm.app" className="text-primary font-medium">
                  support@ecoswarm.app
                </a>
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="eco-card p-4 text-center">
            <p className="text-sm text-muted-foreground">
              By using EcoSwarm, you acknowledge that you have read and understood these terms.
            </p>
            <p className="text-xs text-muted-foreground mt-2">🌍 Together, we make a difference. Asante sana!</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
