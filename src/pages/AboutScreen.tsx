import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AboutStory } from "@/components/about/AboutStory";
import { Button } from "@/components/ui/button";

export function AboutScreen() {
  const navigate = useNavigate();
  usePageMeta("About", "Learn about EcoSwarm — Kenya's platform for climate education and sustainable shopping.");

  return (
    <PublicLayout>
      <AboutStory />
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto eco-gradient-bg rounded-3xl p-8 text-center text-primary-foreground">
          <h3 className="text-2xl md:text-3xl font-black mb-3">Ready to Learn & Shop Green?</h3>
          <p className="text-primary-foreground/80 mb-6">Join EcoSwarm and start your climate journey today.</p>
          <Button size="lg" onClick={() => navigate("/signup")} className="bg-card text-primary hover:bg-card/90 font-bold">
            Get Started
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
