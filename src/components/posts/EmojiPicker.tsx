import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: '🌍 Nature',
    emojis: ['🌍', '🌱', '🌿', '🍀', '🌳', '🌲', '🪴', '🌾', '🌻', '🌸', '🌺', '🦋', '🐝', '🐢', '🐘', '🦁', '🐬', '🐋', '🦅', '🌊', '🏔️', '☀️', '🌤️', '⛅', '🌈', '💧', '❄️', '🔥', '🍃', '🌵'],
  },
  {
    name: '💚 Eco',
    emojis: ['♻️', '💚', '🤝', '✊', '💪', '🙌', '👏', '🎯', '🏆', '⭐', '🌟', '✨', '💡', '📢', '📣', '🔔', '🎉', '🎊', '🚀', '📊', '📈', '🗳️', '📝', '📋', '🗺️', '🧭', '⚡', '🔋', '🌐', '🏡'],
  },
  {
    name: '😊 Faces',
    emojis: ['😊', '😃', '😄', '🥰', '😍', '🤗', '😇', '🥳', '😎', '🤔', '🫡', '😤', '😢', '😭', '😱', '🤯', '💪', '🙏', '❤️', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '👀', '🫶', '✌️'],
  },
  {
    name: '🍎 Food',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🥝', '🍅', '🥑', '🥦', '🥬', '🌽', '🥕', '🧅', '🥜', '🌶️', '🫑'],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        title="Add emoji"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Category tabs */}
          <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-hide">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(i)}
                className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === i
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-2 grid grid-cols-8 gap-0.5 max-h-40 overflow-y-auto">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onSelect(emoji); setIsOpen(false); }}
                className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-muted transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
