import { useState, useEffect } from 'react';
import { CourseCover } from '@/components/common/CourseCover';
import { Button } from '@/components/ui/button';
import { courseCategoryUrl } from '@/lib/courseCategories';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [params] = useSearchParams();
  const category = params.get('category');
  const { user } = useApp();
  usePageMeta('Climate Academy', 'Learn climate and environmental skills with EcoSwarm courses.');
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
      const { data } = await supabase.from('courses').select('*').eq('is_active', true).order('sort_order');
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

  const filteredModules = learningModules.filter(m => !category || m.category === category);

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto w-full px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">Climate Academy</h1>
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
            {filteredModules.slice((page - 1) * COURSES_PER_PAGE, page * COURSES_PER_PAGE).map((module: any, index: number) => {
              const isCompleted = completedModules.includes(module.id);
              return (
                <article key={module.id} className="border border-border bg-card rounded-lg overflow-hidden flex flex-col">
                  <CourseCover src={module.image_url} title={module.title} />
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1">{module.description}</p>
                    <div className="flex flex-wrap gap-2 items-center mt-3"><Button variant="ghost" size="sm" className="text-primary h-auto p-0 whitespace-normal text-left" onClick={() => navigate(courseCategoryUrl(module.category))}>{module.category}</Button><span className="text-xs text-muted-foreground">{module.duration}</span></div>
                    <Button className="mt-4" onClick={() => navigate(`/module/${module.id}`)}>{isCompleted ? 'Review course' : 'Start learning'}<ChevronRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          pageCount={Math.ceil(filteredModules.length / COURSES_PER_PAGE)}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      </div>
    </AppLayout>
  );
}
