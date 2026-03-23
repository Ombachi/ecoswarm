import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

function getTrustTier(score: number) {
  if (score >= 91) return { label: 'Platinum', color: 'from-[hsl(var(--eco-blue))] to-primary', textColor: 'text-primary' };
  if (score >= 71) return { label: 'Gold', color: 'from-[hsl(var(--eco-gold))] to-[hsl(var(--eco-orange))]', textColor: 'text-[hsl(var(--eco-gold))]' };
  if (score >= 41) return { label: 'Silver', color: 'from-muted-foreground to-foreground', textColor: 'text-muted-foreground' };
  return { label: 'Bronze', color: 'from-[hsl(var(--eco-orange))] to-destructive', textColor: 'text-[hsl(var(--eco-orange))]' };
}

export function TrustScoreBadge({ score, size = 'sm', showLabel = true }: TrustScoreBadgeProps) {
  const tier = getTrustTier(score);
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5', size === 'md' && 'px-3 py-1')}>
      <div className={cn(`bg-gradient-to-r ${tier.color} rounded-full p-0.5`)}>
        <Shield className={cn(iconSize, 'text-white')} />
      </div>
      {showLabel && (
        <span className={cn('text-[10px] font-bold', tier.textColor, size === 'md' && 'text-xs')}>
          {tier.label} ({score})
        </span>
      )}
    </div>
  );
}

export { getTrustTier };
