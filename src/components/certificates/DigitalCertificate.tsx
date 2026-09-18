import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface DigitalCertificateProps {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certId: string;
  issuingOrganization?: string;
}

export function DigitalCertificate({
  userName,
  courseTitle,
  completionDate,
  certId,
  issuingOrganization = 'EcoSwarm Climate Academy',
}: DigitalCertificateProps) {
  const [qrCode, setQrCode] = useState('');
  const verifyUrl = `${window.location.origin}/verify/${certId}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#174f2b', light: '#ffffff' },
    }).then(setQrCode).catch(() => setQrCode(''));
  }, [verifyUrl]);

  return (
    <article className="relative aspect-[1.414/1] w-full overflow-hidden border border-border bg-card text-card-foreground shadow-lg">
      <div className="absolute inset-3 border border-primary/30 sm:inset-5" aria-hidden="true" />
      <div className="absolute inset-5 border border-accent/50 sm:inset-7" aria-hidden="true" />
      <div className="absolute left-0 top-0 h-2 w-full eco-gradient-bg" aria-hidden="true" />

      <div className="relative flex h-full flex-col items-center px-8 py-6 text-center sm:px-14 sm:py-9">
        <img
          src="/pwa-icon-512.png"
          alt="EcoSwarm"
          className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16"
        />
        <p className="mt-1 text-[8px] font-bold uppercase text-primary sm:text-xs">EcoSwarm</p>
        <h1 className="mt-2 text-xs font-bold uppercase text-foreground sm:mt-3 sm:text-xl">
          Certificate of Completion
        </h1>
        <div className="mt-2 h-px w-16 bg-accent sm:mt-3 sm:w-24" />

        <p className="mt-2 text-[7px] text-muted-foreground sm:mt-4 sm:text-sm">This certifies that</p>
        <h2 className="mt-1 max-w-[80%] text-base font-bold text-foreground sm:text-3xl">{userName}</h2>
        <p className="mt-1 text-[7px] text-muted-foreground sm:mt-3 sm:text-sm">has successfully completed</p>
        <h3 className="mt-1 max-w-[82%] text-sm font-bold text-primary sm:text-2xl">{courseTitle}</h3>
        <p className="mt-1 text-[7px] font-semibold text-secondary sm:mt-2 sm:text-sm">EcoSwarm Climate Academy</p>

        <div className="mt-auto grid w-full grid-cols-[1fr_auto_1fr] items-end gap-3 text-left sm:gap-8">
          <div className="min-w-0 border-t border-border pt-2 text-[6px] leading-relaxed text-muted-foreground sm:text-[11px]">
            <p className="font-semibold text-foreground">Date of completion</p>
            <p>{completionDate}</p>
            <p className="mt-1 font-semibold text-foreground">Credential ID</p>
            <p className="break-all">{certId.toUpperCase()}</p>
          </div>

          <div className="flex flex-col items-center">
            {qrCode ? (
              <img src={qrCode} alt="Scan to verify this certificate" className="h-12 w-12 sm:h-20 sm:w-20" />
            ) : (
              <div className="h-12 w-12 animate-pulse bg-muted sm:h-20 sm:w-20" />
            )}
            <p className="mt-1 text-[5px] font-medium text-muted-foreground sm:text-[9px]">Digital verification</p>
          </div>

          <div className="border-t border-border pt-2 text-right text-[6px] leading-relaxed text-muted-foreground sm:text-[11px]">
            <p className="font-semibold text-foreground">Issuing organization</p>
            <p>{issuingOrganization}</p>
            <p className="mt-1">ecoswarm.co.ke</p>
          </div>
        </div>
      </div>
    </article>
  );
}