export type ReportPhoto = {
  photoId: string;
  reportId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveThumbnailLink?: string;
  driveMimeType?: string;
  driveName?: string;
  description: string;
  sortOrder: number;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};
