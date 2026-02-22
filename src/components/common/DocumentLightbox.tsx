import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, ChevronLeft, ChevronRight, Download, Printer, Loader2, FileText, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
}

export function DocumentLightbox({ isOpen, onClose, fileUrl, fileName }: DocumentLightboxProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, numPages, onClose]);

  // Reset on open
  useEffect(() => {
    if (isOpen) { setCurrentPage(1); setIsLoading(true); }
  }, [isOpen]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'document.pdf';
    a.target = '_blank';
    a.click();
  };

  const handlePrint = () => {
    const w = window.open(fileUrl, '_blank');
    if (w) { w.addEventListener('load', () => w.print()); }
  };

  // Swipe gesture
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) goToNext();
    else if (info.offset.x > 80) goToPrev();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-50 flex flex-col touch-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Glassmorphism / dark backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

          {/* Header */}
          <motion.div
            className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm border-b border-white/10"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-white/70 flex-shrink-0" />
              <span className="text-white/90 text-sm font-medium truncate max-w-[200px]">
                {fileName || 'Document'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownload} className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Download">
                <Download className="w-5 h-5" />
              </button>
              <button onClick={handlePrint} className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Print">
                <Printer className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Document Content */}
          <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
            {/* Left Arrow */}
            {currentPage > 1 && (
              <button
                onClick={goToPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Arrow */}
            {currentPage < numPages && (
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={null}
            >
              {isLoading && (
                <div className="flex flex-col items-center gap-3 text-white/70">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <span className="text-sm">Loading document…</span>
                </div>
              )}

              <TransformWrapper
                key={currentPage}
                initialScale={1}
                minScale={0.5}
                maxScale={5}
                centerOnInit
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.3}
                      onDragEnd={handleDragEnd}
                    >
                      <TransformComponent
                        wrapperStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Page
                              pageNumber={currentPage}
                              width={Math.min(window.innerWidth - 80, 700)}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </TransformComponent>
                    </motion.div>

                    {/* Zoom controls */}
                    <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-20">
                      <button onClick={() => zoomIn()} className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm transition-all">
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <button onClick={() => zoomOut()} className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm transition-all">
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <button onClick={() => resetTransform()} className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm transition-all">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </TransformWrapper>
            </Document>
          </div>

          {/* Bottom Filmstrip / Page Counter */}
          <motion.div
            className="relative z-10 px-4 py-3 bg-black/40 backdrop-blur-sm border-t border-white/10 flex items-center justify-center gap-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <button onClick={goToPrev} disabled={currentPage <= 1} className="p-1.5 rounded text-white/60 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white/90 text-sm font-semibold tabular-nums">
              Page {currentPage} of {numPages || '…'}
            </span>
            <button onClick={goToNext} disabled={currentPage >= numPages} className="p-1.5 rounded text-white/60 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Help text */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 text-white/40 text-[10px] text-center">
            Pinch or scroll to zoom • Drag to pan • Swipe or arrow keys to navigate
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
