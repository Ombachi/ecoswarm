import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { mockLearningModules } from '@/data/mockData';
import { Confetti } from '@/components/common/Confetti';
import { supabase } from '@/integrations/supabase/client';
import {
  ChevronLeft,
  Play,
  CheckCircle,
  ChevronRight,
  Award,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Extended module content with study material and questions
const moduleContent: Record<string, {
  sections: { title: string; content: string }[];
  videoUrl?: string;
  questions: { question: string; options: string[]; correct: number }[];
}> = {
  '1': {
    sections: [
      {
        title: 'What is Advocacy?',
        content: 'Advocacy is the act of supporting or arguing for a cause, policy, or group of people. As a young activist, advocacy means using your voice to influence decisions that affect your community.\n\nEffective advocacy combines:\n• Clear messaging\n• Understanding your audience\n• Building coalitions\n• Persistent engagement',
      },
      {
        title: 'Key Advocacy Skills',
        content: '1. **Research**: Know your facts before speaking\n2. **Communication**: Tailor your message to your audience\n3. **Networking**: Build relationships with allies\n4. **Persistence**: Change takes time and repeated effort\n5. **Storytelling**: Personal stories create emotional connections',
      },
      {
        title: 'Advocacy in Action',
        content: 'Here are practical ways to advocate:\n\n• Write letters to decision-makers\n• Use social media strategically\n• Organize community meetings\n• Join or create swarm campaigns\n• Speak at public forums\n• Partner with local organizations',
      },
    ],
    questions: [
      {
        question: 'What is the most effective way to connect emotionally with your audience?',
        options: ['Sharing statistics', 'Personal storytelling', 'Using technical language', 'Being aggressive'],
        correct: 1,
      },
      {
        question: 'Which is NOT a key advocacy skill?',
        options: ['Research', 'Communication', 'Intimidation', 'Persistence'],
        correct: 2,
      },
      {
        question: 'Why is building coalitions important in advocacy?',
        options: ['To share responsibility', 'To amplify collective voice', 'To reduce workload', 'All of the above'],
        correct: 3,
      },
    ],
  },
  '2': {
    sections: [
      {
        title: 'Kenya\'s Climate Framework',
        content: 'Kenya has several key climate policies:\n\n• **Climate Change Act 2016**: Establishes the legal framework for climate action\n• **National Climate Change Action Plan (NCCAP)**: Sets strategic priorities\n• **Vision 2030**: Includes environmental sustainability goals\n• **NDCs**: Kenya\'s commitments under the Paris Agreement',
      },
      {
        title: 'Key Government Bodies',
        content: 'Understanding who makes decisions:\n\n• **Ministry of Environment**: Primary policy maker\n• **NEMA**: National Environment Management Authority\n• **County Governments**: Local implementation\n• **Climate Change Council**: Chaired by the President',
      },
      {
        title: 'How You Can Influence Policy',
        content: 'Youth can participate in governance through:\n\n• Public participation in county planning\n• Submitting memoranda on proposed laws\n• Engaging MPs and MCAs\n• Joining civil society coalitions\n• Using EcoLetter Forge to reach officials',
      },
    ],
    questions: [
      {
        question: 'When was Kenya\'s Climate Change Act enacted?',
        options: ['2010', '2016', '2020', '2022'],
        correct: 1,
      },
      {
        question: 'Which body is primarily responsible for environment management in Kenya?',
        options: ['KRA', 'NEMA', 'KEBS', 'CBK'],
        correct: 1,
      },
      {
        question: 'What are NDCs?',
        options: ['National Development Centers', 'Nationally Determined Contributions', 'Natural Disaster Controls', 'None of the above'],
        correct: 1,
      },
    ],
  },
  '3': {
    sections: [
      {
        title: 'The Power of Digital Activism',
        content: 'Social media has revolutionized activism:\n\n• **Reach**: Connect with millions instantly\n• **Speed**: Mobilize quickly for urgent issues\n• **Documentation**: Record and share evidence\n• **Democratization**: Everyone has a voice',
      },
      {
        title: 'Creating Viral Content',
        content: 'Tips for impactful content:\n\n1. **Hook in 3 seconds**: Grab attention immediately\n2. **Emotional resonance**: Make people feel something\n3. **Clear call-to-action**: Tell people what to do\n4. **Shareable format**: Easy to repost\n5. **Hashtag strategy**: Join trending conversations',
      },
      {
        title: 'Hashtag Movements',
        content: 'Successful Kenya hashtag campaigns:\n\n• #PlantYourAge\n• #ClimateStrikeKE\n• #NairobiRiverCleanUp\n• #PlasticFreeKenya\n\nCreate your own movement with:\n• Unique, memorable hashtag\n• Clear goal\n• Call for participation',
      },
    ],
    questions: [
      {
        question: 'How quickly should you grab attention in video content?',
        options: ['10 seconds', '3 seconds', '30 seconds', '1 minute'],
        correct: 1,
      },
      {
        question: 'What makes content shareable?',
        options: ['Being very long', 'Using complex language', 'Having emotional resonance', 'Including many ads'],
        correct: 2,
      },
      {
        question: 'Which is a successful Kenya hashtag campaign?',
        options: ['#MakeAmericaGreat', '#PlantYourAge', '#Brexit', '#SaveTwitter'],
        correct: 1,
      },
    ],
  },
  '4': {
    sections: [
      {
        title: 'Constitutional Rights',
        content: 'The Constitution of Kenya 2010 guarantees:\n\n• **Article 42**: Right to a clean and healthy environment\n• **Article 69**: Obligations for environmental protection\n• **Article 70**: Enforcement of environmental rights\n\nYou can go to court if these rights are violated!',
      },
      {
        title: 'Environmental Laws',
        content: 'Key legislation protecting you:\n\n• **Environmental Management and Coordination Act (EMCA)**\n• **Wildlife Conservation Act**\n• **Water Act**\n• **Forest Conservation Act**\n• **Climate Change Act 2016**',
      },
      {
        title: 'Taking Legal Action',
        content: 'How to enforce your rights:\n\n1. Document the violation\n2. Report to NEMA or relevant authority\n3. File a complaint or petition\n4. Seek legal aid if needed\n5. Use public interest litigation\n\nOrganizations like KELI and Greenpeace can help!',
      },
    ],
    questions: [
      {
        question: 'Which article guarantees the right to a clean environment?',
        options: ['Article 10', 'Article 42', 'Article 50', 'Article 100'],
        correct: 1,
      },
      {
        question: 'What is EMCA?',
        options: ['Emergency Management Act', 'Environmental Management and Coordination Act', 'Energy Management Act', 'Economic Management Act'],
        correct: 1,
      },
      {
        question: 'Can you take legal action for environmental violations?',
        options: ['No, never', 'Only companies can', 'Yes, through Article 70', 'Only the government can'],
        correct: 2,
      },
    ],
  },
  '5': {
    sections: [
      {
        title: 'Why Build Coalitions?',
        content: 'Coalition power:\n\n• **Amplified voice**: More people = more impact\n• **Shared resources**: Pool skills and funds\n• **Diverse perspectives**: Better solutions\n• **Legitimacy**: Represent broader community\n• **Resilience**: Movement survives individual burnout',
      },
      {
        title: 'Finding Allies',
        content: 'Potential coalition partners:\n\n• Student groups and clubs\n• Religious organizations\n• Community-based organizations\n• Professional associations\n• Other swarms on EcoSwarm\n• International networks',
      },
      {
        title: 'Leading Effective Coalitions',
        content: 'Leadership principles:\n\n1. **Shared vision**: Align on common goals\n2. **Clear roles**: Define responsibilities\n3. **Inclusive decisions**: Everyone has voice\n4. **Regular communication**: Keep members informed\n5. **Celebrate wins**: Acknowledge progress\n6. **Manage conflict**: Address issues early',
      },
    ],
    questions: [
      {
        question: 'What is a key benefit of coalitions?',
        options: ['Less work for everyone', 'Amplified collective voice', 'Avoiding responsibility', 'Reducing membership'],
        correct: 1,
      },
      {
        question: 'Who can be a coalition partner?',
        options: ['Only NGOs', 'Only government', 'Various groups including students and CBOs', 'Only international organizations'],
        correct: 2,
      },
      {
        question: 'What should leaders do with conflict?',
        options: ['Ignore it', 'Address it early', 'Let it escalate', 'Blame others'],
        correct: 1,
      },
    ],
  },
};

export function ModuleScreen() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user, addPoints, showNotification, completeCourse, earnBadge } = useApp();

  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const module = mockLearningModules.find((m) => m.id === moduleId);
  const content = moduleId ? moduleContent[moduleId] : null;

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

  if (!module || !content) {
    return (
      <AppLayout>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Module not found</p>
          <button onClick={() => navigate('/tools')} className="eco-button-primary mt-4">
            Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleNextSection = () => {
    if (currentSection < content.sections.length - 1) {
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
    if (selectedAnswer === content.questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < content.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      const finalScore = selectedAnswer === content.questions[currentQuestion].correct
        ? score + 1
        : score;

      setQuizCompleted(true);

      if (finalScore >= content.questions.length * 0.7 && !alreadyCompleted) {
        setShowConfetti(true);
        addPoints(module.points);
        await completeCourse(moduleId!);

        // Check if earned the Educator badge (all modules complete)
        if (user && user.stats.coursesCompleted + 1 >= mockLearningModules.length) {
          await earnBadge('8');
        }

        showNotification(`Module completed! 🎓`, module.points);
        toast.success(`You earned ${module.points} EcoPoints!`);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const progress = showQuiz 
    ? 100 
    : ((currentSection + 1) / content.sections.length) * 80;

  return (
    <AppLayout>
      {showConfetti && <Confetti />}

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
          </div>
        </div>
        
        {/* Progress bar */}
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
                  Section {currentSection + 1} of {content.sections.length}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-foreground mb-4">
                {content.sections[currentSection].title}
              </h2>
              
              <div className="prose prose-sm text-foreground whitespace-pre-line">
                {content.sections[currentSection].content}
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
                {currentSection === content.sections.length - 1 ? (
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

        {showQuiz && !quizCompleted && (
          <div className="animate-slide-up">
            <div className="eco-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {content.questions.length}
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground mb-6">
                {content.questions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {content.questions[currentQuestion].options.map((option, index) => (
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
              {currentQuestion === content.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}

        {quizCompleted && (
          <div className="animate-bounce-in text-center py-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              score >= content.questions.length * 0.7 
                ? 'eco-gradient-bg' 
                : 'bg-muted'
            }`}>
              {score >= content.questions.length * 0.7 ? (
                <Award className="w-12 h-12 text-white" />
              ) : (
                <BookOpen className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {score >= content.questions.length * 0.7 ? 'Congratulations! 🎉' : 'Keep Learning!'}
            </h2>

            <p className="text-lg text-muted-foreground mb-2">
              You scored {score} out of {content.questions.length}
            </p>

            {score >= content.questions.length * 0.7 ? (
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
