import { Leaf } from 'lucide-react';

interface EcoPointsBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

export function EcoPointsBadge({ points, size = 'md' }: EcoPointsBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`eco-points-badge ${sizeClasses[size]}`}>
      <Leaf className="w-4 h-4" />
      <span>{points.toLocaleString()}</span>
    </div>
  );
}
