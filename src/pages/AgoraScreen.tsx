import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useOfflineCache } from '@/hooks/useOfflineCache';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Post } from '@/types/ecoswarm';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { CreateSwarmModal } from '@/components/swarms/CreateSwarmModal';
import { WelcomePost } from '@/components/posts/WelcomePost';
import { CommentsSection } from '@/components/posts/CommentsSection';
import { SocialShareButtons } from '@/components/common/SocialShareButtons';
import { AdvancedMediaViewer } from '@/components/common/AdvancedMediaViewer';
import { MediaGallery, MediaItem } from '@/components/common/MediaGallery';
import { LinkifiedText } from '@/components/common/LinkifiedText';
import { PollVoter } from '@/components/polls/PollVoter';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilityRefetch } from '@/hooks/useVisibilityRefetch';
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
  Users,
  Target,
  FileText,
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

function EditPostOverlay({ post, editContent, setEditContent, onCancel, onSave, editMediaItems, setEditMediaItems }: {
  post: Post;
  editContent: string;
  setEditContent: (s: string) => void;
  onCancel: () => void;
  onSave: () => void;
  editMediaItems: MediaItem[];
  setEditMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error } = await supabase.storage.from('post-media').upload(fileName, file);
      if (error) { toast.error('Upload failed'); continue; }
      const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(fileName);
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      setEditMediaItems(prev => [...prev, { url: publicUrl, type: type as 'image' | 'video' | 'file', fileName: file.name }]);
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onCancel} className="text-muted-foreground text-sm font-medium">Cancel</button>
        <h2 className="text-base font-bold text-foreground">Edit Post</h2>
        <button onClick={onSave} className="px-4 py-1.5 text-sm rounded-full eco-gradient-bg text-white font-semibold">Save</button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm resize-none min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        {/* Media items grid */}
        {editMediaItems.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {editMediaItems.map((item, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-muted">
                {item.type === 'image' && <img src={item.url} alt="" className="w-full h-32 object-cover" />}
                {item.type === 'video' && <video src={item.url} className="w-full h-32 object-cover" />}
                {item.type === 'file' && (
                  <div className="h-32 flex items-center justify-center p-2">
                    <p className="text-xs text-muted-foreground truncate">{item.fileName || 'File'}</p>
                  </div>
                )}
                <button
                  onClick={() => setEditMediaItems(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Add media button */}
        <div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all text-sm"
          >
            <ImageIcon className="w-4 h-4" /> Add Media
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgoraScreen() {
  const navigate = useNavigate();
  const { tag } = useParams<{ tag?: string }>();
  const { user, addPoints, showNotification, updateStats } = useApp();
  usePageMeta('Agora Square', 'Share environmental stories, discuss climate issues, and engage with the EcoSwarm community.');
  const { savePostsToCache, loadCachedPosts } = useOfflineCache();
  const { isOnline, queueRequest } = useOfflineQueue();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSwarmModal, setShowSwarmModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [expandedShare, setExpandedShare] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(tag || null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMediaItems, setEditMediaItems] = useState<MediaItem[]>([]);
  const [lightboxMedia, setLightboxMedia] = useState<{ 
    url: string; 
    type: 'image' | 'video';
    rect: DOMRect | null;
    galleryItems?: { url: string; type: 'image' | 'video' | 'file' }[];
    initialIndex?: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const PAGE_SIZE = 20;
  const pullStartY = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const openLightbox = (url: string, type: 'image' | 'video', event: React.MouseEvent, galleryItems?: { url: string; type: 'image' | 'video' | 'file' }[], index?: number) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setLightboxMedia({ url, type, rect, galleryItems, initialIndex: index });
  };

  const closeLightbox = () => {
    setLightboxMedia(null);
  };

  // Refetch when app becomes visible (PWA resume)
  const handleVisibilityRefetch = useCallback(() => {
    loadPosts();
  }, [user, filterTag]);
  useVisibilityRefetch(handleVisibilityRefetch);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = feedRef.current?.scrollTop ?? window.scrollY;
    if (scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    const diff = e.touches[0].clientY - pullStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      await loadPosts();
      setIsRefreshing(false);
      toast.success('Feed refreshed!');
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance]);

  useEffect(() => {
    setFilterTag(tag || null);
  }, [tag]);

  useEffect(() => {
    loadPosts();
  }, [user, filterTag]);

  const loadPosts = async (loadMore = false) => {
    if (!loadMore) { setIsLoading(true); setCursor(null); setHasMore(true); }
    else { setLoadingMore(true); }
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (filterTag) {
        query = query.contains('tags', [filterTag]);
      }

      if (loadMore && cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) throw error;

      const rows = data || [];
      if (rows.length < PAGE_SIZE) setHasMore(false);
      if (rows.length > 0) setCursor(rows[rows.length - 1].created_at);

      // Get user's likes for these posts using secure function
      const postIds = rows.map(p => p.id);
      let userLikedPostIds: string[] = [];
      
      if (user && postIds.length > 0) {
        const { data: likedPosts } = await supabase
          .rpc('get_user_likes', { p_post_ids: postIds });
        userLikedPostIds = (likedPosts || []) as string[];
      }

      // Fetch profile avatars for post authors
      const uniqueUserIds = [...new Set(rows.map(p => p.user_id))];
      let avatarMap: Record<string, string | null> = {};
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, avatar_url')
          .in('user_id', uniqueUserIds);
        if (profiles) {
          profiles.forEach(p => { avatarMap[p.user_id] = p.avatar_url; });
        }
      }

      const mappedPosts: Post[] = rows.map((p) => {
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
          userAvatar: avatarMap[p.user_id] || undefined,
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

      if (loadMore) {
        setPosts(prev => [...prev, ...mappedPosts]);
      } else {
        setPosts(mappedPosts);
        // Cache posts for offline reading
        if (!filterTag) {
          savePostsToCache(rows.map(p => ({
            id: p.id, user_name: p.user_name, content: p.content,
            tags: p.tags || [], likes: p.likes || 0, comments: p.comments || 0,
            created_at: p.created_at || '', media_url: p.media_url || undefined,
            media_type: p.media_type || undefined,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error instanceof Error ? error.message : 'An error occurred');
      // Try loading from offline cache
      if (!navigator.onLine) {
        const cached = await loadCachedPosts();
        if (cached && cached.length > 0) {
          const offlinePosts: Post[] = cached.map(p => ({
            id: p.id, userId: '', userName: p.user_name, content: p.content,
            likes: p.likes || 0, comments: p.comments || 0, shares: 0,
            tags: p.tags || [], createdAt: new Date(p.created_at || ''), isLiked: false,
            mediaUrl: p.media_url, mediaType: p.media_type as any,
          }));
          setPosts(offlinePosts);
          toast.info('Showing cached posts (offline)');
          return;
        }
      }
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !isLoading) {
          loadPosts(true);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, isLoading, cursor]);

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
      supabase.rpc('award_co2', { p_user_id: user.id, p_action_type: 'post_created' });
      showNotification('Story shared! 📢', 20);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleSwarmCreated = async (swarmData: {
    name: string;
    description: string;
    goal: string;
    category: string;
    targetSignatures: number;
    orgName?: string;
    socialLinks?: string;
    phone?: string;
    goalType: string;
    targetNumber: number;
    endDate: string;
    inviteMethod: string;
    location?: string;
  }) => {
    if (!user) { toast.error('Please log in'); return; }
    try {
      const { data: newSwarm, error } = await supabase
        .from('swarms')
        .insert({
          name: swarmData.name,
          description: swarmData.description,
          goal: swarmData.goal,
          category: swarmData.category,
          target_signatures: swarmData.targetSignatures,
          current_signatures: 1,
          participants: 1,
          created_by: user.id,
          org_name: swarmData.orgName || null,
          social_links: swarmData.socialLinks || null,
          phone: swarmData.phone || null,
          goal_type: swarmData.goalType,
          target_number: swarmData.targetNumber,
          end_date: swarmData.endDate,
          invite_method: swarmData.inviteMethod,
          location: swarmData.location || null,
        } as any)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('swarm_memberships').insert({
        swarm_id: newSwarm.id,
        user_id: user.id,
        votes: 1,
      });

      const postContent = [
        `🐝 New Swarm: "${swarmData.name}"`,
        swarmData.orgName ? `🏢 ${swarmData.orgName}` : '',
        swarmData.location ? `📍 ${swarmData.location}` : '',
        `\n${swarmData.description}`,
        `\n🎯 Goal: ${swarmData.goal}`,
        `\n📊 Target: ${swarmData.targetNumber} | ${swarmData.goalType}`,
        `\n🗓️ Ends: ${new Date(swarmData.endDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      ].filter(Boolean).join('\n');

      await supabase.from('posts').insert({
        user_id: user.id,
        user_name: user.name,
        content: postContent,
        tags: [swarmData.category.replace(/\s+/g, ''), 'EcoSwarm', 'JoinTheSwarm', `swarm_${newSwarm.id}`],
      });

      const { data: allProfiles } = await supabase
        .from('public_profiles')
        .select('user_id')
        .neq('user_id', user.id);

      if (allProfiles && allProfiles.length > 0) {
        const notifications = allProfiles
          .filter((p) => p.user_id)
          .map((p) => ({
            user_id: p.user_id!,
            type: 'swarm',
            title: '🐝 New Swarm Launched!',
            message: `Join "${swarmData.name}" — ${swarmData.description.substring(0, 80)}...`,
            reference_id: newSwarm.id,
          }));
        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }

      addPoints(50);
      updateStats({ postsCreated: user.stats.postsCreated + 1 });
      supabase.rpc('award_co2', { p_user_id: user.id, p_action_type: 'post_created' });
      showNotification('Swarm launched & posted to Agora! 🐝', 50);
      await loadPosts();
    } catch (error) {
      console.error('Error creating swarm:', error);
      toast.error('Failed to create swarm');
      throw error;
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
    setEditMediaItems(post.mediaItems || []);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) return;
    try {
      const mediaUrlsJson = editMediaItems.length > 0
        ? editMediaItems.map(m => ({ url: m.url, type: m.type, fileName: m.fileName }))
        : [];
      const { error } = await supabase
        .from('posts')
        .update({
          content: editContent,
          tags: extractHashtags(editContent),
          media_urls: mediaUrlsJson,
          media_url: editMediaItems[0]?.url || null,
          media_type: editMediaItems[0]?.type === 'file' ? null : editMediaItems[0]?.type || null,
        } as any)
        .eq('id', postId);
      if (error) throw error;
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        content: editContent,
        tags: extractHashtags(editContent),
        mediaItems: editMediaItems,
        mediaUrl: editMediaItems[0]?.url,
        mediaType: editMediaItems[0]?.type as 'image' | 'video' | undefined,
      } : p));
      setEditingPostId(null);
      setEditMediaItems([]);
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

      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance }}
        >
          <RefreshCw
            className={`w-6 h-6 text-primary transition-transform ${pullDistance > 50 ? 'text-primary' : 'text-muted-foreground'}`}
            style={{ transform: `rotate(${pullDistance * 4}deg)` }}
          />
        </div>
      )}

      {/* Feed */}
      <div
        ref={feedRef}
        className="divide-y divide-border"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
          
          return filteredPosts.map((post, index) => {
            const isSwarmPost = post.tags.some(t => t.startsWith('swarm_'));
            const isWelcomePost = post.tags.includes('welcome_post');

            if (isWelcomePost) {
              return (
                <div key={post.id}>
                  <WelcomePost
                    post={post}
                    onSayHi={(userName) => {
                      setExpandedComments(post.id);
                    }}
                  />
                  {/* Actions for welcome posts */}
                  <div className="px-4 pb-2 flex items-center justify-between border-b border-border bg-primary/5">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-all ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 text-sm ${expandedComments === post.id ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button
                      onClick={() => toggleShare(post.id)}
                      className={`flex items-center gap-1.5 text-sm ${expandedShare === post.id ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                  {expandedComments === post.id && (
                    <div className="px-4 pb-4 bg-primary/5">
                      <CommentsSection postId={post.id} onCommentCountChange={(count) => handleCommentCountChange(post.id, count)} />
                    </div>
                  )}
                  {expandedShare === post.id && (
                    <div className="px-4 pb-4 bg-primary/5 border-t border-border pt-3">
                      <p className="text-sm font-semibold text-foreground mb-3">Share this post</p>
                      <SocialShareButtons url={`${window.location.origin}/post/${post.id}`} title="EcoSwarm 🌍" text="Check this out on EcoSwarm!" compact />
                    </div>
                  )}
                </div>
              );
            }

            return (
            <div
              key={post.id}
              className={`p-4 animate-slide-up ${isSwarmPost ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              style={{ animationDelay: `${Math.min(index, 5) * 0.1}s` }}
            >
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => navigate(`/profile/${post.userId}`)}
                  className="flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded-full"
                >
                  {post.userAvatar ? (
                    <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="eco-avatar">{post.userName.charAt(0)}</div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/profile/${post.userId}`)}
                      className="font-semibold text-foreground hover:text-primary transition-colors text-left"
                    >
                      {post.userName}
                    </button>
                    {isSwarmPost && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        <Users className="w-3 h-3" /> Swarm
                      </span>
                    )}
                  </div>
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
                <EditPostOverlay
                  post={post}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  onCancel={() => { setEditingPostId(null); setEditMediaItems([]); }}
                  onSave={() => handleSaveEdit(post.id)}
                  editMediaItems={editMediaItems}
                  setEditMediaItems={setEditMediaItems}
                />
              ) : (
              <>
              <div className="text-foreground mb-3 leading-relaxed">
                {post.content.includes('<') && (post.content.includes('<b>') || post.content.includes('<i>') || post.content.includes('<h3>') || post.content.includes('<ul>') || post.content.includes('<ol>') || post.content.includes('<blockquote>') || post.content.includes('<br>')) ? (
                  <div
                    className="prose prose-sm max-w-none [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_blockquote]:border-l-3 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content.replace(/#\w+/g, '').trim()) }}
                  />
                ) : (
                  <div className="whitespace-pre-line">
                    {post.content.replace(/#\w+/g, '').trim().split('\n')
                      .filter(line => !line.startsWith('🏷️'))
                      .filter(line => line.trim().length > 0)
                      .map((line, i) => {
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
                        return <span key={i}><LinkifiedText text={line} />{'\n'}</span>;
                      })}
                  </div>
                )}
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
                    onMediaClick={(item, index, event) => {
                      if (item.type === 'image' || item.type === 'video') {
                        openLightbox(item.url, item.type, event, post.mediaItems, index);
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

              {/* Swarm CTA - Join Swarm button */}
              {isSwarmPost && (() => {
                const swarmTag = post.tags.find(t => t.startsWith('swarm_'));
                const swarmId = swarmTag?.replace('swarm_', '');
                if (!swarmId) return null;
                return (
                  <button
                    onClick={() => navigate('/swarms')}
                    className="w-full mb-2 py-2.5 px-4 rounded-xl border-2 border-primary text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    View & Join Swarm 🐝
                  </button>
                );
              })()}

              {/* Inline Poll Voting */}
              {post.tags.includes('Poll') && (() => {
                const pollIdMatch = post.tags.find(t => t.startsWith('poll_'));
                const pId = pollIdMatch?.replace('poll_', '');
                if (!pId) return null;
                return (
                  <div className="mb-2">
                    <PollVoter pollId={pId} />
                  </div>
                );
              })()}
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
          );
          });
        })()}

        {/* Load More Sentinel */}
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          {!hasMore && posts.length > 0 && (
            <p className="text-xs text-muted-foreground">You've seen all posts 🌿</p>
          )}
        </div>
      </div>

      {/* Create Menu Overlay */}
      {showCreateMenu && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowCreateMenu(false)}>
          <div className="absolute bottom-24 right-4 flex flex-col gap-3 items-end" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowCreateMenu(false); setShowSwarmModal(true); }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card shadow-xl border border-border animate-slide-up"
            >
              <div className="w-10 h-10 rounded-xl eco-gradient-bg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Launch a Swarm</p>
                <p className="text-[11px] text-muted-foreground">Start a campaign</p>
              </div>
            </button>
            <button
              onClick={() => { setShowCreateMenu(false); setShowCreateModal(true); }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card shadow-xl border border-border animate-slide-up"
              style={{ animationDelay: '0.05s' }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Create Post</p>
                <p className="text-[11px] text-muted-foreground">Share your story</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreateMenu(!showCreateMenu)}
        className={`eco-floating-button ${showCreateMenu ? 'rotate-45' : 'animate-pulse-glow'} transition-transform`}
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

      {/* Create Swarm Modal */}
      <CreateSwarmModal
        isOpen={showSwarmModal}
        onClose={() => setShowSwarmModal(false)}
        onSwarmCreated={handleSwarmCreated}
      />

      {/* Media Lightbox */}
      {lightboxMedia && (
        <AdvancedMediaViewer
          isOpen={!!lightboxMedia}
          onClose={closeLightbox}
          mediaUrl={lightboxMedia.url}
          mediaType={lightboxMedia.type}
          initialRect={lightboxMedia.rect}
          galleryItems={lightboxMedia.galleryItems}
          initialIndex={lightboxMedia.initialIndex}
        />
      )}
    </AppLayout>
  );
}
