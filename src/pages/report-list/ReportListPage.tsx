import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { ReportCard } from '../../components/ReportCard';
import type { ReportStatus } from '../../models/report';
import { useReportStore } from '../../stores/reportStore';
import { reportStatusLabel } from '../../utils/constants';

const statuses = ['draft', 'submitted'];

export function ReportListPage() {
  const navigate = useNavigate();
  const { status } = useParams();
  const reports = useReportStore((state) => state.reports);

  if (!status || !statuses.includes(status)) return <Navigate to="/home" replace />;
  const filtered = reports.filter((report) => report.status === status);

  return (
    <main className="app-shell">
      <header className="subpage-header">
        <h1>{reportStatusLabel(status as ReportStatus)}一覧</h1>
      </header>
      {filtered.length === 0 ? (
        <p className="empty-text">報告書はありません。</p>
      ) : (
        <div className="list-stack">
          {filtered.map((report) => (
            <ReportCard key={report.reportId} report={report} onClick={() => navigate(`/report-detail/${report.reportId}`)} />
          ))}
        </div>
      )}
    </main>
  );
}
