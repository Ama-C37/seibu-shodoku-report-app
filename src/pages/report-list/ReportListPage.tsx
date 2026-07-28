import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { HeaderNavButton } from '../../components/HeaderNavButton';
import { ReportCard } from '../../components/ReportCard';
import type { ReportStatus } from '../../models/report';
import { canEditReport } from '../../services/reportPermissionService';
import { useAuthStore } from '../../stores/authStore';
import { useReportStore } from '../../stores/reportStore';
import { reportStatusLabel } from '../../utils/constants';

const statuses = ['draft', 'submitted'];

export function ReportListPage() {
  const navigate = useNavigate();
  const { status } = useParams();
  const reports = useReportStore((state) => state.reports);
  const isLoading = useReportStore((state) => state.isLoading);
  const hasLoaded = useReportStore((state) => state.hasLoaded);
  const refresh = useReportStore((state) => state.refresh);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!status || !statuses.includes(status)) return <Navigate to="/home" replace />;
  const filtered = reports.filter((report) => report.status === status);

  async function openReport(reportId: string) {
    const report = reports.find((item) => item.reportId === reportId);
    if (!report) return;
    const editable = await canEditReport(user, report);
    navigate(editable ? `/report-form/${report.reportId}/edit` : `/report-detail/${report.reportId}`, {
      state: editable ? { resetDraft: true } : undefined
    });
  }

  return (
    <main className="app-shell">
      <header className="subpage-header row-header">
        <h1>{reportStatusLabel(status as ReportStatus)}一覧</h1>
        <HeaderNavButton target="home" />
      </header>
      {isLoading || !hasLoaded ? (
        <p className="empty-text">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="empty-text">報告書はありません。</p>
      ) : (
        <div className="list-stack">
          {filtered.map((report) => (
            <ReportCard
              key={report.reportId}
              report={report}
              onClick={() => void openReport(report.reportId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
