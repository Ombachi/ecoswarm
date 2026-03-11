import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, FileText, Send, Loader2, Plus } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MediaItem } from '@/components/common/MediaGallery';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onPostCreated: (post: {
    content: string;
    mediaItems?: MediaItem[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
  }) => void;
}

export function CreatePostModal({ isOpen, onClose, userName, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<Array<{ file: File; preview: string | null; type: 'image' | 'video' | 'file' }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (files: FileList | File[], type?: 'image' | 'video' | 'file') => {
    const newItems = Array.from(files).map((file) => {
      const detectedType = type || (file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file');
      const preview = detectedType === 'image' || detectedType === 'video' ? URL.createObjectURL(file) : null;
      return { file, preview, type: detectedType as 'image' | 'video' | 'file' };
    });
    setMediaItems((prev) => [...prev, ...newItems]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const files = e.target.files;
    if (files && files.length > 0) addFiles(files, type);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) addFiles(files);
  };

  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      const item = prev[index];
      if (item.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getPlainText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const handleSubmit = async () => {
    if (!getPlainText(content).trim()) return;
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please log in'); return; }

      const uploaded: MediaItem[] = [];

      for (const item of mediaItems) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('post-media').upload(fileName, item.file);
        if (uploadError) { console.error('Upload error:', uploadError.message); toast.error('Failed to upload media'); return; }

        const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(fileName);
        uploaded.push({ url: publicUrl, type: item.type, fileName: item.file.name });
      }

      // Backwards compat: pass first item as mediaUrl/mediaType
      onPostCreated({
        content,
        mediaItems: uploaded.length > 0 ? uploaded : undefined,
        mediaUrl: uploaded[0]?.url,
        mediaType: uploaded[0]?.type,
      });

      setContent('');
      mediaItems.forEach((m) => m.preview && URL.revokeObjectURL(m.preview));
      setMediaItems([]);
      onClose();
    } catch (err) {
      console.error('Error creating post:', (err as Error)?.message || 'An error occurred');
      toast.error('Failed to create post');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end pb-20">
      <div
        className={`bg-card w-full rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-auto ${isDragging ? 'ring-2 ring-primary ring-inset' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Share Your Story</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className="eco-avatar flex-shrink-0">{userName?.charAt(0) || 'U'}</div>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="What environmental issue are you facing? Share your story..."
            className="flex-1"
            autoFocus
          />
        </div>

        {/* Media Previews Grid */}
        {mediaItems.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {mediaItems.map((item, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-muted">
                {item.type === 'image' && item.preview && (
                  <img src={item.preview} alt="Preview" className="w-full h-32 object-cover" />
                )}
                {item.type === 'video' && item.preview && (
                  <video src={item.preview} className="w-full h-32 object-cover" />
                )}
                {item.type === 'file' && (
                  <div className="h-32 flex flex-col items-center justify-center gap-1 p-2">
                    <FileText className="w-8 h-8 text-primary" />
                    <p className="text-xs text-muted-foreground truncate w-full text-center">{item.file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(item.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                )}
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {/* Add more button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary hover:border-primary transition-all"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">Add more</span>
            </button>
          </div>
        )}

        {/* Suggested Tags */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Suggested tags:</p>
          <div className="flex flex-wrap gap-2">
            {['#NairobiPollution', '#ClimateJustice', '#KenyaClimate', '#GenZActivism'].map((tag) => (
              <button
                key={tag}
                onClick={() => setContent((prev) => `${prev} ${tag}`)}
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-primary hover:text-white transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Media Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileSelect(e, 'image')} className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={(e) => handleFileSelect(e, 'video')} className="hidden" />
          <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" multiple onChange={(e) => handleFileSelect(e, 'file')} className="hidden" />

          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
            <ImageIcon className="w-5 h-5" /> Photo
          </button>
          <button onClick={() => videoInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
            <Video className="w-5 h-5" /> Video
          </button>
          <button onClick={() => docInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
            <FileText className="w-5 h-5" /> File
          </button>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isUploading}
          className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
          ) : (
            <><Send className="w-5 h-5" /> Post Story (+20 pts)</>
          )}
        </button>
      </div>
    </div>
  );
}
