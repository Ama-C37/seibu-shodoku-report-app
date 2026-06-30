import { Edit3, FileText } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { PrimaryButton } from '../../components/PrimaryButton';
import { useReportStore } from '../../stores/reportStore';
import { formatDate } from '../../utils/dateFormatter';
import { photoTypeLabel, reportStatusLabel, reportTypeLabel } from '../../utils/constants';

export function ReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const report = useReportStore((state) => state.reports.find((item) => item.reportId === reportId));

  if (!report) return <Navigate to="/home" replace />;

  return (
    <main className="app-shell">
      <header className="subpage-header">
        <h1>報告書詳細</h1>
      </header>
      <section className="detail-panel">
        <h2>{report.title}</h2>
        <dl>
          <dt>種別</dt>
          <dd>{reportTypeLabel(report.reportType)} / {photoTypeLabel(report.photoType)}</dd>
          <dt>状態</dt>
          <dd>{reportStatusLabel(report.status)}</dd>
          <dt>作業日</dt>
          <dd>{formatDate(report.workDate)}</dd>
          <dt>作業場所</dt>
          <dd>{report.locationName}</dd>
          <dt>報告者</dt>
          <dd>{report.reporterName}</dd>
          <dt>所属支店</dt>
          <dd>{report.branchName || '未設定'}</dd>
        </dl>
        <p className="pre-line">{report.content}</p>
      </section>
      <div className="action-bar">
        <PrimaryButton icon={<Edit3 size={18} />} onClick={() => navigate(`/report-form/${report.reportId}/edit`)}>
          編集
        </PrimaryButton>
        <PrimaryButton icon={<FileText size={18} />} variant="secondary" onClick={() => navigate(`/pdf-preview/${report.reportId}`)}>
          PDF表示
        </PrimaryButton>
      </div>
    </main>
  );
}
