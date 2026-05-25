import { useRef, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon,
  Image as ImageIcon, Video, FileText, Loader2,
  Undo2, Redo2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RichCourseEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ytId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function uploadCourseMedia(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('course-media').upload(path, file);
  if (error) throw error;
  return supabase.storage.from('course-media').getPublicUrl(path).data.publicUrl;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}

export function RichCourseEditor({ value, onChange, placeholder, className }: RichCourseEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);

  // Set initial content once
  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = value || '';
      initialized.current = true;
    }
  }, []);

  // External value updates (e.g. AI Draft inserts, modal reuse for new section)
  useEffect(() => {
    if (!ref.current || !initialized.current) return;
    if (value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
      force((n) => n + 1);
    }
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
    force((n) => n + 1);
  };

  const cmd = (c: string, v?: string) => {
    ref.current?.focus();
    document.execCommand(c, false, v);
    emit();
  };

  const insertHTML = (html: string) => {
    ref.current?.focus();
    document.execCommand('insertHTML', false, html);
    emit();
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL (https://…):');
    if (!url) return;
    const safe = url.trim();
    const sel = window.getSelection()?.toString();
    if (sel && sel.length > 0) {
      cmd('createLink', safe);
    } else {
      insertHTML(`<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(safe)}</a>&nbsp;`);
    }
  };

  const insertVideoFromUrl = () => {
    const url = window.prompt('Paste a YouTube or video URL:');
    if (!url) return;
    const id = ytId(url);
    if (id) {
      insertHTML(
        `<div class="my-3 aspect-video rounded-xl overflow-hidden"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full" allowfullscreen frameborder="0" title="Video"></iframe></div><p><br/></p>`,
      );
    } else {
      insertHTML(
        `<video src="${escapeHtml(url)}" controls class="w-full rounded-xl my-3 max-h-[300px]"></video><p><br/></p>`,
      );
    }
  };

  const pickFile = (accept: string, kind: 'image' | 'video' | 'file') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setBusy(true);
      try {
        const url = await uploadCourseMedia(f);
        if (kind === 'image') {
          insertHTML(`<img src="${escapeHtml(url)}" alt="${escapeHtml(f.name)}" class="w-full rounded-xl my-3 max-h-[400px] object-contain" /><p><br/></p>`);
        } else if (kind === 'video') {
          insertHTML(`<video src="${escapeHtml(url)}" controls class="w-full rounded-xl my-3 max-h-[300px]"></video><p><br/></p>`);
        } else {
          insertHTML(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2">📎 ${escapeHtml(f.name)}</a>&nbsp;`);
        }
        toast.success('Uploaded');
      } catch {
        toast.error('Upload failed');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  // Auto-link or embed when the user pastes a bare URL
  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain').trim();
    const html = e.clipboardData.getData('text/html');
    if (!html && /^https?:\/\/\S+$/.test(text)) {
      e.preventDefault();
      const id = ytId(text);
      if (id) {
        insertHTML(
          `<div class="my-3 aspect-video rounded-xl overflow-hidden"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full" allowfullscreen frameborder="0" title="Video"></iframe></div><p><br/></p>`,
        );
      } else {
        insertHTML(`<a href="${escapeHtml(text)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>&nbsp;`);
      }
    }
    // otherwise allow native paste so formatting from docs is preserved
  };

  const buttons: Array<{ icon: any; title: string; run: () => void }> = [
    { icon: Undo2, title: 'Undo (⌘/Ctrl+Z)', run: () => cmd('undo') },
    { icon: Redo2, title: 'Redo (⌘/Ctrl+Shift+Z)', run: () => cmd('redo') },
    { icon: Bold, title: 'Bold', run: () => cmd('bold') },
    { icon: Italic, title: 'Italic', run: () => cmd('italic') },
    { icon: Underline, title: 'Underline', run: () => cmd('underline') },
    { icon: Heading2, title: 'Heading', run: () => cmd('formatBlock', '<h3>') },
    { icon: Heading3, title: 'Subheading', run: () => cmd('formatBlock', '<h4>') },
    { icon: List, title: 'Bulleted list', run: () => cmd('insertUnorderedList') },
    { icon: ListOrdered, title: 'Numbered list', run: () => cmd('insertOrderedList') },
    { icon: Quote, title: 'Quote', run: () => cmd('formatBlock', '<blockquote>') },
    { icon: LinkIcon, title: 'Link', run: insertLink },
    { icon: ImageIcon, title: 'Image', run: () => pickFile('image/*', 'image') },
    { icon: Video, title: 'Video (YouTube or upload)', run: insertVideoFromUrl },
    { icon: FileText, title: 'Attach file', run: () => pickFile('*/*', 'file') },
  ];

  const isEmpty = !value || value === '<br>' || value === '<p><br></p>' || (ref.current && ref.current.textContent?.trim() === '' && !/(img|iframe|video)/i.test(ref.current.innerHTML));

  return (
    <div className={cn('rounded-lg border border-input bg-background overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/30">
        {buttons.map((b, i) => {
          const Icon = b.icon;
          return (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={b.run}
              title={b.title}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1 pr-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pickFile('video/*', 'video')}
            className="text-[11px] px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Upload video file"
          >
            Upload video
          </button>
          {busy && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <div
          ref={ref}
          contentEditable
          onInput={emit}
          onPaste={onPaste}
          className={cn(
            'min-h-[280px] max-h-[60vh] overflow-y-auto outline-none p-3 text-sm text-foreground',
            'prose prose-sm max-w-none',
            '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-2',
            '[&_h4]:text-base [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-2 [&_h4]:mb-1',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-2',
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5',
            '[&_a]:text-primary [&_a]:underline [&_a]:break-all',
            '[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline',
            '[&_p]:my-1',
            '[&_img]:rounded-xl [&_img]:my-3 [&_img]:max-h-[400px] [&_img]:object-contain',
            '[&_video]:w-full [&_video]:rounded-xl [&_video]:my-3',
            '[&_iframe]:w-full [&_iframe]:h-full',
          )}
          suppressContentEditableWarning
        />
        {isEmpty && (
          <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none select-none text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}