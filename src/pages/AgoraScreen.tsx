import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { mockPosts } from '@/data/mockData';
import { Post } from '@/types/ecoswarm';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { CommentsSection } from '@/components/posts/CommentsSection';
import { SocialShareButtons } from '@/components/common/SocialShareButtons';
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
} from 'lucide-react';

export function AgoraScreen() {
  const { user, addPoints, showNotification } = useApp();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [expandedShare, setExpandedShare] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handlePostCreated = (postData: { content: string; mediaUrl?: string; mediaType?: 'image' | 'video' | 'file' }) => {
    if (!user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: postData.content,
      mediaUrl: postData.mediaUrl,
      mediaType: postData.mediaType === 'file' ? undefined : postData.mediaType,
      likes: 0,
      comments: 0,
      shares: 0,
      tags: [],
      createdAt: new Date(),
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
    addPoints(20);
    showNotification('Story shared! 📢', 20);
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
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, comments: count } : post
    ));
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Agora Square</h1>
          <div className="flex items-center gap-2">
            <span className="eco-badge">🔥 Trending</span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-border">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="p-4 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
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

            {/* Media Display */}
            {post.mediaUrl ? (
              <div className="mb-3">
                {post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full max-h-80 rounded-xl object-cover"
                  />
                ) : post.mediaType === 'image' ? (
                  <img
                    src={post.mediaUrl}
                    alt="Post media"
                    className="w-full max-h-80 rounded-xl object-cover"
                  />
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

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-primary text-sm font-medium flex items-center gap-0.5"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                  </span>
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
                  expandedComments === post.id ? 'text-primary' : 'text-muted-foreground'
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
                  expandedShare === post.id ? 'text-primary' : 'text-muted-foreground'
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
                onCommentCountChange={(count) => handleCommentCountChange(post.id, count)}
              />
            )}

            {/* Expanded Share */}
            {expandedShare === post.id && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">Share this post</p>
                <SocialShareButtons 
                  url={`${window.location.origin}/post/${post.id}`}
                  title={`Check out this post on EcoSwarm!`}
                  text={post.content.substring(0, 100)}
                  compact
                />
              </div>
            )}
          </div>
        ))}
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
    </AppLayout>
  );
}