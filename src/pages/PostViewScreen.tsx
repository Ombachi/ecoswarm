import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SocialShareButtons } from "@/components/common/SocialShareButtons";
import { MediaGallery, MediaItem } from "@/components/common/MediaGallery";
import { AdvancedMediaViewer } from "@/components/common/AdvancedMediaViewer";
import { PostContent } from "@/components/common/PostContent";
import {
  Heart,
  MessageSquare,
  Share2,
  ArrowRight,
  Loader2,
  Sparkles,
  Hash,
  Calendar,
  User,
} from "lucide-react";

interface PublicPost {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  media_urls: any;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  created_at: string;
}

export function PostViewScreen() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PublicPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    galleryItems?: { url: string; type: 'image' | 'video' | 'file' }[];
    initialIndex?: number;
  } | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError("Invalid post link");
        setIsLoading(false);
        return;
      }

      try {
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (postError || !postData) {
          setError("Post not found");
          setIsLoading(false);
          return;
        }

        setPost(postData);
      } catch (err) {
        console.error("Error fetching post:", (err as Error)?.message || 'An error occurred');
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleJoinMovement = () => {
    navigate("/signup");
  };

  const handleViewAuthor = () => {
    if (post) {
      navigate(`/profile/${post.user_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-24 h-24 rounded-full eco-gradient-bg flex items-center justify-center mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{error || "Post Not Found"}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          This post doesn't exist or has been removed. Join EcoSwarm to share your own stories!
        </p>
        <button onClick={handleJoinMovement} className="eco-button-primary py-4 px-8 text-lg flex items-center gap-2">
          Join the Movement
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="eco-gradient-bg px-6 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-xl font-bold text-white mb-2">Agora Square</h1>
          <p className="text-white/80 text-sm">A story from the EcoSwarm community</p>
        </div>
      </div>

      {/* Post Card */}
      <div className="px-6 -mt-8 relative z-20">
        <div className="eco-card-elevated p-6">
          {/* Author */}
          <button 
            onClick={handleViewAuthor}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full eco-gradient-bg flex items-center justify-center text-white font-bold text-lg">
              {post.user_name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{post.user_name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.created_at).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <User className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>

          {/* Content — strip hashtags from body */}
          <PostContent
            content={post.content}
            className="mb-4 leading-relaxed"
            stripBadgeLine={post.tags?.includes('EcoProduct')}
          />

          {/* Media — support media_urls array */}
          {(() => {
            let mediaItems: MediaItem[] = [];
            try {
              const raw = post.media_urls;
              if (Array.isArray(raw) && raw.length > 0) {
                mediaItems = raw.map((m: any) => ({ url: m.url, type: m.type || 'image', fileName: m.fileName }));
              }
            } catch {}
            if (mediaItems.length === 0 && post.media_url) {
              mediaItems = [{ url: post.media_url, type: (post.media_type as 'image' | 'video') || 'image' }];
            }

            if (mediaItems.length > 0) {
              return (
                <div className="mb-4">
                  <MediaGallery
                    items={mediaItems}
                    onMediaClick={(item, index, event) => {
                      if (item.type === 'image' || item.type === 'video') {
                        setLightboxMedia({ url: item.url, type: item.type, galleryItems: mediaItems, initialIndex: index });
                      }
                    }}
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-primary flex items-center gap-0.5 px-2 py-1 rounded-full bg-primary/10"
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-around pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="w-5 h-5" />
              <span>{post.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Share2 className="w-5 h-5" />
              <span>{post.shares || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Share Section */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-secondary" />
            Share This Story
          </h3>
          <div className="eco-card p-4">
            <SocialShareButtons
              url={`${window.location.origin}/post/${post.id}`}
              title="EcoSwarm 🌍"
              text="Check this out on EcoSwarm!"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="eco-card-elevated p-6 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
          <div className="w-16 h-16 rounded-full eco-gradient-bg mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Join the Conversation!</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your EcoSwarm account to like, comment, and share your own stories with the community.
          </p>
          <button
            onClick={handleJoinMovement}
            className="eco-button-primary py-4 px-8 text-lg flex items-center gap-2 mx-auto"
          >
            Join the Movement
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4">🌍 EcoSwarm - Your Digital Agora</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-6 px-6">
        <p>© 2026 EcoSwarm.</p>
      </div>

      {/* Media Lightbox */}
      {lightboxMedia && (
        <AdvancedMediaViewer
          isOpen={!!lightboxMedia}
          onClose={() => setLightboxMedia(null)}
          mediaUrl={lightboxMedia.url}
          mediaType={lightboxMedia.type}
          galleryItems={lightboxMedia.galleryItems}
          initialIndex={lightboxMedia.initialIndex}
        />
      )}
    </div>
  );
}
