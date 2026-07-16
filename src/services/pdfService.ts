import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import type { Report } from '../models/report';
import { formatDate } from '../utils/dateFormatter';
import { photoTypeLabel, reportTypeLabel } from '../utils/constants';

const pageWidth = 210;
const pageHeight = 297;
const margin = 16;
const brandColor: [number, number, number] = [23, 107, 77];
const inkColor: [number, number, number] = [31, 42, 36];
const mutedColor: [number, number, number] = [100, 115, 107];
const lineColor: [number, number, number] = [210, 220, 214];

function setColor(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setDrawColor(doc: jsPDF, color: [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function addPageFrame(doc: jsPDF, sectionTitle: string, pageNumber: number) {
  setDrawColor(doc, lineColor);
  doc.setLineWidth(0.3);
  doc.line(margin, 14, pageWidth - margin, 14);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(doc, brandColor);
  doc.text('SEIBU SHODOKU', margin, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setColor(doc, mutedColor);
  doc.text(sectionTitle, pageWidth - margin, 10, { align: 'right' });
  doc.text(`${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
}

function addSectionHeading(doc: jsPDF, title: string, y: number) {
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.roundedRect(margin, y - 7, 3, 10, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  setColor(doc, inkColor);
  doc.text(title, margin + 7, y);
}

function addInfoRow(doc: jsPDF, label: string, value: string, y: number) {
  setDrawColor(doc, lineColor);
  doc.line(margin, y + 5, pageWidth - margin, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(doc, mutedColor);
  doc.text(label, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, inkColor);
  const lines = doc.splitTextToSize(value || ' ', 128);
  doc.text(lines, 58, y);
  return y + Math.max(lines.length * 5.5, 9);
}

function addTextBlock(doc: jsPDF, title: string, value: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, brandColor);
  doc.text(title, margin, y);
  setDrawColor(doc, lineColor);
  doc.line(margin, y + 3, pageWidth - margin, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, inkColor);
  const lines = doc.splitTextToSize(value || ' ', pageWidth - margin * 2);
  doc.text(lines, margin, y + 11);
  return y + 17 + lines.length * 5.2;
}

function addCoverPage(doc: jsPDF, report: Report) {
  addPageFrame(doc, 'Cover', 1);

  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 34, pageWidth, 38, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(reportTypeLabel(report.reportType), margin, 49);
  doc.setFontSize(26);
  doc.text(report.title || '報告書', margin, 64, { maxWidth: pageWidth - margin * 2 });

  if (report.coverImageUrl) {
    try {
      doc.addImage(report.coverImageUrl, 'JPEG', margin, 80, pageWidth - margin * 2, 118, undefined, 'FAST');
    } catch {
      setColor(doc, mutedColor);
      doc.text('施工現場全景', pageWidth / 2, 140, { align: 'center' });
    }
  } else {
    setColor(doc, mutedColor);
    doc.text('施工現場全景', pageWidth / 2, 140, { align: 'center' });
  }

  let y = 210;
  y = addInfoRow(doc, '作業日', formatDate(report.workDate), y);
  y = addInfoRow(doc, '作業場所', report.address || report.locationName || '未入力', y);
  y = addInfoRow(doc, '報告者', report.reporterName, y);
  addInfoRow(doc, '所属支店', report.branchName || '未設定', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, mutedColor);
  doc.text('Submitted report prepared for customer review', margin, 252);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  setColor(doc, inkColor);
  doc.text('西武消毒', margin, 267);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, mutedColor);
  doc.text(`作成日 ${formatDate(new Date().toISOString().slice(0, 10))}`, margin, 276);
}

function addReportPage(doc: jsPDF, report: Report) {
  doc.addPage();
  addPageFrame(doc, 'Report', 2);
  addSectionHeading(doc, '報告内容', 32);

  let y = 50;
  y = addInfoRow(doc, '作業日', formatDate(report.workDate), y);
  y = addInfoRow(doc, '作業場所', report.address || report.locationName || '未入力', y);
  y += 8;
  y = addTextBlock(doc, '本文', report.content, y);
  addTextBlock(doc, '備考', report.remarks || ' ', Math.min(y + 4, 232));
}

function addPhotoPages(doc: jsPDF, report: Report) {
  if (report.photoType !== 'with_photo' || report.photos.length === 0) return;

  report.photos.forEach((photo, index) => {
    if (index % 6 === 0) {
      doc.addPage();
      addPageFrame(doc, 'Photos', 3 + Math.floor(index / 6));
      addSectionHeading(doc, '写真記録', 32);
    }

    const slot = index % 6;
    const x = slot % 2 === 0 ? margin : 108;
    const y = 48 + Math.floor(slot / 2) * 78;
    const boxWidth = 86;
    const boxHeight = 72;

    setDrawColor(doc, lineColor);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2);
    doc.setFillColor(248, 250, 247);
    doc.rect(x + 1, y + 1, boxWidth - 2, 16, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, inkColor);
    doc.text(`写真 ${index + 1}`, x + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, mutedColor);
    doc.text(doc.splitTextToSize(photo.description || '写真説明', boxWidth - 8), x + 4, y + 13);

    try {
      doc.addImage(photo.imageUrl, 'JPEG', x + 4, y + 21, boxWidth - 8, 46, undefined, 'FAST');
    } catch {
      setColor(doc, mutedColor);
      doc.text('画像を読み込めません', x + 24, y + 46);
    }
  });
}

export function createReportPdf(report: Report) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addCoverPage(doc, report);
  addReportPage(doc, report);
  addPhotoPages(doc, report);
  return doc;
}

export function downloadReportPdf(report: Report) {
  const doc = createReportPdf(report);
  doc.save(`${report.title || 'report'}.pdf`);
}

export function getReportPdfBlob(report: Report) {
  return createReportPdf(report).output('blob');
}

export async function createPdfFromPages(pages: HTMLElement[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (const [index, page] of pages.entries()) {
    if (index > 0) doc.addPage();
    const canvas = await renderPdfPage(page);
    const imageData = canvas.toDataURL('image/png');
    doc.addImage(imageData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  }

  return doc;
}

async function renderPdfPage(page: HTMLElement) {
  const exportRoot = document.createElement('div');
  exportRoot.className = 'pdf-export-root';
  const pageClone = page.cloneNode(true) as HTMLElement;
  pageClone.classList.add('pdf-export-page');
  exportRoot.appendChild(pageClone);
  document.body.appendChild(exportRoot);

  try {
    await waitForExportAssets(exportRoot);
    return await html2canvas(pageClone, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      width: 794,
      height: 1123,
      windowWidth: 1200,
      windowHeight: 1400
    });
  } finally {
    exportRoot.remove();
  }
}

async function waitForExportAssets(root: HTMLElement) {
  await document.fonts?.ready;
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      try {
        await image.decode();
      } catch {
        await new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }
    })
  );
}

export async function downloadPdfPages(pages: HTMLElement[], fileName: string) {
  const doc = await createPdfFromPages(pages);
  doc.save(fileName);
}

export async function getPdfPagesBlob(pages: HTMLElement[]) {
  return (await createPdfFromPages(pages)).output('blob');
}
