import { Trash2 } from 'lucide-react';

import { DriveImage } from './DriveImage';
import type { ReportPhoto } from '../models/reportPhoto';

type Props = {
  photo: ReportPhoto;
  onDescriptionChange: (description: string) => void;
  onDelete: () => void;
};

export function PhotoInputCard({ photo, onDescriptionChange, onDelete }: Props) {
  return (
    <article className="photo-card">
      <DriveImage driveFileId={photo.driveFileId} fallbackSrc={photo.imageUrl} alt={photo.description || '報告書写真'} />
      <label>
        写真説明
        <input value={photo.description} onChange={(event) => onDescriptionChange(event.target.value)} />
      </label>
      <button className="text-button danger" type="button" onClick={onDelete}>
        <Trash2 size={16} />
        削除
      </button>
    </article>
  );
}
