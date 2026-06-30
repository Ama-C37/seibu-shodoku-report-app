import { ChevronRight } from 'lucide-react';

import type { Report } from '../models/report';
import { formatDate } from '../utils/dateFormatter';
import { reportStatusLabel, reportTypeLabel } from '../utils/constants';

type Props = {
  report: Report;
  onClick: () => void;
};

export function ReportCard({ report, onClick }: Props) {
  return (
    <button className="report-card" onClick={onClick}>
      <span>
        <strong>{report.title}</strong>
        <small>
          {reportTypeLabel(report.reportType)} / {formatDate(report.workDate)}
        </small>
      </span>
      <span className="report-card-status">{reportStatusLabel(report.status)}</span>
      <ChevronRight size={18} />
    </button>
  );
}
