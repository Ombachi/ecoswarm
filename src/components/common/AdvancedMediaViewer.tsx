import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AdvancedMediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  alt?: string;
  initialRect?: DOMRect | null;
}

export function AdvancedMediaViewer({ 
  isOpen, onClose, mediaUrl, mediaType, alt, initialRect 
}: AdvancedMediaViewerProps) {
  const [scale, setScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pinch-to-zoom state
  const initialDistance = useRef(0);
  const initialScale = useRef(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const lastTouchCenter = useRef({ x: 0, y: 0 });
  const isPinching = useRef(false);
  const isPanning = useRef(false);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-200, 0, 200], [0, 1, 0]);
  const backgroundOpacity = useTransform(y, [-200, 0, 200], [0.3, 1, 0.3]);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
      setTranslateX(0);
      setTranslateY(0);
      lastTranslate.current = { x: 0, y: 0 };
    }
  }, [isOpen]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (mediaType === 'video' && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [mediaType, isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [isPlaying, resetControlsTimeout]);

  // --- Pinch-to-zoom touch handlers ---
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinching.current = true;
      initialDistance.current = getTouchDistance(e.touches);
      initialScale.current = scale;
      lastTouchCenter.current = getTouchCenter(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      isPanning.current = true;
      lastTouchCenter.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching.current) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      const newScale = Math.min(8, Math.max(1, initialScale.current * (newDistance / initialDistance.current)));
      setScale(newScale);

      const center = getTouchCenter(e.touches);
      const dx = center.x - lastTouchCenter.current.x;
      const dy = center.y - lastTouchCenter.current.y;
      setTranslateX((prev) => prev + dx);
      setTranslateY((prev) => prev + dy);
      lastTouchCenter.current = center;
    } else if (e.touches.length === 1 && isPanning.current && scale > 1) {
      const dx = e.touches[0].clientX - lastTouchCenter.current.x;
      const dy = e.touches[0].clientY - lastTouchCenter.current.y;
      setTranslateX((prev) => prev + dx);
      setTranslateY((prev) => prev + dy);
      lastTouchCenter.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      isPinching.current = false;
      // Snap back to 1x if below threshold
      if (scale < 1.1) {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
      }
    }
    if (e.touches.length === 0) {
      isPanning.current = false;
    }
  };

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

  const handleDoubleClick = () => {
    if (scale === 1) { setScale(2); } else { setScale(1); setTranslateX(0); setTranslateY(0); }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.y) > 100 && scale === 1) onClose(); else y.set(0);
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen();
  };

  const getInitialPosition = () => {
    if (initialRect) {
      return {
        x: initialRect.left + initialRect.width / 2 - window.innerWidth / 2,
        y: initialRect.top + initialRect.height / 2 - window.innerHeight / 2,
        scale: initialRect.width / window.innerWidth * 2,
      };
    }
    return { x: 0, y: 0, scale: 0.5 };
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

          {/* Close button */}
          <motion.div
            className="absolute top-4 right-4 z-50 flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {scale > 1 && (
              <span className="text-white/80 text-xs bg-black/40 px-2 py-1 rounded-full">
                {scale.toFixed(1)}x
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

          {/* Media Container */}
          <motion.div
            className="relative flex items-center justify-center w-full h-full"
            style={{ y, opacity }}
            drag={scale === 1 ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              ref={mediaRef}
              initial={getInitialPosition()}
              animate={{ x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full"
              onDoubleClick={handleDoubleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
              }}
            >
              {mediaType === 'video' ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={mediaUrl}
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
                    initial={{ opacity: 0, y: 20 }}
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
                <img
                  src={mediaUrl}
                  alt={alt || 'Media content'}
                  className="max-w-[90vw] max-h-[90vh] object-contain select-none rounded-lg"
                  draggable={false}
                />
              )}
            </motion.div>
          </motion.div>

          {/* Help text */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <p>Pinch to zoom (up to 8x) • Double-tap to zoom • Swipe to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
