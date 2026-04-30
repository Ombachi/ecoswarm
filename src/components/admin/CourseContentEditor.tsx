import { useState, useEffect, useRef } from 'react';
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
  Video,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

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
          <Button onClick={openCreateQuestion} className="w-full gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
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
                <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
                {/* Media Embed Toolbar */}
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter YouTube or video URL:');
                      if (url) {
                        setEditingSection({
                          ...editingSection,
                          content: editingSection.content + `\n\n[video](${url})\n`,
                        });
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" /> Video URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter link URL:');
                      const label = prompt('Link label (optional):') || url;
                      if (url) {
                        setEditingSection({
                          ...editingSection,
                          content: editingSection.content + `\n\n[${label}](${url})\n`,
                        });
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Link
                  </button>
                  <UploadMediaButton
                    label="Upload Video"
                    icon={<Video className="w-3.5 h-3.5" />}
                    accept="video/*"
                    onUploaded={(url) => {
                      setEditingSection({
                        ...editingSection,
                        content: editingSection.content + `\n\n[video](${url})\n`,
                      });
                    }}
                  />
                  <UploadMediaButton
                    label="Upload File"
                    icon={<FileText className="w-3.5 h-3.5" />}
                    accept="*/*"
                    onUploaded={(url, name) => {
                      setEditingSection({
                        ...editingSection,
                        content: editingSection.content + `\n\n[file:${name}](${url})\n`,
                      });
                    }}
                  />
                  <UploadMediaButton
                    label="Upload Image"
                    icon={<ImageIcon className="w-3.5 h-3.5" />}
                    accept="image/*"
                    onUploaded={(url) => {
                      setEditingSection({
                        ...editingSection,
                        content: editingSection.content + `\n\n[image](${url})\n`,
                      });
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">
                  Use [video](url), [image](url), [label](url) for links, [file:name](url) for files
                </p>
                <Textarea className="min-h-[200px] font-mono text-xs" value={editingSection.content} onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })} />
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

// Reusable upload button component
function UploadMediaButton({ label, icon, accept, onUploaded }: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  onUploaded: (url: string, name: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('course-media').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('course-media').getPublicUrl(path);
      onUploaded(publicUrl, file.name);
      toast.success(`${file.name} uploaded!`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept={accept} onChange={handleUpload} className="hidden" />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
        {uploading ? 'Uploading...' : label}
      </button>
    </>
  );
}
