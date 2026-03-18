import { Building2 } from 'lucide-react';

interface SponsorBadgeProps {
  sponsorName: string;
  logoUrl?: string | null;
}

export function SponsorBadge({ sponsorName, logoUrl }: SponsorBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      {logoUrl ? (
        <img src={logoUrl} alt={sponsorName} className="w-5 h-5 rounded-full object-contain" />
      ) : (
        <Building2 className="w-4 h-4 text-primary" />
      )}
      <span className="text-[11px] font-medium text-primary">Sponsored by {sponsorName}</span>
    </div>
  );
}
