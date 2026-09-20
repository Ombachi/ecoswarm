import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, ChevronRight, Check, Play, BookOpen } from 'lucide-react';
import { CourseGridSkeleton, EmptyState } from '@/components/common/Skeletons';
import { Pagination } from '@/components/common/Pagination';

const COURSES_PER_PAGE = 9;

export function ToolsScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  usePageMeta('Capacity Hub', 'Learn climate and environmental skills with EcoSwarm courses.');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [learningModules, setLearningModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadContent();
    if (user) {
      loadCompletions();
    }
  }, [user]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('courses').select('*').order('sort_order');
      setLearningModules(data || []);
    } catch (error) {
      console.error('Error loading courses:', (error as Error)?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
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

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto w-full px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">Capacity Hub</h1>
            <p className="text-xs text-muted-foreground">Build your climate skills</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24 max-w-6xl mx-auto w-full">
        <p className="text-sm text-muted-foreground">Complete courses and earn certificates</p>

        {isLoading ? (
          <CourseGridSkeleton />
        ) : learningModules.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-7 h-7" />}
            title="No courses published yet"
            description="New climate skills courses are on the way. Check back soon."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {learningModules.slice((page - 1) * COURSES_PER_PAGE, page * COURSES_PER_PAGE).map((module: any, index: number) => {
              const isCompleted = completedModules.includes(module.id);
              return (
                <button
                  key={module.id}
                  onClick={() => navigate(`/module/${module.id}`)}
                  className="eco-card p-4 animate-slide-up text-left"
                  style={{ animationDelay: `${Math.min(index, 5) * 0.08}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isCompleted ? 'eco-gradient-bg' : 'bg-muted'}`}>
                      {isCompleted ? <Check className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{module.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="eco-badge text-[10px]">{module.category}</span>
                        <span className="text-xs text-muted-foreground">{module.duration}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          pageCount={Math.ceil(learningModules.length / COURSES_PER_PAGE)}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      </div>
    </AppLayout>
  );
}
