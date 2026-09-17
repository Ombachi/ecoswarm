import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, className = '' }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <nav className={`flex items-center justify-center gap-1.5 pt-4 ${className}`} aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className="p-2 rounded-xl border border-border bg-card text-foreground disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <span key={p} className="flex items-center gap-1.5">
            {prev && p - prev > 1 && <span className="text-xs text-muted-foreground px-0.5">…</span>}
            <button
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-9 h-9 px-2 rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? 'eco-gradient-bg text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        aria-label="Next page"
        className="p-2 rounded-xl border border-border bg-card text-foreground disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
