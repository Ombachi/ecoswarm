import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { SponsorBadge } from '@/components/sponsorship/SponsorBadge';
import { SponsorCourseModal } from '@/components/sponsorship/SponsorCourseModal';
import { GraduationCap, ChevronRight, Check, Play, Building2 } from 'lucide-react';

export function ToolsScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  usePageMeta('Capacity Hub', 'Learn climate and environmental skills with EcoSwarm courses and earn EcoPoints.');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [learningModules, setLearningModules] = useState<any[]>([]);
  const [sponsorships, setSponsorships] = useState<Record<string, { name: string; logo: string | null }>>({});
  const [sponsoringCourse, setSponsoringCourse] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    loadContent();
    if (user) {
      loadCompletions();
      loadSponsorships();
    }
  }, [user]);

  const loadContent = async () => {
    try {
      const { data } = await supabase.from('courses').select('*').order('sort_order');
      setLearningModules(data || []);
    } catch (error) {
      console.error('Error loading courses:', (error as Error)?.message || 'An error occurred');
    }
  };

  const loadCompletions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('course_completions')
      .select('module_id')
      .eq('user_id', user.id);
    setCompletedModules(data?.map((c) => c.module_id) || []);
  };

  const loadSponsorships = async () => {
    const { data } = await supabase
      .from('course_sponsorships')
      .select('course_id, sponsor_name, sponsor_logo_url')
      .eq('status', 'approved');
    const map: Record<string, { name: string; logo: string | null }> = {};
    (data || []).forEach((s: any) => {
      map[s.course_id] = { name: s.sponsor_name, logo: s.sponsor_logo_url };
    });
    setSponsorships(map);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Capacity Hub</h1>
            <p className="text-xs text-muted-foreground">Build your climate skills</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        <p className="text-sm text-muted-foreground">Complete courses, earn EcoPoints and certificates</p>
        <div className="grid gap-4">
          {learningModules.map((module: any, index: number) => {
            const isCompleted = completedModules.includes(module.id);
            return (
              <button
                key={module.id}
                onClick={() => navigate(`/module/${module.id}`)}
                className="eco-card p-4 animate-slide-up text-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isCompleted ? 'eco-gradient-bg' : 'bg-muted'}`}>
                    {isCompleted ? <Check className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{module.title}</h3>
                      {sponsorships[module.id] && (
                        <SponsorBadge sponsorName={sponsorships[module.id].name} logoUrl={sponsorships[module.id].logo} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{module.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="eco-badge text-[10px]">{module.category}</span>
                      <span className="text-xs text-muted-foreground">{module.duration}</span>
                      <span className="text-xs text-primary font-medium">+{module.points} pts</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Sponsor a course */}
        {learningModules.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Sponsor a Course
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Back educational content and get your brand on it</p>
            <div className="space-y-2">
              {learningModules.filter((m: any) => !sponsorships[m.id]).map((m: any) => (
                <button key={m.id} onClick={() => setSponsoringCourse({ id: m.id, title: m.title })} className="w-full p-3 rounded-xl border border-border hover:border-primary/50 text-left transition-all">
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  <p className="text-[10px] text-muted-foreground">Click to sponsor</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {sponsoringCourse && (
        <SponsorCourseModal courseId={sponsoringCourse.id} courseTitle={sponsoringCourse.title} onClose={() => setSponsoringCourse(null)} />
      )}
    </AppLayout>
  );
}
