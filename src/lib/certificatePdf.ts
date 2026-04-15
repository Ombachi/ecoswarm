import jsPDF from 'jspdf';

interface CertificateData {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certId: string;
}

export function generateCertificatePdf(data: CertificateData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;

  // ── Gold header band ──
  doc.setFillColor(218, 165, 32); // golden
  doc.rect(0, 0, W, 60, 'F');
  // gradient overlay
  doc.setFillColor(200, 130, 20);
  doc.rect(W * 0.6, 0, W * 0.4, 60, 'F');

  // Logo circle
  doc.setFillColor(255, 255, 255);
  doc.circle(W / 2, 25, 10, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(218, 165, 32);
  doc.text('🌿', W / 2, 28, { align: 'center' });

  // Title in header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('EcoSwarm', W / 2, 45, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 200);
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 53, { align: 'center' });

  // ── Body ──
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 60, W, H - 60, 'F');

  // Decorative border
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.5);
  doc.rect(15, 70, W - 30, H - 100, 'S');
  doc.setLineWidth(0.3);
  doc.rect(17, 72, W - 34, H - 104, 'S');

  // "This certifies that"
  let y = 100;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('This certifies that', W / 2, y, { align: 'center' });

  // User name
  y += 18;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(data.userName, W / 2, y, { align: 'center' });

  // Decorative line under name
  y += 8;
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 40, y, W / 2 + 40, y);

  // "has successfully completed"
  y += 14;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('has successfully completed', W / 2, y, { align: 'center' });

  // Course title - green gradient bar
  y += 12;
  doc.setFillColor(34, 139, 34);
  const barH = 14;
  const titleWidth = Math.min(doc.getTextWidth(data.courseTitle) * 1.2 + 20, W - 60);
  doc.roundedRect((W - titleWidth) / 2, y - 2, titleWidth, barH, 3, 3, 'F');
  // Teal overlay on right half
  doc.setFillColor(0, 128, 128);
  doc.roundedRect(W / 2, y - 2, titleWidth / 2, barH, 0, 3, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(data.courseTitle, W / 2, y + 8, { align: 'center' });

  // Date
  y += 26;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text(data.completionDate, W / 2, y, { align: 'center' });

  // Certificate ID
  y += 18;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(W / 2 - 25, y - 5, 50, 12, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`ID: ${data.certId.slice(0, 8).toUpperCase()}`, W / 2, y + 2, { align: 'center' });

  // Verification URL
  y += 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Verify at: ecoswarm.lovable.app/verify/${data.certId}`, W / 2, y, { align: 'center' });

  // ── Green footer band ──
  doc.setFillColor(34, 139, 34);
  doc.rect(0, H - 20, W, 20, 'F');
  doc.setFillColor(0, 128, 128);
  doc.rect(W / 2, H - 20, W / 2, 20, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Capacity Hub • ecoswarm.co.ke', W / 2, H - 8, { align: 'center' });

  // Save
  doc.save(`EcoSwarm-Certificate-${data.certId.slice(0, 8)}.pdf`);
}
