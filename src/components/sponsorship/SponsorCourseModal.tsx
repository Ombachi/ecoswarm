import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface SponsorCourseModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

export function SponsorCourseModal({ courseId, courseTitle, onClose }: SponsorCourseModalProps) {
  const { user } = useApp();
  const [sponsorName, setSponsorName] = useState('');
  const [message, setMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('sponsor-logos').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('sponsor-logos').getPublicUrl(path);
      setLogoUrl(publicUrl);
      toast.success('Logo uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sponsorName.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('course_sponsorships').insert({
        course_id: courseId,
        sponsor_user_id: user.id,
        sponsor_name: sponsorName.trim(),
        sponsor_logo_url: logoUrl || null,
        message: message.trim() || null,
      } as any);
      if (error) {
        if (error.code === '23505') {
          toast.error('You already requested sponsorship for this course');
        } else throw error;
        return;
      }
      toast.success('Sponsorship request sent! Admin will review it.');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
      <div className="bg-card w-full rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Sponsor Course</h2>
            <p className="text-xs text-muted-foreground">{courseTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Organization / Brand Name *</label>
            <Input value={sponsorName} onChange={e => setSponsorName(e.target.value)} placeholder="e.g. Green Energy Kenya" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Brand Logo</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            {logoUrl ? (
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-muted p-1" />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  Change
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Logo
              </Button>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Message to Admin (optional)</label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Why you'd like to sponsor this course..." className="min-h-[80px]" />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting || !sponsorName.trim()} className="w-full gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Sponsorship Request
          </Button>
        </div>
      </div>
    </div>
  );
}
