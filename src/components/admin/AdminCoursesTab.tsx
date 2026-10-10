import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CourseContentEditor } from './CourseContentEditor';
import { Plus, Pencil, Trash2, BookOpen, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '@/lib/imageCompression';
import { CourseCover } from '@/components/common/CourseCover';
import { COURSE_CATEGORIES } from '@/lib/courseCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  points: number;
  category: string;
  is_active: boolean;
  sort_order: number;
  image_url?: string | null;
  duration_manual?: boolean;
  estimated_duration_minutes?: number | null;
  video_minutes?: number | null;
}

export function AdminCoursesTab() {
  const { user } = useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadCover = async (file?: File) => {
    if (!file || !user || !editing) return;
    if (!['image/jpeg', 'image/webp'].includes(file.type)) { toast.error('Choose a JPG or WebP image'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Choose an image smaller than 10 MB'); return; }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const path = `${user.id}/course-covers/${crypto.randomUUID()}.${compressed.type === 'image/webp' ? 'webp' : 'jpg'}`;
      const { error } = await supabase.storage.from('post-media').upload(path, compressed);
      if (error) throw error;
      const { data } = supabase.storage.from('post-media').getPublicUrl(path);
      setEditing((current: Course | null) => current ? { ...current, image_url: data.publicUrl } : current);
    } catch { toast.error('Unable to upload course image'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };
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
    setEditing({ title: '', description: '', duration: '15 min', points: 30, category: COURSE_CATEGORIES[0], image_url: null, duration_manual: false, video_minutes: null, is_active: true, sort_order: courses.length + 1 });
  };

  const handleSave = async () => {
    if (!editing || uploading) return;
    if (!editing.title.trim() || !editing.description.trim()) { toast.error('Add a title and description'); return; }
    if (!COURSE_CATEGORIES.includes(editing.category)) { toast.error('Choose a course category'); return; }
    setIsSaving(true);
    try {
      const isNew = !editing.id;
      const payload = { ...editing };
      delete payload.estimated_duration_minutes;
      if (isNew) { delete payload.id; payload.created_by = user?.id; }
      else { delete payload.created_at; delete payload.updated_at; delete payload.created_by; }

      const { error } = isNew
        ? await supabase.from('courses').insert(payload)
        : await supabase.from('courses').update(payload).eq('id', editing.id);
      if (error) throw error;
      toast.success(isNew ? 'Course created!' : 'Course updated!');
      if (isNew && payload.is_active !== false) {
        // Fire-and-forget: notify subscribed users by email.
        supabase.functions.invoke('notify-new-content', {
          body: {
            type: 'course',
            title: payload.title,
            description: payload.description,
            link_path: '/tools',
          },
        }).catch((e) => console.error('notify-new-content failed:', e?.message));
      }
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
              <div className="max-w-md space-y-2">
                <label className="text-sm font-medium">Course cover</label>
                <CourseCover src={editing.image_url} title={editing.title || 'Course cover'} />
                <input ref={fileRef} type="file" accept="image/jpeg,image/webp" className="hidden" onChange={e => uploadCover(e.target.files?.[0])} />
                <div className="flex gap-2"><Button variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}Upload cover</Button>{editing.image_url && <Button variant="ghost" disabled={uploading} onClick={() => setEditing({ ...editing, image_url: null })}>Remove</Button>}</div>
              </div>
              <div><label className="text-sm font-medium text-foreground mb-1 block">Title</label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground mb-1 block">Description</label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-foreground mb-1 block">Duration</label><Input disabled={!editing.duration_manual} value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /><div className="flex items-center gap-2 mt-2"><Switch checked={Boolean(editing.duration_manual)} onCheckedChange={value => setEditing({ ...editing, duration_manual: value })} /><span className="text-xs text-muted-foreground">Custom duration</span></div>{editing.estimated_duration_minutes && <p className="text-xs text-muted-foreground mt-1">Suggested: {editing.estimated_duration_minutes} min</p>}</div>
                <div><label className="text-sm font-medium text-foreground mb-1 block">Points</label><Input type="number" value={editing.points} onChange={(e) => setEditing({ ...editing, points: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-foreground mb-1 block">Category</label><Select value={editing.category} onValueChange={category => setEditing({ ...editing, category })}><SelectTrigger className="h-auto min-h-10 [&>span]:whitespace-normal [&>span]:text-left"><SelectValue placeholder="Choose category" /></SelectTrigger><SelectContent>{COURSE_CATEGORIES.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-sm font-medium text-foreground mb-1 block">Sort Order</label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-3"><Switch checked={editing.is_active} onCheckedChange={(val) => setEditing({ ...editing, is_active: val })} /><label className="text-sm text-foreground">Active</label></div>
              <Button onClick={handleSave} disabled={isSaving || uploading} className="w-full gap-2">
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
