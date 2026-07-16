import { ChangeEvent, useState } from 'react';
import { Camera, Check, ImagePlus } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { HeaderNavButton } from '../../components/HeaderNavButton';
import { PhotoInputCard } from '../../components/PhotoInputCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { ReportPhoto } from '../../models/reportPhoto';
import { compressImage } from '../../services/imageService';
import { authorizeGoogleDrive, hasGoogleDriveAccessToken, hasGoogleDriveConfig } from '../../services/googleDriveService';
import { storeReportImage } from '../../services/imageStorageService';
import { usePhotoStore } from '../../stores/photoStore';
import { errors } from '../../utils/constants';

type LocationState = {
  backTo?: string;
  reportId?: string;
};

export function PhotoManagerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { backTo, reportId } = (location.state ?? {}) as LocationState;
  const storePhotos = usePhotoStore((store) => store.photos);
  const setStorePhotos = usePhotoStore((store) => store.setPhotos);
  const [photos, setPhotos] = useState<ReportPhoto[]>(storePhotos);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!backTo || !reportId) return <Navigate to="/home" replace />;

  const currentBackTo = backTo;
  const currentReportId = reportId;

  async function addPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage('');
    setUploading(true);
    try {
      if (hasGoogleDriveConfig() && !hasGoogleDriveAccessToken()) {
        await authorizeGoogleDrive();
      }
      const compressed = await compressImage(file);
      const photoId = crypto.randomUUID();
      const storedImage = await storeReportImage(compressed, currentReportId, 'photo', photoId);
      setPhotos((current) => [
        ...current,
        {
          photoId,
          reportId: currentReportId,
          imageUrl: storedImage.imageUrl,
          thumbnailUrl: storedImage.driveThumbnailLink,
          driveFileId: storedImage.driveFileId,
          driveWebViewLink: storedImage.driveWebViewLink,
          driveThumbnailLink: storedImage.driveThumbnailLink,
          driveMimeType: storedImage.driveMimeType,
          driveName: storedImage.driveName,
          description: '',
          sortOrder: current.length + 1,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch {
      setMessage(hasGoogleDriveConfig() ? errors.drive : errors.photo);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  function finish() {
    const sorted = photos.map((photo, index) => ({ ...photo, sortOrder: index + 1 }));
    setStorePhotos(sorted);
    navigate(currentBackTo, { state: { photos: sorted } });
  }

  return (
    <main className="app-shell">
      <header className="subpage-header row-header">
        <div>
          <h1>写真管理</h1>
          <p>{photos.length}枚</p>
        </div>
        <div className="header-actions">
          <HeaderNavButton target="home" />
          <PrimaryButton icon={<Check size={18} />} onClick={finish}>
            完了
          </PrimaryButton>
        </div>
      </header>
      {message ? <p className="alert">{message}</p> : null}
      {uploading ? <p className="hint">画像を保存しています。</p> : null}
      <section className="file-actions">
        <label className="button button-secondary">
          <Camera size={18} />
          カメラ
          <input type="file" accept="image/*" capture="environment" disabled={uploading} onChange={addPhoto} />
        </label>
        <label className="button button-secondary">
          <ImagePlus size={18} />
          ライブラリ
          <input type="file" accept="image/*" disabled={uploading} onChange={addPhoto} />
        </label>
      </section>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <PhotoInputCard
            key={photo.photoId}
            photo={photo}
            onDescriptionChange={(description) =>
              setPhotos((current) => current.map((item) => (item.photoId === photo.photoId ? { ...item, description } : item)))
            }
            onDelete={() => setPhotos((current) => current.filter((item) => item.photoId !== photo.photoId))}
          />
        ))}
      </div>
      {photos.length > 1 ? <p className="hint">並び順管理は次段階でドラッグ操作に対応します。現在は追加順でPDFに出力します。</p> : null}
    </main>
  );
}
