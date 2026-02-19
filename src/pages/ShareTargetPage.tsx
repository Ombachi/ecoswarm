/**
 * Share Target: Receives shared content from other apps and pre-fills a new post.
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ShareTargetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, addPoints, showNotification } = useApp();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    const parts = [title, text, url].filter(Boolean);
    setContent(parts.join('\n\n'));
  }, [searchParams]);

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        user_name: user.name,
        content: content.trim(),
        tags: ['shared'],
      });

      if (error) throw error;

      addPoints(10);
      showNotification('Shared content posted! 📤', 10);
      toast.success('Posted to the Agora! 🌍');
      navigate('/agora');
    } catch {
      toast.error('Failed to post. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Share to EcoSwarm</h1>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your thoughts..."
            rows={6}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm"
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={handlePost}
              disabled={!content.trim() || isSubmitting}
              className="eco-button-primary py-2.5 px-6 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Post to Agora'}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Content shared from another app will be posted to the Agora feed
        </p>
      </div>
    </AppLayout>
  );
}

export default ShareTargetPage;
