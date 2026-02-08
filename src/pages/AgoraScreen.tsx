import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { Post } from '@/types/ecoswarm';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { CommentsSection } from '@/components/posts/CommentsSection';
import { SocialShareButtons } from '@/components/common/SocialShareButtons';
import { AdvancedMediaViewer } from '@/components/common/AdvancedMediaViewer';
import { supabase } from '@/integrations/supabase/client';
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Hash,
  Image as ImageIcon,
  Video,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  X,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export function AgoraScreen() {
  const navigate = useNavigate();
  const { tag } = useParams<{ tag?: string }>();
  const { user, addPoints, showNotification, updateStats } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [expandedShare, setExpandedShare] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(tag || null);
  const [lightboxMedia, setLightboxMedia] = useState<{ 
    url: string; 
    type: 'image' | 'video';
    rect: DOMRect | null;
  } | null>(null);

  const openLightbox = (url: string, type: 'image' | 'video', event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setLightboxMedia({ url, type, rect });
  };

  const closeLightbox = () => {
    setLightboxMedia(null);
  };

  useEffect(() => {
    setFilterTag(tag || null);
  }, [tag]);

  useEffect(() => {
    loadPosts();
  }, [user, filterTag]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by tag if one is selected
      if (filterTag) {
        query = query.contains('tags', [filterTag]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get user's likes for these posts using secure function
      const postIds = (data || []).map(p => p.id);
      let userLikedPostIds: string[] = [];
      
      if (user && postIds.length > 0) {
        const { data: likedPosts } = await supabase
          .rpc('get_user_likes', { p_post_ids: postIds });
        userLikedPostIds = (likedPosts || []) as string[];
      }

      const mappedPosts: Post[] = (data || []).map((p) => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        content: p.content,
        mediaUrl: p.media_url || undefined,
        mediaType: p.media_type as 'image' | 'video' | undefined,
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        tags: p.tags || [],
        createdAt: new Date(p.created_at),
        isLiked: userLikedPostIds.includes(p.id),
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error loading posts:', error instanceof Error ? error.message : 'An error occurred');
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (clickedTag: string) => {
    if (filterTag === clickedTag) {
      // Clear filter
      setFilterTag(null);
      navigate('/agora');
    } else {
      setFilterTag(clickedTag);
      navigate(`/agora/tag/${clickedTag}`);
    }
  };

  const clearTagFilter = () => {
    setFilterTag(null);
    navigate('/agora');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
    toast.success('Feed refreshed!');
  };

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || !user) return;

    // Optimistically update UI
    const expectedLiked = !post.isLiked;
    const expectedCount = expectedLiked ? post.likes + 1 : post.likes - 1;

    setPosts(
      posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: expectedLiked, likes: expectedCount }
          : p
      )
    );

    // Use secure database function to toggle like
    const { data, error } = await supabase.rpc('toggle_post_like', { p_post_id: postId });
    
    if (error) {
      // Revert optimistic update on error
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: post.isLiked, likes: post.likes }
            : p
        )
      );
      console.error('Error toggling like:', error instanceof Error ? error.message : 'An error occurred');
      return;
    }

    // Update with actual values from server
    if (data) {
      const result = data as { likes: number; isLiked: boolean };
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: result.isLiked, likes: result.likes }
            : p
        )
      );
    }
  };

  const handlePostCreated = async (postData: {
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          user_name: user.name,
          content: postData.content,
          media_url: postData.mediaUrl || null,
          media_type: postData.mediaType === 'file' ? null : postData.mediaType || null,
          tags: extractHashtags(postData.content),
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: Post = {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        content: data.content,
        mediaUrl: data.media_url || undefined,
        mediaType: data.media_type as 'image' | 'video' | undefined,
        likes: 0,
        comments: 0,
        shares: 0,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
        isLiked: false,
      };

      setPosts([newPost, ...posts]);
      addPoints(20);
      updateStats({ postsCreated: user.stats.postsCreated + 1 });
      showNotification('Story shared! 📢', 20);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const extractHashtags = (text: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = text.match(regex);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(expandedComments === postId ? null : postId);
    setExpandedShare(null);
  };

  const toggleShare = (postId: string) => {
    setExpandedShare(expandedShare === postId ? null : postId);
    setExpandedComments(null);
  };

  const handleCommentCountChange = (postId: string, count: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, comments: count } : post
      )
    );

    supabase.from('posts').update({ comments: count }).eq('id', postId);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {filterTag && (
              <button
                onClick={() => navigate('/agora')}
                className="p-2 rounded-full bg-muted text-muted-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-bold text-foreground">Agora Square</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
            {!filterTag && <span className="eco-badge">🔥 Trending</span>}
          </div>
        </div>
        
        {/* Active Tag Filter */}
        {filterTag && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Showing posts with:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              <Hash className="w-3.5 h-3.5" />
              {filterTag}
              <button onClick={clearTagFilter} className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filterTag ? `No posts with #${filterTag}` : 'No posts yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {filterTag ? 'Try a different hashtag or create a post!' : 'Be the first to share your story!'}
            </p>
            {filterTag && (
              <button onClick={clearTagFilter} className="eco-button-primary mt-4 py-2 px-4">
                View All Posts
              </button>
            )}
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              className="p-4 animate-slide-up"
              style={{ animationDelay: `${Math.min(index, 5) * 0.1}s` }}
            >
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="eco-avatar flex-shrink-0">
                  {post.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{post.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-foreground mb-3 leading-relaxed">{post.content}</p>

              {/* Media Display - Clickable for zoom */}
              {post.mediaUrl ? (
                <div className="mb-3">
                  {post.mediaType === 'video' ? (
                    <div 
                      className="relative cursor-pointer group"
                      onClick={(e) => openLightbox(post.mediaUrl!, 'video', e)}
                    >
                      <video
                        src={post.mediaUrl}
                        className="w-full max-h-80 rounded-xl object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          Tap to view full screen
                        </div>
                      </div>
                    </div>
                  ) : post.mediaType === 'image' ? (
                    <div 
                      className="relative cursor-pointer group"
                      onClick={(e) => openLightbox(post.mediaUrl!, 'image', e)}
                    >
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-80 rounded-xl object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4" />
                          Tap to zoom
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : post.mediaType && (
                <div className="aspect-video bg-muted rounded-xl mb-3 flex items-center justify-center">
                  {post.mediaType === 'video' ? (
                    <Video className="w-12 h-12 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Tags - Clickable */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((postTag) => (
                    <button
                      key={postTag}
                      onClick={() => handleTagClick(postTag)}
                      className={`text-sm font-medium flex items-center gap-0.5 px-2 py-1 rounded-full transition-all ${
                        filterTag === postTag
                          ? 'bg-primary text-primary-foreground'
                          : 'text-primary hover:bg-primary/10'
                      }`}
                    >
                      <Hash className="w-3 h-3" />
                      {postTag}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-all ${
                    post.isLiked ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                  />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1.5 text-sm ${
                    expandedComments === post.id
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments}</span>
                  {expandedComments === post.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => toggleShare(post.id)}
                  className={`flex items-center gap-1.5 text-sm ${
                    expandedShare === post.id
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                  <span>{post.shares}</span>
                </button>
              </div>

              {/* Expanded Comments */}
              {expandedComments === post.id && (
                <CommentsSection
                  postId={post.id}
                  onCommentCountChange={(count) =>
                    handleCommentCountChange(post.id, count)
                  }
                />
              )}

              {/* Expanded Share */}
              {expandedShare === post.id && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Share this post
                  </p>
                  <SocialShareButtons
                    url={`${window.location.origin}/post/${post.id}`}
                    title={`Check out this post on EcoSwarm!`}
                    text={post.content.substring(0, 100)}
                    compact
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="eco-floating-button animate-pulse-glow"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userName={user?.name || 'User'}
        onPostCreated={handlePostCreated}
      />

      {/* Media Lightbox */}
      {lightboxMedia && (
        <AdvancedMediaViewer
          isOpen={!!lightboxMedia}
          onClose={closeLightbox}
          mediaUrl={lightboxMedia.url}
          mediaType={lightboxMedia.type}
          initialRect={lightboxMedia.rect}
        />
      )}
    </AppLayout>
  );
}
