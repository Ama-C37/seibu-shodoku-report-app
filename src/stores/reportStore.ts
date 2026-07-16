import { create } from 'zustand';

import type { Report, ReportStatus } from '../models/report';
import * as reportRepository from '../repositories/reportRepository';

type ReportState = {
  reports: Report[];
  isLoading: boolean;
  hasLoaded: boolean;
  refresh: () => Promise<void>;
  save: (report: Report) => Promise<Report | null>;
  findByStatus: (status: ReportStatus) => Report[];
  findById: (reportId: string) => Report | null;
};

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  isLoading: false,
  hasLoaded: false,
  refresh: async () => {
    set({ isLoading: true });
    try {
      set({ reports: await reportRepository.findReports() });
    } finally {
      set({ isLoading: false, hasLoaded: true });
    }
  },
  save: async (report) => {
    await reportRepository.saveReport(report);
    const savedReport = await reportRepository.findReport(report.reportId);
    set({ reports: await reportRepository.findReports() });
    return savedReport;
  },
  findByStatus: (status) => get().reports.filter((report) => report.status === status),
  findById: (reportId) => get().reports.find((report) => report.reportId === reportId) ?? null
}));
