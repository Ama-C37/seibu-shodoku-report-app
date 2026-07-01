import { Download, Edit3, Share2 } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PrimaryButton } from '../../components/PrimaryButton';
import { useReportStore } from '../../stores/reportStore';
import { downloadReportPdf, getReportPdfBlob } from '../../services/pdfService';
import { errors, photoTypeLabel, reportTypeLabel } from '../../utils/constants';
import { formatDate } from '../../utils/dateFormatter';
import { useState } from 'react';

export function PdfPreviewPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const report = useReportStore((store) => store.reports.find((item) => item.reportId === reportId));
  const [message, setMessage] = useState('');

  if (!report) return <Navigate to="/home" replace />;

  const currentReport = report;

  async function sharePdf() {
    setMessage('');
    try {
      const blob = getReportPdfBlob(currentReport);
      const file = new File([blob], `${currentReport.title || 'report'}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: currentReport.title });
      } else {
        downloadReportPdf(currentReport);
      }
    } catch {
      setMessage(errors.pdf);
    }
  }

  return (
    <main className="app-shell">
      <header className="subpage-header">
        <h1>PDF確認</h1>
      </header>
      {message ? <p className="alert">{message}</p> : null}
      <section className="pdf-preview">
        <div className="pdf-page">
          <h2>{currentReport.title}</h2>
          <dl>
            <dt>報告書種別</dt>
            <dd>{reportTypeLabel(currentReport.reportType)} / {photoTypeLabel(currentReport.photoType)}</dd>
            <dt>作業日</dt>
            <dd>{formatDate(currentReport.workDate)}</dd>
            <dt>作業場所</dt>
            <dd>{currentReport.locationName}</dd>
            <dt>住所</dt>
            <dd>{currentReport.address || '未入力'}</dd>
            <dt>報告者</dt>
            <dd>{currentReport.reporterName}</dd>
            <dt>所属支店</dt>
            <dd>{currentReport.branchName || '未設定'}</dd>
          </dl>
          <h3>報告内容</h3>
          <p className="pre-line">{currentReport.content}</p>
          <h3>備考</h3>
          <p className="pre-line">{currentReport.remarks || ' '}</p>
        </div>
        {currentReport.photoType === 'with_photo' && currentReport.photos.length > 0 ? (
          <div className="pdf-page photo-page">
            {currentReport.photos.map((photo) => (
              <figure key={photo.photoId}>
                <figcaption>{photo.description || '写真説明'}</figcaption>
                <img src={photo.imageUrl} alt={photo.description || '報告書写真'} />
              </figure>
            ))}
          </div>
        ) : null}
      </section>
      <div className="action-bar">
        <PrimaryButton icon={<Edit3 size={18} />} variant="secondary" onClick={() => navigate(`/report-form/${currentReport.reportId}/edit`)}>
          入力画面に戻る
        </PrimaryButton>
        <PrimaryButton icon={<Download size={18} />} onClick={() => downloadReportPdf(currentReport)}>
          PDFダウンロード
        </PrimaryButton>
        <PrimaryButton icon={<Share2 size={18} />} variant="secondary" onClick={sharePdf}>
          共有
        </PrimaryButton>
      </div>
    </main>
  );
}
