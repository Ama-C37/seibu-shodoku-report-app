export type ReportPhoto = {
  photoId: string;
  reportId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description: string;
  sortOrder: number;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};
