import { useState, useEffect } from 'react';
import { GoldenCertificate } from '@/components/certificates/GoldenCertificate';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Confetti } from '@/components/common/Confetti';
import { SponsorBadge } from '@/components/sponsorship/SponsorBadge';
import {
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  HelpCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { createAutoPost, buildCourseAutoPost } from '@/utils/autoPost';
import { sanitizeCourseHtml } from '@/lib/sanitize';

interface Section {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  sort_order: number;
}

/**
 * Render course content as HTML. New content is authored as HTML by the WYSIWYG editor.
 * Legacy markdown-style content is converted on the fly (no asterisks or hashtags rendered).
 */
function RenderCourseContent({ content }: { content: string }) {
  const html = toHtml(content || '');
  return (
    <div
      className={
        'prose prose-sm max-w-none text-foreground ' +
        '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2 ' +
        '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-2 ' +
        '[&_h4]:text-base [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-2 [&_h4]:mb-1 ' +
        '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-2 ' +
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 ' +
        '[&_a]:text-primary [&_a]:underline [&_a]:break-all hover:[&_a]:opacity-80 ' +
        '[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline ' +
        '[&_p]:my-1 [&_p]:text-sm [&_p]:leading-relaxed ' +
        '[&_img]:w-full [&_img]:rounded-xl [&_img]:my-3 [&_img]:max-h-[400px] [&_img]:object-contain ' +
        '[&_video]:w-full [&_video]:rounded-xl [&_video]:my-3 ' +
        '[&_iframe]:w-full [&_iframe]:h-full'
      }
      dangerouslySetInnerHTML={{ __html: sanitizeCourseHtml(html) }}
    />
  );
}

function toHtml(content: string): string {
  const hasHtml = /<\/?[a-z][\s\S]*?>/i.test(content);
  if (hasHtml) return content;

  // Legacy markdown path: convert known patterns, then strip any leftover * and # markers.
  let s = content;
  // Media tags (must run before generic link)
  s = s.replace(/\[video\]\(([^)]+)\)/g, (_, u) => {
    const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m
      ? `<div class="my-3 aspect-video rounded-xl overflow-hidden"><iframe src="https://www.youtube.com/embed/${m[1]}" class="w-full h-full" allowfullscreen frameborder="0" title="Video"></iframe></div>`
      : `<video src="${u}" controls></video>`;
  });
  s = s.replace(/\[image\]\(([^)]+)\)/g, '<img src="$1" alt="" />');
  s = s.replace(/\[file:([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">📎 $1</a>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Inline formatting
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  // Headings & quotes (line-based)
  const lines = s.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false; } };
  for (const raw of lines) {
    const l = raw;
    if (/^### +/.test(l)) { closeList(); out.push(`<h4>${l.replace(/^### +/, '')}</h4>`); continue; }
    if (/^## +/.test(l))  { closeList(); out.push(`<h3>${l.replace(/^## +/, '')}</h3>`); continue; }
    if (/^# +/.test(l))   { closeList(); out.push(`<h2>${l.replace(/^# +/, '')}</h2>`); continue; }
    if (/^> +/.test(l))   { closeList(); out.push(`<blockquote>${l.replace(/^> +/, '')}</blockquote>`); continue; }
    if (/^- +/.test(l))   {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${l.replace(/^- +/, '')}</li>`);
      continue;
    }
    closeList();
    if (l.trim() === '') { out.push('<br/>'); continue; }
    out.push(`<p>${l}</p>`);
  }
  closeList();
  let html = out.join('\n');
  // Strip any residual stray * or leading # characters (user request: no markdown chars in content)
  html = html.replace(/\*+/g, '').replace(/(^|>)\s*#+\s*/g, '$1');
  return html;
}

export function ModuleScreen() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user, addPoints, showNotification, completeCourse, earnBadge, updateStats } = useApp();

  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certId, setCertId] = useState('');
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalModules, setTotalModules] = useState(0);
  const [isLoadingModule, setIsLoadingModule] = useState(true);
  const [sponsor, setSponsor] = useState<{ name: string; logo: string | null } | null>(null);

  // Fetch course, sections, and questions from database
  useEffect(() => {
    const fetchCourse = async () => {
      if (!moduleId) return;
      setIsLoadingModule(true);

      const [courseRes, sectionsRes, questionsRes, countRes, sponsorRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', moduleId).maybeSingle(),
        supabase.from('course_sections').select('*').eq('course_id', moduleId).order('sort_order'),
        supabase.from('course_questions').select('*').eq('course_id', moduleId).order('sort_order'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('course_sponsorships').select('sponsor_name, sponsor_logo_url').eq('course_id', moduleId).eq('status', 'approved').maybeSingle(),
      ]);

      if (courseRes.data) {
        setModule({
          id: courseRes.data.id,
          title: courseRes.data.title,
          description: courseRes.data.description,
          duration: courseRes.data.duration,
          points: courseRes.data.points,
          category: courseRes.data.category,
        });
      }
      setSections(sectionsRes.data || []);
      setQuestions((questionsRes.data || []).map(q => ({
        ...q,
        options: q.options as unknown as string[],
      })));
      setTotalModules(countRes.count || 0);
      if (sponsorRes.data) {
        setSponsor({ name: sponsorRes.data.sponsor_name, logo: sponsorRes.data.sponsor_logo_url });
      }
      setIsLoadingModule(false);
    };
    fetchCourse();
  }, [moduleId]);

  useEffect(() => {
    checkIfCompleted();
  }, [moduleId, user]);

  const checkIfCompleted = async () => {
    if (!user || !moduleId) return;
    const { data } = await supabase
      .from('course_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .maybeSingle();
    setAlreadyCompleted(!!data);
  };

  if (isLoadingModule) {
    return (
      <AppLayout>
        <div className="p-4 text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading module...</p>
        </div>
      </AppLayout>
    );
  }

  if (!module || sections.length === 0) {
    return (
      <AppLayout>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Module not found or has no content yet.</p>
          <button onClick={() => navigate('/tools')} className="eco-button-primary mt-4">
            Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === questions[currentQuestion].correct_index) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      const finalScore = selectedAnswer === questions[currentQuestion].correct_index
        ? score + 1
        : score;

      setQuizCompleted(true);

      if (finalScore >= questions.length * 0.7 && !alreadyCompleted) {
        setShowConfetti(true);
        addPoints(module.points);
        await completeCourse(moduleId!);
        supabase.rpc('award_co2', { p_user_id: user!.id, p_action_type: 'course_completed' });

        if (user && user.stats.coursesCompleted + 1 >= totalModules) {
          await earnBadge('8');
        }

        showNotification(`Module completed! 🎓`, module.points);

        // Generate cert ID
        const newCertId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setCertId(newCertId);

        if (user) {
          await createAutoPost({
            userId: user.id,
            userName: user.name,
            content: buildCourseAutoPost(module.title, module.points),
            tags: ['CapacityHub', 'Learning', 'EcoSwarm', 'ClimateEducation'],
          });
          updateStats({ postsCreated: user.stats.postsCreated + 1 });
        }

        setTimeout(() => {
          setShowConfetti(false);
          setShowCertificate(true);
        }, 2000);
      }
    }
  };

  const progress = showQuiz
    ? 100
    : ((currentSection + 1) / sections.length) * 80;

  return (
    <AppLayout>
      {showConfetti && <Confetti />}
      {showCertificate && user && module && (
        <GoldenCertificate
          userName={user.name}
          courseTitle={module.title}
          completionDate={new Date()}
          certId={certId}
          points={module.points}
          onClose={() => {
            setShowCertificate(false);
            navigate('/tools');
          }}
        />
      )}
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => navigate('/tools')}
            className="p-2 rounded-full bg-muted text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{module.title}</h1>
            <p className="text-xs text-muted-foreground">{module.category} • {module.duration}</p>
            {sponsor && (
              <div className="mt-1">
                <SponsorBadge sponsorName={sponsor.name} logoUrl={sponsor.logo} />
              </div>
            )}
          </div>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full eco-gradient-bg rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!showQuiz && !quizCompleted && (
          <div className="animate-slide-up">
            <div className="eco-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Section {currentSection + 1} of {sections.length}
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-4">
                {sections[currentSection].title}
              </h2>

              <div className="prose prose-sm text-foreground">
                <RenderCourseContent content={sections[currentSection].content} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrevSection}
                disabled={currentSection === 0}
                className="flex-1 eco-button-secondary py-3 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNextSection}
                className="flex-1 eco-button-primary py-3 flex items-center justify-center gap-2"
              >
                {currentSection === sections.length - 1 ? (
                  <>
                    <HelpCircle className="w-5 h-5" />
                    Take Quiz
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {showQuiz && !quizCompleted && questions.length > 0 && (
          <div className="animate-slide-up">
            <div className="eco-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground mb-6">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === index
                        ? 'border-primary bg-eco-green-light'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium text-foreground">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="w-full eco-button-primary py-4 disabled:opacity-50"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}

        {quizCompleted && (
          <div className="animate-bounce-in text-center py-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              score >= questions.length * 0.7
                ? 'eco-gradient-bg'
                : 'bg-muted'
            }`}>
              {score >= questions.length * 0.7 ? (
                <Award className="w-12 h-12 text-white" />
              ) : (
                <BookOpen className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {score >= questions.length * 0.7 ? 'Congratulations! 🎉' : 'Keep Learning!'}
            </h2>

            <p className="text-lg text-muted-foreground mb-2">
              You scored {score} out of {questions.length}
            </p>

            {score >= questions.length * 0.7 ? (
              <p className="text-primary font-semibold mb-6">
                +{module.points} EcoPoints earned!
              </p>
            ) : (
              <p className="text-muted-foreground mb-6">
                Score at least 70% to earn points. Try again!
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowQuiz(false);
                  setCurrentSection(0);
                  setCurrentQuestion(0);
                  setSelectedAnswer(null);
                  setScore(0);
                  setQuizCompleted(false);
                }}
                className="flex-1 eco-button-secondary py-3"
              >
                Review Module
              </button>
              <button
                onClick={() => navigate('/tools')}
                className="flex-1 eco-button-primary py-3"
              >
                Back to Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
