import { Share2 } from 'lucide-react';
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
  text = 'Join me on EcoSwarm - learn climate skills and shop sustainably!',
  compact = false
}: SocialShareButtonsProps) {
  
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)]',
    },
    {
      name: 'X',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'bg-foreground hover:bg-foreground/80',
    },
    {
      name: 'Facebook',
      icon: '👤',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: 'bg-[hsl(221,44%,41%)] hover:bg-[hsl(221,44%,35%)]',
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: null,
      color: 'bg-gradient-to-r from-[hsl(280,80%,50%)] via-[hsl(340,80%,55%)] to-[hsl(25,95%,55%)] hover:opacity-90',
      action: () => {
        navigator.clipboard.writeText(`${text} ${url}`);
        toast.success('Copied to clipboard! Paste in Instagram');
      },
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[hsl(210,70%,35%)] hover:bg-[hsl(210,70%,30%)]',
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-[hsl(200,80%,50%)] hover:bg-[hsl(200,80%,45%)]',
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
        await navigator.share({ title, text, url });
        toast.success('Shared successfully!');
        return true;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fall through to show buttons
          return false;
        }
        return true; // User cancelled, don't show fallback
      }
    }
    return false;
  };

  // Native share button shown as primary action
  const NativeShareButton = () => (
    <button
      onClick={async () => {
        const shared = await handleNativeShare();
        if (!shared) {
          navigator.clipboard.writeText(`${text} ${url}`);
          toast.success('Link copied to clipboard!');
        }
      }}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 mb-3"
    >
      <Share2 className="w-4 h-4" />
      Share via your device
    </button>
  );

  if (compact) {
    return (
      <div>
        {'share' in navigator && <NativeShareButton />}
        <div className="flex items-center gap-2">
          {shareLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleShare(link)}
              className={`w-8 h-8 rounded-full ${link.color} flex items-center justify-center text-white text-sm transition-all`}
              title={`Share on ${link.name}`}
            >
              {link.icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {'share' in navigator && <NativeShareButton />}
      <div className="grid grid-cols-3 gap-3">
        {shareLinks.slice(0, 6).map((link) => (
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
    </div>
  );
}
