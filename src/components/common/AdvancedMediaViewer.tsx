import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export interface GalleryItem {
  url: string;
  type: 'image' | 'video' | 'file';
}

interface AdvancedMediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  alt?: string;
  initialRect?: DOMRect | null;
  /** Gallery items for prev/next navigation */
  galleryItems?: GalleryItem[];
  /** Current index in gallery */
  initialIndex?: number;
}

export function AdvancedMediaViewer({ 
  isOpen, onClose, mediaUrl, mediaType, alt, initialRect,
  galleryItems, initialIndex = 0,
}: AdvancedMediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-200, 0, 200], [0, 1, 0]);
  const backgroundOpacity = useTransform(y, [-200, 0, 200], [0.3, 1, 0.3]);

  // Derive current media from gallery or props
  const items = galleryItems && galleryItems.length > 0 
    ? galleryItems.filter(i => i.type !== 'file') 
    : [{ url: mediaUrl, type: mediaType }];
  const current = items[currentIndex] || items[0];
  const activeUrl = current.url;
  const activeType = current.type as 'image' | 'video';
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
    }
  }, [isOpen, initialIndex]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (activeType === 'video' && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [activeType, isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [isPlaying, resetControlsTimeout]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) setCurrentIndex(i => i - 1);
      if (e.key === 'ArrowRight' && hasNext) setCurrentIndex(i => i + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, hasPrev, hasNext, onClose]);

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }
  };

  const handleTimeUpdate = () => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (videoRef.current) setDuration(videoRef.current.duration); };
  const handleSeek = (value: number[]) => { if (videoRef.current) { videoRef.current.currentTime = value[0]; setCurrentTime(value[0]); } };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.y) > 100) onClose(); else y.set(0);
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen();
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrev) { setCurrentIndex(i => i - 1); setIsPlaying(false); }
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNext) { setCurrentIndex(i => i + 1); setIsPlaying(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-50 flex items-center justify-center touch-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onMouseMove={resetControlsTimeout}
        >
          <motion.div className="absolute inset-0 bg-black" style={{ opacity: backgroundOpacity }} />

          {/* Close button + counter */}
          <motion.div
            className="absolute top-4 right-4 z-50 flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {items.length > 1 && (
              <span className="text-white/80 text-xs bg-black/40 px-2 py-1 rounded-full">
                {currentIndex + 1} / {items.length}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Previous / Next arrows */}
          {hasPrev && (
            <motion.button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: showControls ? 1 : 0 }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}
          {hasNext && (
            <motion.button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: showControls ? 1 : 0 }}
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}

          {/* Media Container */}
          <motion.div
            className="relative flex items-center justify-center w-full h-full"
            style={{ y, opacity }}
            drag={activeType === 'image' ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-full max-h-full"
              >
                {activeType === 'video' ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={activeUrl}
                      className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      playsInline
                    />
                    {/* Video Controls */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                      animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-3">
                        <Slider value={[currentTime]} min={0} max={duration || 100} step={0.1} onValueChange={handleSeek} className="cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleFullscreen(); }} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                    {!isPlaying && (
                      <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  /* Image with react-medium-image-zoom for proper pinch + scroll zoom */
                  <Zoom>
                    <img
                      src={activeUrl}
                      alt={alt || 'Media content'}
                      className="max-w-[90vw] max-h-[90vh] object-contain select-none rounded-lg"
                      draggable={false}
                    />
                  </Zoom>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Help text */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center"
            animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <p>Pinch or scroll to zoom • Double-tap to zoom • Swipe down to dismiss</p>
          </motion.div>

          {/* Dots for gallery */}
          {items.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
