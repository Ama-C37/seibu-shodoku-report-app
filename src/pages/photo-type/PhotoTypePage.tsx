import { Camera, FileText } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import type { ReportType } from '../../models/report';

const reportTypes = ['investigation', 'construction'];

export function PhotoTypePage() {
  const navigate = useNavigate();
  const { reportType } = useParams();

  if (!reportType || !reportTypes.includes(reportType)) return <Navigate to="/report-type" replace />;

  return (
    <main className="app-shell">
      <header className="subpage-header">
        <h1>写真有無</h1>
      </header>
      <div className="choice-list">
        <button onClick={() => navigate(`/report-form/${reportType as ReportType}/with_photo`)}>
          <Camera />
          写真付き
        </button>
        <button onClick={() => navigate(`/report-form/${reportType as ReportType}/without_photo`)}>
          <FileText />
          写真なし
        </button>
      </div>
    </main>
  );
}
