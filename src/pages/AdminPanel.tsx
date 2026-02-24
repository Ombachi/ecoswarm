import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  ChevronLeft,
  GraduationCap,
  Mail,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Shield,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { CourseContentEditor } from '@/components/admin/CourseContentEditor';

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

interface LetterTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  is_active: boolean;
  sort_order: number;
}

interface Recipient {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  is_active: boolean;
  sort_order: number;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'course' | 'template' | 'recipient' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingContentCourseId, setEditingContentCourseId] = useState<string | null>(null);
  const [editingContentCourseTitle, setEditingContentCourseTitle] = useState('');

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
    setIsChecking(false);
    if (data) loadAll();
  };

  const loadAll = async () => {
    setIsLoading(true);
    const [c, t, r] = await Promise.all([
      supabase.from('courses').select('*').order('sort_order'),
      supabase.from('letter_templates').select('*').order('sort_order'),
      supabase.from('recipients').select('*').order('sort_order'),
    ]);
    setCourses(c.data || []);
    setTemplates(t.data || []);
    setRecipients(r.data || []);
    setIsLoading(false);
  };

  const openCreate = (type: 'course' | 'template' | 'recipient') => {
    setEditType(type);
    if (type === 'course') {
      setEditingItem({ title: '', description: '', duration: '15 min', points: 30, category: 'Knowledge', is_active: true, sort_order: courses.length + 1 });
    } else if (type === 'template') {
      setEditingItem({ title: '', category: '', content: '', is_active: true, sort_order: templates.length + 1 });
    } else {
      setEditingItem({ name: '', title: '', organization: '', email: '', is_active: true, sort_order: recipients.length + 1 });
    }
  };

  const openEdit = (item: any, type: 'course' | 'template' | 'recipient') => {
    setEditType(type);
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem || !editType) return;
    setIsSaving(true);

    try {
      const table = editType === 'course' ? 'courses' : editType === 'template' ? 'letter_templates' : 'recipients';
      const isNew = !editingItem.id;
      
      const payload = { ...editingItem };
      if (isNew) {
        delete payload.id;
        payload.created_by = user?.id;
      } else {
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.created_by;
      }

      const { error } = isNew
        ? await supabase.from(table).insert(payload)
        : await supabase.from(table).update(payload).eq('id', editingItem.id);

      if (error) throw error;
      toast.success(isNew ? 'Created successfully!' : 'Updated successfully!');
      setEditingItem(null);
      setEditType(null);
      await loadAll();
    } catch (error) {
      console.error('Save error:', (error as Error)?.message || 'An error occurred');
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'course' | 'template' | 'recipient') => {
    const table = type === 'course' ? 'courses' : type === 'template' ? 'letter_templates' : 'recipients';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted successfully!');
      await loadAll();
    }
  };

  if (isChecking) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <Shield className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Manage courses, templates & recipients</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {editingContentCourseId ? (
          <CourseContentEditor
            courseId={editingContentCourseId}
            courseTitle={editingContentCourseTitle}
            onBack={() => setEditingContentCourseId(null)}
          />
        ) : (
        <Tabs defaultValue="courses">
          <TabsList className="w-full">
            <TabsTrigger value="courses" className="flex-1 gap-1 text-xs">
              <GraduationCap className="w-4 h-4" /> Courses
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1 gap-1 text-xs">
              <Mail className="w-4 h-4" /> Templates
            </TabsTrigger>
            <TabsTrigger value="recipients" className="flex-1 gap-1 text-xs">
              <Users className="w-4 h-4" /> Recipients
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-3 pt-3">
            <Button onClick={() => openCreate('course')} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Add Course
            </Button>
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
                    <button
                      onClick={() => { setEditingContentCourseId(c.id); setEditingContentCourseTitle(c.title); }}
                      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20"
                      title="Manage Content"
                    >
                      <BookOpen className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => openEdit(c, 'course')} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(c.id, 'course')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-3 pt-3">
            <Button onClick={() => openCreate('template')} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Add Template
            </Button>
            {templates.map((t) => (
              <div key={t.id} className={`eco-card p-4 ${!t.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                      <span className="eco-badge text-[10px]">{t.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.content.substring(0, 100)}...</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t, 'template')} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(t.id, 'template')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients" className="space-y-3 pt-3">
            <Button onClick={() => openCreate('recipient')} className="w-full gap-2">
              <Plus className="w-4 h-4" /> Add Recipient
            </Button>
            {recipients.map((r) => (
              <div key={r.id} className={`eco-card p-4 ${!r.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.title}, {r.organization}</p>
                    <p className="text-xs text-primary">{r.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r, 'recipient')} className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(r.id, 'recipient')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingItem && editType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingItem.id ? 'Edit' : 'Create'} {editType === 'course' ? 'Course' : editType === 'template' ? 'Template' : 'Recipient'}
              </h2>
              <button onClick={() => { setEditingItem(null); setEditType(null); }} className="p-2 rounded-full bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {editType === 'course' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                    <Input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                    <Textarea value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Duration</label>
                      <Input value={editingItem.duration} onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Points</label>
                      <Input type="number" value={editingItem.points} onChange={(e) => setEditingItem({ ...editingItem, points: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                      <Input value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Sort Order</label>
                      <Input type="number" value={editingItem.sort_order} onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editingItem.is_active} onCheckedChange={(val) => setEditingItem({ ...editingItem, is_active: val })} />
                    <label className="text-sm text-foreground">Active</label>
                  </div>
                </>
              )}

              {editType === 'template' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                    <Input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                    <Input value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
                    <Textarea className="min-h-[200px]" value={editingItem.content} onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editingItem.is_active} onCheckedChange={(val) => setEditingItem({ ...editingItem, is_active: val })} />
                    <label className="text-sm text-foreground">Active</label>
                  </div>
                </>
              )}

              {editType === 'recipient' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                    <Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title/Position</label>
                    <Input value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Organization</label>
                    <Input value={editingItem.organization} onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input type="email" value={editingItem.email} onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editingItem.is_active} onCheckedChange={(val) => setEditingItem({ ...editingItem, is_active: val })} />
                    <label className="text-sm text-foreground">Active</label>
                  </div>
                </>
              )}

              <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
