import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certId: string;
  issuingOrganization?: string;
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateCertificatePdf(data: CertificateData): Promise<void> {
  const org = data.issuingOrganization || 'EcoSwarm Climate Academy';
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;
  const H = 210;

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Top band
  doc.setFillColor(23, 79, 43);
  doc.rect(0, 0, W, 6, 'F');
  doc.setFillColor(0, 128, 128);
  doc.rect(W / 2, 0, W / 2, 6, 'F');

  // Double border
  doc.setDrawColor(23, 79, 43);
  doc.setLineWidth(0.8);
  doc.rect(10, 12, W - 20, H - 22, 'S');
  doc.setDrawColor(190, 160, 70);
  doc.setLineWidth(0.3);
  doc.rect(13, 15, W - 26, H - 28, 'S');

  // Logo (real image asset, never a glyph)
  const logo = await loadImageAsDataUrl('/pwa-icon-512.png');
  if (logo) {
    doc.addImage(logo, 'PNG', W / 2 - 11, 22, 22, 22);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 79, 43);
  doc.text('ECOSWARM', W / 2, 51, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(30, 30, 30);
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 65, { align: 'center' });

  doc.setDrawColor(190, 160, 70);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - 30, 70, W / 2 + 30, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text('This certifies that', W / 2, 83, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(25, 25, 25);
  doc.text(data.userName, W / 2, 98, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text('has successfully completed', W / 2, 110, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(23, 79, 43);
  const titleLines = doc.splitTextToSize(data.courseTitle, W - 90) as string[];
  doc.text(titleLines, W / 2, 122, { align: 'center' });

  const afterTitle = 122 + titleLines.length * 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 110, 110);
  doc.text('EcoSwarm Climate Academy', W / 2, afterTitle, { align: 'center' });

  // Footer details
  const baseY = H - 42;
  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.3);
  doc.line(25, baseY - 4, 110, baseY - 4);
  doc.line(W - 110, baseY - 4, W - 25, baseY - 4);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Date of completion', 25, baseY + 1);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 110);
  doc.text(data.completionDate, 25, baseY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Credential ID', 25, baseY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 110);
  doc.text(data.certId.toUpperCase(), 25, baseY + 19);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Issuing organization', W - 25, baseY + 1, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 110, 110);
  doc.text(org, W - 25, baseY + 6, { align: 'right' });
  doc.text('ecoswarm.co.ke', W - 25, baseY + 11, { align: 'right' });

  // QR verification
  const verifyUrl = `${window.location.origin}/verify/${data.certId}`;
  try {
    const qr = await QRCode.toDataURL(verifyUrl, { width: 320, margin: 1 });
    doc.addImage(qr, 'PNG', W / 2 - 14, baseY - 6, 28, 28);
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text('Scan to verify', W / 2, baseY + 26, { align: 'center' });
  } catch {
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(`Verify at ${verifyUrl}`, W / 2, baseY + 10, { align: 'center' });
  }

  // Bottom band
  doc.setFillColor(23, 79, 43);
  doc.rect(0, H - 6, W, 6, 'F');
  doc.setFillColor(0, 128, 128);
  doc.rect(W / 2, H - 6, W / 2, 6, 'F');

  doc.save(`EcoSwarm-Certificate-${data.certId.slice(0, 8)}.pdf`);
}
