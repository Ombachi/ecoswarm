import { useState, useRef } from 'react';
import { X, Hash, Image as ImageIcon, Video, FileText, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onPostCreated: (post: {
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
  }) => void;
}

export function CreatePostModal({ isOpen, onClose, userName, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'file' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (file) processFile(file, type);
  };

  const processFile = (file: File, type: 'image' | 'video' | 'file') => {
    setMediaFile(file);
    setMediaType(type);

    if (type === 'image' || type === 'video') {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else {
      setMediaPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
    processFile(file, type);
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsUploading(true);
    let uploadedUrl: string | undefined;

    try {
      if (mediaFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to upload media');
          return;
        }

        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(fileName, mediaFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload media');
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName);

        uploadedUrl = publicUrl;
      }

      onPostCreated({
        content,
        mediaUrl: uploadedUrl,
        mediaType: mediaType || undefined,
      });

      // Reset form
      setContent('');
      removeMedia();
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
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
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-muted text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className="eco-avatar flex-shrink-0">
            {userName?.charAt(0) || 'U'}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What environmental issue are you facing? Share your story..."
            className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[120px]"
            autoFocus
          />
        </div>

        {/* Media Preview */}
        {mediaPreview && mediaType === 'image' && (
          <div className="relative mb-4">
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-full max-h-60 object-cover rounded-xl"
            />
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {mediaPreview && mediaType === 'video' && (
          <div className="relative mb-4">
            <video
              src={mediaPreview}
              controls
              className="w-full max-h-60 rounded-xl"
            />
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {mediaFile && mediaType === 'file' && (
          <div className="relative mb-4 p-4 bg-muted rounded-xl flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{mediaFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(mediaFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={removeMedia}
              className="p-1.5 rounded-full bg-background text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Suggested Tags */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Suggested tags:</p>
          <div className="flex flex-wrap gap-2">
            {['#NairobiPollution', '#ClimateJustice', '#KenyaClimate', '#GenZActivism'].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setContent((prev) => `${prev} ${tag}`)}
                  className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-primary hover:text-white transition-all"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>

        {/* Media Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture={undefined}
            onChange={(e) => handleFileSelect(e, 'image')}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFileSelect(e, 'video')}
            className="hidden"
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileSelect(e, 'file')}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!!mediaFile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
          >
            <ImageIcon className="w-5 h-5" />
            Photo
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={!!mediaFile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
          >
            <Video className="w-5 h-5" />
            Video
          </button>
          <button
            onClick={() => docInputRef.current?.click()}
            disabled={!!mediaFile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
          >
            <FileText className="w-5 h-5" />
            File
          </button>
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isUploading}
          className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Post Story (+20 pts)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
