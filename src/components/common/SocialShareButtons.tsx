import { Share2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  text?: string;
  compact?: boolean;
}

export function SocialShareButtons({ 
  url = window.location.href, 
  title = 'Check this out on EcoSwarm!',
  text = 'Join me on EcoSwarm - the digital agora for Gen Z changemakers!',
  compact = false
}: SocialShareButtonsProps) {
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'X',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'bg-black hover:bg-gray-800',
    },
    {
      name: 'Facebook',
      icon: '👤',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: null, // Instagram doesn't support direct URL sharing
      color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90',
      action: () => {
        navigator.clipboard.writeText(`${text} ${url}`);
        toast.success('Copied to clipboard! Paste in Instagram');
      },
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
  ];

  const handleShare = async (link: typeof shareLinks[0]) => {
    if (link.action) {
      link.action();
      return;
    }
    
    if (link.url) {
      window.open(link.url, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast.success('Link copied to clipboard!');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {shareLinks.slice(0, 4).map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link)}
            className={`w-8 h-8 rounded-full ${link.color} flex items-center justify-center text-white text-sm transition-all`}
            title={`Share on ${link.name}`}
          >
            {link.icon}
          </button>
        ))}
        <button
          onClick={handleNativeShare}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-all"
          title="More options"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {shareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link)}
            className={`${link.color} text-white rounded-xl p-3 flex flex-col items-center gap-1 transition-all`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-xs font-medium">{link.name}</span>
          </button>
        ))}
      </div>
      
      <button
        onClick={handleNativeShare}
        className="w-full eco-button-secondary py-3 flex items-center justify-center gap-2"
      >
        <Share2 className="w-5 h-5" />
        More Sharing Options
      </button>
    </div>
  );
}