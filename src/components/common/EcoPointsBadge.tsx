import React from 'react';
import { Leaf } from 'lucide-react';

interface EcoPointsBadgeProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

export const EcoPointsBadge = React.forwardRef<HTMLDivElement, EcoPointsBadgeProps>(
  ({ points, size = 'md' }, ref) => {
    const sizeClasses = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-1.5',
      lg: 'text-base px-4 py-2',
    };

    return (
      <div ref={ref} className={`eco-points-badge ${sizeClasses[size]}`}>
        <Leaf className="w-4 h-4" />
        <span>{points.toLocaleString()}</span>
      </div>
    );
  }
);

EcoPointsBadge.displayName = 'EcoPointsBadge';
