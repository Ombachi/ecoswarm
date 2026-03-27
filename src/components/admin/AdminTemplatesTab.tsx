import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface LetterTemplate {
  id: string; title: string; category: string; content: string; is_active: boolean; sort_order: number;
}

interface Recipient {
  id: string; name: string; title: string; organization: string; email: string; is_active: boolean; sort_order: number;
}

export function AdminTemplatesTab() {
  const { user } = useApp();
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [editType, setEditType] = useState<'template' | 'recipient' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    const [t, r] = await Promise.all([
      supabase.from('letter_templates').select('*').order('sort_order'),
      supabase.from('recipients').select('*').order('sort_order'),
    ]);
    setTemplates(t.data || []);
    setRecipients(r.data || []);
    setIsLoading(false);
  };

  const openCreate = (type: 'template' | 'recipient') => {
    setEditType(type);
    if (type === 'template') setEditing({ title: '', category: '', content: '', is_active: true, sort_order: templates.length + 1 });
    else setEditing({ name: '', title: '', organization: '', email: '', is_active: true, sort_order: recipients.length + 1 });
  };

  const handleSave = async () => {
    if (!editing || !editType) return;
    setIsSaving(true);
    try {
      const table = editType === 'template' ? 'letter_templates' : 'recipients';
      const isNew = !editing.id;
      const payload = { ...editing };
      if (isNew) { delete payload.id; payload.created_by = user?.id; }
      else { delete payload.created_at; delete payload.updated_at; delete payload.created_by; }
      const { error } = isNew ? await supabase.from(table).insert(payload) : await supabase.from(table).update(payload).eq('id', editing.id);
      if (error) throw error;
      toast.success(isNew ? 'Created!' : 'Updated!');
      setEditing(null); setEditType(null);
      await load();
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, type: 'template' | 'recipient') => {
    const table = type === 'template' ? 'letter_templates' : 'recipients';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Deleted!'); await load(); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 pt-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Templates</h3>
        <Button onClick={() => openCreate('template')} className="w-full gap-2 mb-3" size="sm"><Plus className="w-4 h-4" /> Add Template</Button>
        {templates.map((t) => (
          <div key={t.id} className={`eco-card p-4 mb-2 ${!t.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
                  <span className="eco-badge text-[10px]">{t.category}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.content.substring(0, 100)}...</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditType('template'); setEditing({ ...t }); }} className="p-2 rounded-lg bg-muted hover:bg-muted/80"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(t.id, 'template')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Recipients</h3>
        <Button onClick={() => openCreate('recipient')} className="w-full gap-2 mb-3" size="sm"><Plus className="w-4 h-4" /> Add Recipient</Button>
        {recipients.map((r) => (
          <div key={r.id} className={`eco-card p-4 mb-2 ${!r.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{r.name}</h3>
                <p className="text-xs text-muted-foreground">{r.title}, {r.organization}</p>
                <p className="text-xs text-primary">{r.email}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditType('recipient'); setEditing({ ...r }); }} className="p-2 rounded-lg bg-muted hover:bg-muted/80"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(r.id, 'recipient')} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && editType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
          <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{editing.id ? 'Edit' : 'Create'} {editType === 'template' ? 'Template' : 'Recipient'}</h2>
              <button onClick={() => { setEditing(null); setEditType(null); }} className="p-2 rounded-full bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-4">
              {editType === 'template' ? (
                <>
                  <div><label className="text-sm font-medium text-foreground mb-1 block">Title</label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1 block">Category</label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1 block">Content</label><Textarea className="min-h-[200px]" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
                  <div className="flex items-center gap-3"><Switch checked={editing.is_active} onCheckedChange={(val) => setEditing({ ...editing, is_active: val })} /><label className="text-sm text-foreground">Active</label></div>
                </>
              ) : (
                <>
                  <div><label className="text-sm font-medium text-foreground mb-1 block">Name</label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1 block">Title/Position</label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1 block">Organization</label><Input value={editing.organization} onChange={(e) => setEditing({ ...editing, organization: e.target.value })} /></div>
                  <div><label className="text-sm font-medium text-foreground mb-1 block">Email</label><Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
                  <div className="flex items-center gap-3"><Switch checked={editing.is_active} onCheckedChange={(val) => setEditing({ ...editing, is_active: val })} /><label className="text-sm text-foreground">Active</label></div>
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
    </div>
  );
}
