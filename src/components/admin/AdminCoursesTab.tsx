import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CourseContentEditor } from './CourseContentEditor';
import { Plus, Pencil, Trash2, BookOpen, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  points: number;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export function AdminCoursesTab() {
  const { user } = useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contentCourseId, setContentCourseId] = useState<string | null>(null);
  const [contentCourseTitle, setContentCourseTitle] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('courses').select('*').order('sort_order');
    setCourses(data || []);
    setIsLoading(false);
  };

  const openCreate = () => {
    setEditing({ title: '', description: '', duration: '15 min', points: 30, category: 'Knowledge', is_active: true, sort_order: courses.length + 1 });
  };

  const handleSave = async () => {
    if (!editing) return;
    setIsSaving(true);
    try {
      const isNew = !editing.id;
      const payload = { ...editing };
      if (isNew) { delete payload.id; payload.created_by = user?.id; }
      else { delete payload.created_at; delete payload.updated_at; delete payload.created_by; }

      const { error } = isNew
        ? await supabase.from('courses').insert(payload)
        : await supabase.from('courses').update(payload).eq('id', editing.id);
      if (error) throw error;
      toast.success(isNew ? 'Course created!' : 'Course updated!');
      setEditing(null);
      await load();
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Deleted!'); await load(); }
  };

  if (contentCourseId) {
    return <CourseContentEditor courseId={contentCourseId} courseTitle={contentCourseTitle} onBack={() => setContentCourseId(null)} />;
  }

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3 pt-3">
      <Button onClick={openCreate} className="w-full gap-2"><Plus className="w-4 h-4" /> Add Course</Button>
      {courses.map((c) => (
        <div key={c.id} className={`eco-card p-4 ${!c.is_active ? 'opacity-50' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
                <span className="eco-badge text-[10px]">{c.category}</span>
                {!c.is_active && <span className="text-[10px] px-2 py-0.5 bg-destructive/20 text-destructive rounded-full">Inactive</span>}
              </div>
              <p className="text-xs text-muted-foreground">{c.description}</p>
              <p className="text-xs text-primary mt-1">{c.duration} • {c.points} pts • Order: {c.sort_order}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setContentCourseId(c.id); setContentCourseTitle(c.title); }} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20" title="Manage Content">
                <BookOpen className="w-4 h-4 text-primary" />
              </button>
              <button onClick={() => setEditing({ ...c })} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{editing.id ? 'Edit' : 'Create'} Course</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-full bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div><label className="text-sm font-medium text-foreground mb-1 block">Title</label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground mb-1 block">Description</label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-foreground mb-1 block">Duration</label><Input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-foreground mb-1 block">Points</label><Input type="number" value={editing.points} onChange={(e) => setEditing({ ...editing, points: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-foreground mb-1 block">Category</label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-foreground mb-1 block">Sort Order</label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-3"><Switch checked={editing.is_active} onCheckedChange={(val) => setEditing({ ...editing, is_active: val })} /><label className="text-sm text-foreground">Active</label></div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
