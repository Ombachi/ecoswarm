import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, Loader2, Maximize2 } from 'lucide-react';
import { DocumentLightbox } from './DocumentLightbox';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentCarouselProps {
  fileUrl: string;
  fileName?: string;
  onExpand?: () => void;
}

export function DocumentCarousel({ fileUrl, fileName, onExpand }: DocumentCarouselProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setError(true);
    setIsLoading(false);
  }, []);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  const handleExpand = () => {
    if (onExpand) onExpand();
    else setShowLightbox(true);
  };

  if (error) {
    return (
      <div className="rounded-xl bg-muted p-6 flex flex-col items-center gap-3">
        <FileText className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Unable to preview this document</p>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium underline">
          Download {fileName || 'document'}
        </a>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden bg-muted/50 border border-border cursor-pointer"
        onClick={handleExpand}
      >
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={null}>
          <div className="relative min-h-[300px] flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <Page pageNumber={currentPage} width={Math.min(window.innerWidth - 48, 400)} renderTextLayer={false} renderAnnotationLayer={false} />
              </motion.div>
            </AnimatePresence>
          </div>
        </Document>

        {numPages > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); goToPrev(); }} disabled={currentPage === 1} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md hover:bg-background transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goToNext(); }} disabled={currentPage === numPages} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-md hover:bg-background transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="flex items-center justify-between px-3 py-2 bg-background/90 backdrop-blur-sm border-t border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">{fileName || 'Document'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-semibold">{currentPage} / {numPages || '...'}</span>
            <button onClick={(e) => { e.stopPropagation(); handleExpand(); }} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <DocumentLightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        fileUrl={fileUrl}
        fileName={fileName}
      />
    </>
  );
}
