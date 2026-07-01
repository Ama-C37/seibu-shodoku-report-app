import { jsPDF } from 'jspdf';

import type { Report } from '../models/report';
import { formatDate } from '../utils/dateFormatter';
import { photoTypeLabel, reportTypeLabel } from '../utils/constants';

function addWrappedText(doc: jsPDF, label: string, value: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.text(label, 14, y);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(value || ' ', 150);
  doc.text(lines, 52, y);
  return y + Math.max(lines.length * 7, 9);
}

export function createReportPdf(report: Report) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 18;

  doc.setFontSize(18);
  doc.text(report.title, 14, y);
  doc.setFontSize(11);
  y += 16;
  y = addWrappedText(doc, '報告書種別', reportTypeLabel(report.reportType), y);
  y = addWrappedText(doc, '作業日', formatDate(report.workDate), y);
  y = addWrappedText(doc, '作業場所', report.locationName, y);
  y = addWrappedText(doc, '住所', report.address, y);
  y = addWrappedText(doc, '報告者', report.reporterName, y);
  y = addWrappedText(doc, '所属支店', report.branchName, y);
  y = addWrappedText(doc, '報告内容', report.content, y + 4);
  addWrappedText(doc, '備考', report.remarks, y + 4);

  if (report.photoType === 'with_photo' && report.photos.length > 0) {
    report.photos.forEach((photo, index) => {
      if (index % 4 === 0) doc.addPage();
      const slot = index % 4;
      const x = slot % 2 === 0 ? 14 : 109;
      const top = slot < 2 ? 18 : 150;
      doc.rect(x, top, 82, 112);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(photo.description || '写真説明', 76), x + 3, top + 7);
      try {
        doc.addImage(photo.imageUrl, 'JPEG', x + 3, top + 18, 76, 86, undefined, 'FAST');
      } catch {
        doc.text('画像を読み込めません', x + 20, top + 60);
      }
    });
  }

  return doc;
}

export function downloadReportPdf(report: Report) {
  const doc = createReportPdf(report);
  doc.save(`${report.title || 'report'}.pdf`);
}

export function getReportPdfBlob(report: Report) {
  return createReportPdf(report).output('blob');
}
