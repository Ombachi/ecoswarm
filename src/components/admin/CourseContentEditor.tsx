import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  ChevronLeft,
  BookOpen,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { RichCourseEditor } from './RichCourseEditor';

interface Section {
  id?: string;
  course_id: string;
  title: string;
  content: string;
  sort_order: number;
}

interface Question {
  id?: string;
  course_id: string;
  question: string;
  options: string[];
  correct_index: number;
  sort_order: number;
}

interface CourseContentEditorProps {
  courseId: string;
  courseTitle: string;
  onBack: () => void;
}

export function CourseContentEditor({ courseId, courseTitle, onBack }: CourseContentEditorProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'questions'>('sections');

  // Edit state
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    loadContent();
  }, [courseId]);

  const loadContent = async () => {
    setIsLoading(true);
    const [s, q] = await Promise.all([
      supabase.from('course_sections').select('*').eq('course_id', courseId).order('sort_order'),
      supabase.from('course_questions').select('*').eq('course_id', courseId).order('sort_order'),
    ]);
    setSections(s.data || []);
    setQuestions((q.data || []).map(item => ({
      ...item,
      options: item.options as unknown as string[],
    })));
    setIsLoading(false);
  };

  // Section CRUD
  const openCreateSection = () => {
    setEditingSection({
      course_id: courseId,
      title: '',
      content: '',
      sort_order: sections.length + 1,
    });
  };

  const saveSection = async () => {
    if (!editingSection) return;
    setIsSaving(true);
    try {
      const isNew = !editingSection.id;
      if (isNew) {
        const { error } = await supabase.from('course_sections').insert({
          course_id: editingSection.course_id,
          title: editingSection.title,
          content: editingSection.content,
          sort_order: editingSection.sort_order,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('course_sections').update({
          title: editingSection.title,
          content: editingSection.content,
          sort_order: editingSection.sort_order,
        }).eq('id', editingSection.id);
        if (error) throw error;
      }
      toast.success(isNew ? 'Section created!' : 'Section updated!');
      setEditingSection(null);
      await loadContent();
    } catch {
      toast.error('Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSection = async (id: string) => {
    const { error } = await supabase.from('course_sections').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Section deleted'); await loadContent(); }
  };

  // Question CRUD
  const openCreateQuestion = () => {
    setEditingQuestion({
      course_id: courseId,
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      sort_order: questions.length + 1,
    });
  };

  const saveQuestion = async () => {
    if (!editingQuestion) return;
    setIsSaving(true);
    try {
      const isNew = !editingQuestion.id;
      const payload = {
        course_id: editingQuestion.course_id,
        question: editingQuestion.question,
        options: editingQuestion.options,
        correct_index: editingQuestion.correct_index,
        sort_order: editingQuestion.sort_order,
      };
      if (isNew) {
        const { error } = await supabase.from('course_questions').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('course_questions').update(payload).eq('id', editingQuestion.id);
        if (error) throw error;
      }
      toast.success(isNew ? 'Question created!' : 'Question updated!');
      setEditingQuestion(null);
      await loadContent();
    } catch {
      toast.error('Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from('course_questions').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Question deleted'); await loadContent(); }
  };

  // --- AI generators ---
  const aiGenerateSection = async () => {
    if (!editingSection) return;
    const topic = window.prompt(
      'What topic should the AI write about for this section?',
      editingSection.title || ''
    );
    if (!topic) return;
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-course-content', {
        body: { mode: 'section', courseTitle, topic },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const generated = (data as any)?.content ?? '';
      setEditingSection({
        ...editingSection,
        title: editingSection.title || topic,
        content: editingSection.content
          ? editingSection.content + '\n\n' + generated
          : generated,
      });
      toast.success('AI draft inserted!');
    } catch (e: any) {
      toast.error(e?.message || 'AI generation failed');
    } finally {
      setAiBusy(false);
    }
  };

  const aiGenerateQuestions = async () => {
    if (sections.length === 0) {
      toast.error('Add at least one section first so the AI has material to work from.');
      return;
    }
    const countStr = window.prompt('How many quiz questions should the AI generate? (1-10)', '5');
    if (!countStr) return;
    const count = Math.min(Math.max(parseInt(countStr) || 5, 1), 10);
    setAiBusy(true);
    try {
      const material = sections
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => `# ${s.title}\n${s.content}`)
        .join('\n\n');
      const { data, error } = await supabase.functions.invoke('generate-course-content', {
        body: { mode: 'questions', courseTitle, existingContent: material, count },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const generated: Array<{ question: string; options: string[]; correct_index: number }> =
        (data as any)?.questions ?? [];
      if (generated.length === 0) throw new Error('AI returned no questions');
      const baseOrder = questions.length;
      const payload = generated.map((q, idx) => ({
        course_id: courseId,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        sort_order: baseOrder + idx + 1,
      }));
      const { error: insErr } = await supabase.from('course_questions').insert(payload);
      if (insErr) throw insErr;
      toast.success(`Added ${generated.length} AI questions!`);
      await loadContent();
    } catch (e: any) {
      toast.error(e?.message || 'AI generation failed');
    } finally {
      setAiBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-full bg-muted text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Edit Content</h2>
          <p className="text-xs text-muted-foreground">{courseTitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sections' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Sections ({sections.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'questions' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Questions ({questions.length})
        </button>
      </div>

      {/* Sections List */}
      {activeTab === 'sections' && (
        <div className="space-y-3">
          <Button onClick={openCreateSection} className="w-full gap-2">
            <Plus className="w-4 h-4" /> Add Section
          </Button>
          {sections.map((s) => (
            <div key={s.id} className="eco-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">#{s.sort_order}</span>
                    <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.content.substring(0, 120)}...</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingSection(s)} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteSection(s.id!)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">No sections yet. Add some study content!</p>
          )}
        </div>
      )}

      {/* Questions List */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={openCreateQuestion} className="gap-2">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
            <Button onClick={aiGenerateQuestions} disabled={aiBusy} variant="secondary" className="gap-2">
              {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Generate
            </Button>
          </div>
          {questions.map((q) => (
            <div key={q.id} className="eco-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">Q{q.sort_order}</span>
                    <h3 className="font-semibold text-foreground text-sm">{q.question}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {q.options.map((opt, i) => (
                      <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${
                        i === q.correct_index ? 'bg-primary/20 text-primary font-medium' : 'bg-muted text-muted-foreground'
                      }`}>{opt}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingQuestion(q)} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteQuestion(q.id!)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">No questions yet. Add quiz questions!</p>
          )}
        </div>
      )}

      {/* Section Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingSection.id ? 'Edit' : 'Add'} Section
              </h2>
              <button onClick={() => setEditingSection(null)} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                <Input value={editingSection.title} onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-foreground">Content</label>
                  <button
                    type="button"
                    onClick={aiGenerateSection}
                    disabled={aiBusy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {aiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI Draft
                  </button>
                </div>
                <RichCourseEditor
                  value={editingSection.content}
                  onChange={(html) => setEditingSection({ ...editingSection, content: html })}
                  placeholder="Write the section content. Format inline, paste links, drop in images, embed YouTube videos…"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tip: paste a YouTube URL to auto-embed it. Use the toolbar to add images, videos, links and formatting.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Sort Order</label>
                <Input type="number" value={editingSection.sort_order} onChange={(e) => setEditingSection({ ...editingSection, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <Button onClick={saveSection} disabled={isSaving} className="w-full gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Section'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Question Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingQuestion.id ? 'Edit' : 'Add'} Question
              </h2>
              <button onClick={() => setEditingQuestion(null)} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Question</label>
                <Textarea value={editingQuestion.question} onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })} />
              </div>
              {editingQuestion.options.map((opt, i) => (
                <div key={i}>
                  <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                    Option {i + 1}
                    {i === editingQuestion.correct_index && (
                      <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full">Correct</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                    />
                    <button
                      onClick={() => setEditingQuestion({ ...editingQuestion, correct_index: i })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        i === editingQuestion.correct_index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Sort Order</label>
                <Input type="number" value={editingQuestion.sort_order} onChange={(e) => setEditingQuestion({ ...editingQuestion, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <Button onClick={saveQuestion} disabled={isSaving} className="w-full gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Question'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

