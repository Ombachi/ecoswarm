import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarFallbackProps {
  src?: string | null;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export function AvatarFallback({ src, name, className = '', size = 'md' }: AvatarFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || '';
  const sizeClass = sizeClasses[size];

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  if (initial) {
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
        {initial}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 ${className}`}>
      <User className="w-1/2 h-1/2" />
    </div>
  );
}
