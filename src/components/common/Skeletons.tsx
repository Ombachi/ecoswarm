import { cn } from '@/lib/utils';

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-muted', className)} />;
}

/** Card skeleton used by EcoMarket / EcoMerch product grids. */
export function ProductCardSkeleton() {
  return (
    <div className="eco-card overflow-hidden">
      <SkeletonBlock className="w-full h-36 sm:h-40 -mx-4 -mt-4 mb-3 rounded-none" />
      <SkeletonBlock className="h-4 w-3/4 mb-2" />
      <SkeletonBlock className="h-3 w-full mb-1.5" />
      <SkeletonBlock className="h-3 w-2/3 mb-3" />
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-12" />
      </div>
      <SkeletonBlock className="h-10 w-full mt-3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        className
      )}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Course list skeleton for the Capacity Hub. */
export function CourseCardSkeleton() {
  return (
    <div className="eco-card p-4 flex items-start gap-3">
      <SkeletonBlock className="w-12 h-12 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="h-3 w-full" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading courses">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Shared responsive empty state. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center px-6 py-14 sm:py-20">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs sm:max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
