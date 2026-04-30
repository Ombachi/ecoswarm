import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';
import { DocumentCarousel } from './DocumentCarousel';

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'file';
  fileName?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  onMediaClick?: (item: MediaItem, index: number, event: React.MouseEvent) => void;
}

export function MediaGallery({ items, onMediaClick }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.max(0, i - 1));
  };
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.min(items.length - 1, i + 1));
  };

  // Single image/video – simple render
  if (items.length === 1) {
    const item = items[0];
    if (item.type === 'file') {
      return <DocumentCarousel fileUrl={item.url} fileName={item.fileName} />;
    }
    if (item.type === 'video') {
      return (
        <div
          className="relative cursor-pointer group"
          onClick={(e) => onMediaClick?.(item, 0, e)}
        >
          <video src={item.url} className="w-full max-h-80 rounded-xl object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
            <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <Video className="w-4 h-4" /> Tap to view
            </div>
          </div>
        </div>
      );
    }
    return (
      <div
        className="relative cursor-pointer group"
        onClick={(e) => onMediaClick?.(item, 0, e)}
      >
        <img src={item.url} alt="Post media" className="w-full max-h-80 rounded-xl object-cover" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
          <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> Tap to zoom
          </div>
        </div>
      </div>
    );
  }

  // Multi-media carousel
  return (
    <div className="relative rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {currentItem.type === 'file' ? (
            <DocumentCarousel fileUrl={currentItem.url} fileName={currentItem.fileName} />
          ) : currentItem.type === 'video' ? (
            <div
              className="relative cursor-pointer group"
              onClick={(e) => onMediaClick?.(currentItem, currentIndex, e)}
            >
              <video src={currentItem.url} className="w-full max-h-80 rounded-xl object-cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                  <Video className="w-4 h-4" /> Tap to view
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative cursor-pointer group"
              onClick={(e) => onMediaClick?.(currentItem, currentIndex, e)}
            >
              <img src={currentItem.url} alt="Post media" className="w-full max-h-80 rounded-xl object-cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" /> Tap to zoom
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      {currentIndex > 0 && (
        <button
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md hover:bg-background transition-all z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {currentIndex < items.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md hover:bg-background transition-all z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-primary w-4' : 'bg-background/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
