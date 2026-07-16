import { fileToDataUrl } from './imageService';
import { hasGoogleDriveConfig, uploadReportImageToDrive } from './googleDriveService';

export type StoredImage = {
  imageUrl: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveThumbnailLink?: string;
  driveMimeType?: string;
  driveName?: string;
};

function driveImageUrl(fileId: string) {
  return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`;
}

export async function storeReportImage(file: File, reportId: string, kind: 'cover' | 'photo', photoId?: string): Promise<StoredImage> {
  if (!hasGoogleDriveConfig()) {
    return { imageUrl: await fileToDataUrl(file) };
  }

  const driveFile = await uploadReportImageToDrive(file, reportId, kind, photoId);
  return {
    imageUrl: driveFile.thumbnailLink ?? driveImageUrl(driveFile.id),
    driveFileId: driveFile.id,
    driveWebViewLink: driveFile.webViewLink,
    driveThumbnailLink: driveFile.thumbnailLink,
    driveMimeType: driveFile.mimeType,
    driveName: driveFile.name
  };
}
