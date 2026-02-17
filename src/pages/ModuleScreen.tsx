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
  '6': {
    sections: [
      {
        title: 'Understanding Carbon Footprint',
        content: 'Your carbon footprint is the total greenhouse gas emissions caused by your activities:\n\n• **Transportation**: Cars, buses, flights\n• **Food**: Meat production, food miles\n• **Energy**: Electricity, cooking fuel\n• **Consumption**: Clothes, electronics, packaging\n\nThe average Kenyan emits about 0.3 tonnes CO2/year, while the global average is 4.7 tonnes.',
      },
      {
        title: 'Calculating Your Footprint',
        content: 'Key factors to consider:\n\n1. **Daily commute**: Mode of transport and distance\n2. **Diet choices**: Meat frequency, local vs. imported food\n3. **Home energy**: Electricity usage, cooking fuel\n4. **Waste**: Recycling habits, single-use plastics\n\nUse online calculators like the WWF Footprint Calculator!',
      },
      {
        title: 'Reducing Your Impact',
        content: 'Practical steps for Kenya:\n\n• Walk, cycle, or use public transport\n• Eat more local, plant-based foods\n• Use energy-efficient appliances\n• Reduce, reuse, recycle\n• Plant trees and support reforestation\n• Choose products with minimal packaging',
      },
    ],
    questions: [
      {
        question: 'What is the average carbon footprint of a Kenyan?',
        options: ['0.3 tonnes/year', '4.7 tonnes/year', '10 tonnes/year', '1 tonne/year'],
        correct: 0,
      },
      {
        question: 'Which activity typically has the highest carbon footprint?',
        options: ['Walking', 'Air travel', 'Cycling', 'Public transport'],
        correct: 1,
      },
      {
        question: 'How can you reduce food-related emissions?',
        options: ['Eat more imported food', 'Eat more local, plant-based foods', 'Increase meat consumption', 'Use more packaging'],
        correct: 1,
      },
    ],
  },
  '7': {
    sections: [
      {
        title: 'Sustainable Business Models',
        content: 'Green entrepreneurship creates value while protecting the environment:\n\n• **Circular economy**: Design out waste\n• **Social enterprise**: Profit with purpose\n• **B Corps**: Certified sustainable businesses\n• **Impact investing**: Financial returns + social good',
      },
      {
        title: 'Green Business Ideas for Kenya',
        content: 'Opportunities in Kenya\'s green economy:\n\n• Solar installation and maintenance\n• Organic farming and urban agriculture\n• Recycling and upcycling businesses\n• Eco-tourism and conservation\n• Clean cookstoves and energy solutions\n• Water purification services\n• Sustainable fashion and crafts',
      },
      {
        title: 'Starting Your Green Business',
        content: 'Steps to launch:\n\n1. **Identify a problem**: What environmental issue can you solve?\n2. **Validate your idea**: Talk to potential customers\n3. **Build a prototype**: Start small and test\n4. **Find funding**: Grants, investors, competitions\n5. **Measure impact**: Track environmental and social metrics\n\nPrograms like Kenya Climate Ventures support green startups!',
      },
    ],
    questions: [
      {
        question: 'What is a circular economy?',
        options: ['Economy based on circles', 'Design out waste and keep materials in use', 'Buying in bulk', 'Trading locally'],
        correct: 1,
      },
      {
        question: 'Which is a green business opportunity in Kenya?',
        options: ['Fossil fuel extraction', 'Solar installation', 'Deforestation', 'Plastic production'],
        correct: 1,
      },
      {
        question: 'What should you do first when starting a green business?',
        options: ['Find investors', 'Identify a problem to solve', 'Build a factory', 'Hire many employees'],
        correct: 1,
      },
    ],
  },
  '8': {
    sections: [
      {
        title: 'Climate Change Impacts in Kenya',
        content: 'Kenya is highly vulnerable to climate change:\n\n• **Droughts**: Increasing in frequency and severity\n• **Floods**: Flash floods in urban areas\n• **Temperature rise**: Heat stress on crops and people\n• **Sea level rise**: Threatening coastal communities\n• **Water scarcity**: Affecting agriculture and livelihoods',
      },
      {
        title: 'Climate Adaptation Strategies',
        content: 'How communities are adapting:\n\n• **Drought-resistant crops**: Sorghum, millet, cassava\n• **Water harvesting**: Rain tanks, dams, conservation\n• **Early warning systems**: Meteorological data sharing\n• **Climate-smart agriculture**: Agroforestry, mulching\n• **Mangrove restoration**: Coastal protection',
      },
      {
        title: 'Building Community Resilience',
        content: 'Actions for resilient communities:\n\n1. Diversify livelihoods beyond climate-sensitive activities\n2. Strengthen social networks and mutual support\n3. Invest in education and skills training\n4. Protect and restore natural ecosystems\n5. Advocate for climate finance and support\n\nYouth can lead community adaptation efforts!',
      },
    ],
    questions: [
      {
        question: 'Which is a climate adaptation strategy?',
        options: ['Burning more fossil fuels', 'Using drought-resistant crops', 'Cutting down forests', 'Increasing water waste'],
        correct: 1,
      },
      {
        question: 'What is climate-smart agriculture?',
        options: ['Using more chemicals', 'Practices that increase productivity while adapting to climate change', 'Monoculture farming', 'Burning crop residues'],
        correct: 1,
      },
      {
        question: 'How can youth help build community resilience?',
        options: ['Ignore climate issues', 'Lead adaptation efforts', 'Wait for government action', 'Move to other countries'],
        correct: 1,
      },
    ],
  },
  '9': {
    sections: [
      {
        title: 'Youth in Climate Negotiations',
        content: 'Young people have a powerful voice in global climate action:\n\n• **UNFCCC COPs**: Annual climate summits where youth participate\n• **Youth constituencies**: Official youth representation (YOUNGO)\n• **Greta Thunberg effect**: Youth activism on global stage\n• **Fridays for Future**: Global student movement',
      },
      {
        title: 'How to Participate',
        content: 'Ways to engage in global climate action:\n\n• Join Kenyan youth climate networks\n• Attend virtual COP events and side events\n• Submit statements to UN processes\n• Partner with international youth organizations\n• Share local stories on global platforms\n• Connect with the African Youth Climate Assembly',
      },
      {
        title: 'Making Your Voice Heard',
        content: 'Tips for effective global engagement:\n\n1. **Know the process**: Understand how decisions are made\n2. **Build networks**: Connect with youth from other countries\n3. **Tell local stories**: Ground global issues in local reality\n4. **Use media strategically**: Amplify your message\n5. **Follow up**: Advocacy doesn\'t end at the conference',
      },
    ],
    questions: [
      {
        question: 'What is YOUNGO?',
        options: ['A youth NGO in Kenya', 'Official youth constituency at UNFCCC', 'A social media platform', 'A government agency'],
        correct: 1,
      },
      {
        question: 'What is Fridays for Future?',
        options: ['A music festival', 'Global student climate strike movement', 'A TV show', 'A government program'],
        correct: 1,
      },
      {
        question: 'How can Kenyan youth participate in global climate action?',
        options: ['Only by traveling abroad', 'Through virtual events and local networks', 'Only adults can participate', 'By ignoring international processes'],
        correct: 1,
      },
    ],
  },
  '10': {
    sections: [
      {
        title: 'The Water Crisis',
        content: 'Water is essential for life, but it\'s increasingly scarce:\n\n• **60%** of Kenyans lack access to clean water\n• **Climate change** is making droughts worse\n• **Population growth** increases demand\n• **Pollution** contaminates available sources\n• **Inequality**: Rural and informal settlements most affected',
      },
      {
        title: 'Water Conservation Techniques',
        content: 'Practical water-saving methods:\n\n• **Rainwater harvesting**: Tanks, dams, ponds\n• **Drip irrigation**: Efficient agricultural water use\n• **Greywater recycling**: Reuse household water\n• **Fix leaks**: Prevent water waste\n• **Water-efficient appliances**: Low-flow taps and toilets',
      },
      {
        title: 'Advocating for Water Rights',
        content: 'Water is a human right (Article 43 of Kenya Constitution):\n\n1. Monitor water quality in your community\n2. Report pollution to NEMA and Water Resources Authority\n3. Advocate for equitable water access\n4. Support community water projects\n5. Join water conservation campaigns\n\nOrganizations like the Kenya Water Institute support water advocacy!',
      },
    ],
    questions: [
      {
        question: 'What percentage of Kenyans lack access to clean water?',
        options: ['10%', '30%', '60%', '90%'],
        correct: 2,
      },
      {
        question: 'What is drip irrigation?',
        options: ['Flooding fields with water', 'Efficient method delivering water directly to plant roots', 'Spraying water in the air', 'Using rainwater only'],
        correct: 1,
      },
      {
        question: 'Which article of Kenya\'s Constitution guarantees water rights?',
        options: ['Article 10', 'Article 27', 'Article 43', 'Article 70'],
        correct: 2,
      },
    ],
  },
  '11': {
    sections: [
      {
        title: 'Kenya\'s Waste Problem',
        content: 'Kenya generates over 22,000 tonnes of waste daily:\n\n• **Only 10%** is recycled\n• **Plastic**: 2 million tonnes annually\n• **E-waste**: Fastest growing waste stream\n• **Open dumping**: Common in most areas\n• **Ocean pollution**: Plastics reaching the sea',
      },
      {
        title: 'The 5 Rs of Waste Management',
        content: 'A hierarchy for reducing waste:\n\n1. **Refuse**: Say no to unnecessary items\n2. **Reduce**: Use less, buy less\n3. **Reuse**: Find new uses for items\n4. **Repurpose**: Transform waste into new products\n5. **Recycle**: Process materials into new products\n\nThe goal is to send ZERO waste to landfills!',
      },
      {
        title: 'Starting Community Clean-Ups',
        content: 'Organizing effective clean-up events:\n\n1. **Partner**: Connect with local leaders and organizations\n2. **Plan**: Choose location, date, and supplies needed\n3. **Promote**: Use social media and word of mouth\n4. **Execute**: Provide gloves, bags, and refreshments\n5. **Document**: Take photos and share impact\n6. **Follow up**: Advocate for better waste management',
      },
    ],
    questions: [
      {
        question: 'How much waste does Kenya generate daily?',
        options: ['1,000 tonnes', '22,000 tonnes', '100,000 tonnes', '500 tonnes'],
        correct: 1,
      },
      {
        question: 'What is the first R in waste management?',
        options: ['Recycle', 'Reduce', 'Refuse', 'Reuse'],
        correct: 2,
      },
      {
        question: 'What percentage of Kenya\'s waste is recycled?',
        options: ['10%', '50%', '75%', '90%'],
        correct: 0,
      },
    ],
  },
  '12': {
    sections: [
      {
        title: 'Renewable Energy in Kenya',
        content: 'Kenya is a leader in renewable energy:\n\n• **90%+** of electricity from renewables\n• **Geothermal**: Olkaria is Africa\'s largest\n• **Wind**: Lake Turkana Wind Power (310 MW)\n• **Solar**: Growing rapidly for homes and businesses\n• **Hydro**: Traditional source facing climate risks',
      },
      {
        title: 'Clean Energy Solutions',
        content: 'Accessible clean energy options:\n\n• **Solar home systems**: Pay-as-you-go models (M-KOPA, D.light)\n• **Improved cookstoves**: Reduce wood use and indoor pollution\n• **Biogas**: Convert waste to cooking fuel\n• **Solar water heaters**: Free hot water from the sun\n• **Mini-grids**: Community solar solutions',
      },
      {
        title: 'Advocating for Energy Access',
        content: 'Energy access is key to development:\n\n1. **46%** of Kenyans still lack electricity\n2. **3 million** households use kerosene\n3. Advocate for clean energy subsidies\n4. Support community energy projects\n5. Promote energy efficiency\n\nClean energy = health + education + economic opportunity!',
      },
    ],
    questions: [
      {
        question: 'What percentage of Kenya\'s electricity comes from renewables?',
        options: ['50%', '70%', '90%+', '30%'],
        correct: 2,
      },
      {
        question: 'Which is Africa\'s largest geothermal power plant?',
        options: ['Lake Turkana', 'Olkaria', 'Seven Forks', 'Sondu Miriu'],
        correct: 1,
      },
      {
        question: 'What percentage of Kenyans lack electricity access?',
        options: ['10%', '25%', '46%', '70%'],
        correct: 2,
      },
    ],
  },
};

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
