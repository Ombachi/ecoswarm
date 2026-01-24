import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { mockPosts } from '@/data/mockData';
import { Post } from '@/types/ecoswarm';
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  X,
  Hash,
  Image as ImageIcon,
  Video,
  Send,
} from 'lucide-react';

export function AgoraScreen() {
  const { user, addPoints, showNotification } = useApp();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

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

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: newPostContent,
      likes: 0,
      comments: 0,
      shares: 0,
      tags: [],
      createdAt: new Date(),
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreateModal(false);
    addPoints(20);
    showNotification('Story shared! 📢', 20);
  };

  const handleShare = () => {
    showNotification('Shared to X! 🐦');
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

            {/* Media Placeholder */}
            {post.mediaType && (
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

              <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Share2 className="w-5 h-5" />
                <span>{post.shares}</span>
              </button>

              <button className="eco-badge text-xs">🐦 Share to X</button>
            </div>
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
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-card w-full rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Share Your Story</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="eco-avatar flex-shrink-0">
                {user?.name.charAt(0)}
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What environmental issue are you facing? Share your story..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground min-h-[120px]"
                autoFocus
              />
            </div>

            {/* Suggested Tags */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {['#NairobiPollution', '#ClimateJustice', '#KenyaClimate', '#GenZActivism'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setNewPostContent((prev) => `${prev} ${tag}`)}
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground">
                <ImageIcon className="w-5 h-5" />
                Photo
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground">
                <Video className="w-5 h-5" />
                Video
              </button>
            </div>

            {/* Post Button */}
            <button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              className="w-full eco-button-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              Post Story (+20 pts)
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
