import type { Report, ReportStatus } from '../models/report';

const reportsKey = 'seibu-report-reports';

export function findReports() {
  const raw = localStorage.getItem(reportsKey);
  const reports = raw ? (JSON.parse(raw) as Report[]) : [];
  return reports.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function findReport(reportId: string) {
  return findReports().find((report) => report.reportId === reportId) ?? null;
}

export function findReportsByStatus(status: ReportStatus) {
  return findReports().filter((report) => report.status === status);
}

export function saveReport(report: Report) {
  const reports = findReports();
  const index = reports.findIndex((item) => item.reportId === report.reportId);
  if (index >= 0) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  localStorage.setItem(reportsKey, JSON.stringify(reports));
}
