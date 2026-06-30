import { create } from 'zustand';

import type { Report, ReportStatus } from '../models/report';
import * as reportRepository from '../repositories/reportRepository';

type ReportState = {
  reports: Report[];
  refresh: () => void;
  save: (report: Report) => void;
  findByStatus: (status: ReportStatus) => Report[];
  findById: (reportId: string) => Report | null;
};

export const useReportStore = create<ReportState>((set, get) => ({
  reports: reportRepository.findReports(),
  refresh: () => set({ reports: reportRepository.findReports() }),
  save: (report) => {
    reportRepository.saveReport(report);
    set({ reports: reportRepository.findReports() });
  },
  findByStatus: (status) => get().reports.filter((report) => report.status === status),
  findById: (reportId) => get().reports.find((report) => report.reportId === reportId) ?? null
}));
