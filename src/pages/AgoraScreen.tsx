import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { Post } from '@/types/ecoswarm';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { CommentsSection } from '@/components/posts/CommentsSection';
import { SocialShareButtons } from '@/components/common/SocialShareButtons';
import { AdvancedMediaViewer } from '@/components/common/AdvancedMediaViewer';
import { MediaGallery, MediaItem } from '@/components/common/MediaGallery';
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
  ShoppingBag,
  Pencil,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

const ecoBadgeColors: Record<string, string> = {
  'Carbon Neutral': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Plastic Free': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'Made in Kenya': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Fair Trade': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  '2-Year Warranty': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Organic': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  'Biodegradable': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Recycled Materials': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Solar Powered': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Water Efficient': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [lightboxMedia, setLightboxMedia] = useState<{ 
    url: string; 
    type: 'image' | 'video';
    rect: DOMRect | null;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

      const mappedPosts: Post[] = (data || []).map((p) => {
        // Parse media_urls JSON array
        let mediaItems: MediaItem[] = [];
        try {
          const raw = (p as any).media_urls;
          if (Array.isArray(raw) && raw.length > 0) {
            mediaItems = raw.map((m: any) => ({ url: m.url, type: m.type || 'image', fileName: m.fileName }));
          }
        } catch {}
        // Fallback to legacy single media
        if (mediaItems.length === 0 && p.media_url) {
          mediaItems = [{ url: p.media_url, type: (p.media_type as 'image' | 'video') || 'image' }];
        }

        return {
          id: p.id,
          userId: p.user_id,
          userName: p.user_name,
          content: p.content,
          mediaUrl: p.media_url || undefined,
          mediaType: p.media_type as 'image' | 'video' | undefined,
          mediaItems,
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
          tags: p.tags || [],
          createdAt: new Date(p.created_at),
          isLiked: userLikedPostIds.includes(p.id),
        };
      });

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
    mediaItems?: MediaItem[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'file';
  }) => {
    if (!user) return;

    try {
      const mediaUrlsJson = postData.mediaItems && postData.mediaItems.length > 0
        ? postData.mediaItems.map(m => ({ url: m.url, type: m.type, fileName: m.fileName }))
        : [];

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          user_name: user.name,
          content: postData.content,
          media_url: postData.mediaUrl || null,
          media_type: postData.mediaType === 'file' ? null : postData.mediaType || null,
          media_urls: mediaUrlsJson,
          tags: extractHashtags(postData.content),
        } as any)
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
        mediaItems: postData.mediaItems || [],
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

  const canEditPost = (post: Post) => {
    if (!user || post.userId !== user.id) return false;
    if (post.likes > 0 || post.comments > 0 || post.shares > 0) return false;
    const minutesSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / 60000;
    return minutesSinceCreation <= 30;
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) return;
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent, tags: extractHashtags(editContent) })
        .eq('id', postId);
      if (error) throw error;
      setPosts(posts.map(p => p.id === postId ? { ...p, content: editContent, tags: extractHashtags(editContent) } : p));
      setEditingPostId(null);
      toast.success('Post updated!');
    } catch {
      toast.error('Failed to update post');
    }
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
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-full transition-all ${showSearch ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts by name or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

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
        {(() => {
          const query = searchQuery.toLowerCase().trim();
          const filteredPosts = query
            ? posts.filter(p => p.userName.toLowerCase().includes(query) || p.content.toLowerCase().includes(query) || p.tags.some(t => t.toLowerCase().includes(query)))
            : posts;
          
          if (isLoading) return (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          );
          
          if (filteredPosts.length === 0) return (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? `No posts matching "${searchQuery}"` : filterTag ? `No posts with #${filterTag}` : 'No posts yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term' : filterTag ? 'Try a different hashtag or create a post!' : 'Be the first to share your story!'}
            </p>
            {filterTag && (
              <button onClick={clearTagFilter} className="eco-button-primary mt-4 py-2 px-4">
                View All Posts
              </button>
            )}
          </div>
          );
          
          return filteredPosts.map((post, index) => (
            <div
              key={post.id}
              className="p-4 animate-slide-up"
              style={{ animationDelay: `${Math.min(index, 5) * 0.1}s` }}
            >
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => navigate(`/profile/${post.userId}`)}
                  className="eco-avatar flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                >
                  {post.userName.charAt(0)}
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/profile/${post.userId}`)}
                    className="font-semibold text-foreground hover:text-primary transition-colors text-left"
                  >
                    {post.userName}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                {canEditPost(post) && (
                  <button
                    onClick={() => handleEditPost(post)}
                    className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                    title="Edit post (within 30 min)"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Post Content */}
              {editingPostId === post.id ? (
                <div className="mb-3 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingPostId(null)} className="px-3 py-1.5 text-sm rounded-lg bg-muted text-muted-foreground">Cancel</button>
                    <button onClick={() => handleSaveEdit(post.id)} className="px-3 py-1.5 text-sm rounded-lg eco-gradient-bg text-white font-medium">Save</button>
                  </div>
                </div>
              ) : (
              <>
              <div className="text-foreground mb-3 leading-relaxed whitespace-pre-line">
                {post.content.replace(/#\w+/g, '').trim().split('\n')
                  .filter(line => !line.startsWith('🏷️'))
                  .map((line, i) => {
                    // Make phone numbers clickable
                    const phoneMatch = line.match(/📞\s*([\d\s+()-]+)/);
                    if (phoneMatch) {
                      const phone = phoneMatch[1].trim();
                      return (
                        <span key={i}>
                          📞 <a href={`tel:${phone}`} className="text-primary font-semibold underline">{phone}</a>
                          {'\n'}
                        </span>
                      );
                    }
                    return <span key={i}>{line}{'\n'}</span>;
                  })}
              </div>

              {/* Colored Eco-Proof Badges for product posts */}
              {post.tags.includes('EcoProduct') && (() => {
                const badgeLine = post.content.split('\n').find(l => l.startsWith('🏷️'));
                if (!badgeLine) return null;
                const badges = badgeLine.replace('🏷️ ', '').split(' • ').map(b => b.trim()).filter(Boolean);
                if (badges.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {badges.map((badge) => (
                      <span
                        key={badge}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          ecoBadgeColors[badge] || 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                );
              })()}

              {/* Media Display */}
              {(post.mediaItems && post.mediaItems.length > 0) ? (
                <div className="mb-3">
                  <MediaGallery
                    items={post.mediaItems}
                    onMediaClick={(item, _index, event) => {
                      if (item.type === 'image' || item.type === 'video') {
                        openLightbox(item.url, item.type, event);
                      }
                    }}
                  />
                </div>
              ) : post.mediaUrl ? (
                <div className="mb-3">
                  {post.mediaType === 'video' ? (
                    <div className="relative cursor-pointer group" onClick={(e) => openLightbox(post.mediaUrl!, 'video', e)}>
                      <video src={post.mediaUrl} className="w-full max-h-80 rounded-xl object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                          <Video className="w-4 h-4" /> Tap to view full screen
                        </div>
                      </div>
                    </div>
                  ) : post.mediaType === 'image' ? (
                    <div className="relative cursor-pointer group" onClick={(e) => openLightbox(post.mediaUrl!, 'image', e)}>
                      <img src={post.mediaUrl} alt="Post media" className="w-full max-h-80 rounded-xl object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4" /> Tap to zoom
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Tags - beneath post/image (hide internal swarm_* tags) */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.filter(t => !t.startsWith('swarm_')).map((postTag) => (
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

              {/* EcoMarket CTA for product posts */}
              {post.tags.includes('EcoProduct') && (
                <button
                  onClick={() => navigate('/ecomarket')}
                  className="w-full mb-2 py-2.5 px-4 rounded-xl eco-gradient-bg text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <ShoppingBag className="w-4 h-4" />
                  View on EcoMarket 🛒
                </button>
              )}
              </>
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
                    title="EcoSwarm 🌍"
                    text="Check this out on EcoSwarm!"
                    compact
                  />
                </div>
              )}
            </div>
          ));
        })()}
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
