import type { ReportPhoto } from './reportPhoto';

export type ReportType = 'investigation' | 'construction';
export type PhotoType = 'with_photo' | 'without_photo';
export type ReportStatus = 'draft' | 'submitted';
export type ConstructionNoPhotoCopyType = 'customer' | 'company';
export type ConstructionNoPhotoHonorific = 'sama' | 'onchu';
export type PestActivityLevel = '-' | '+' | '++';

export type ConstructionNoPhotoReport = {
  copyType: ConstructionNoPhotoCopyType;
  addressee: string;
  honorific: ConstructionNoPhotoHonorific;
  reportCreatedDate: string;
  managementResponsibleName: string;
  workResponsibleName: string;
  workStartTime: string;
  workEndTime: string;
  targetPests: string;
  chemicals: string;
  treatmentMethod: string;
  chemicalAmount: string;
  notes: string;
  treatmentRows?: Array<{
    rowId: string;
    pestId?: string;
    pestName: string;
    chemicalId?: string;
    chemicalName: string;
    treatmentMethodId?: string;
    treatmentMethodName: string;
    chemicalAmount: string;
    notes: string;
  }>;
  workSummary: string;
  pestActivityRows: Array<{
    pestName: string;
    level: PestActivityLevel;
  }>;
};

export type Report = {
  reportId: string;
  reportType: ReportType;
  photoType: PhotoType;
  title: string;
  workDate: string;
  locationName: string;
  address: string;
  coverImageUrl?: string;
  coverDriveFileId?: string;
  coverDriveWebViewLink?: string;
  coverDriveThumbnailLink?: string;
  coverDriveMimeType?: string;
  coverDriveName?: string;
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
  constructionNoPhoto?: ConstructionNoPhotoReport;
};
