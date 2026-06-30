import type { ReportPhoto } from './reportPhoto';

export type ReportType = 'investigation' | 'construction';
export type PhotoType = 'with_photo' | 'without_photo';
export type ReportStatus = 'draft' | 'submitted';

export type Report = {
  reportId: string;
  reportType: ReportType;
  photoType: PhotoType;
  title: string;
  workDate: string;
  locationName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  reporterId: string;
  reporterName: string;
  branchId: string;
  branchName: string;
  content: string;
  correctedContent: string;
  remarks: string;
  status: ReportStatus;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  photos: ReportPhoto[];
};
