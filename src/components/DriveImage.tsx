import { ImgHTMLAttributes, useEffect, useState } from 'react';

import { getGoogleDriveFileObjectUrl } from '../services/googleDriveService';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  driveFileId?: string;
  fallbackSrc?: string;
};

export function DriveImage({ driveFileId, fallbackSrc, src, alt, ...props }: Props) {
  const fallback = fallbackSrc ?? src ?? '';
  const [resolvedSrc, setResolvedSrc] = useState(fallback);

  useEffect(() => {
    let active = true;
    setResolvedSrc(fallback);

    if (!driveFileId) return () => {
      active = false;
    };

    getGoogleDriveFileObjectUrl(driveFileId)
      .then((objectUrl) => {
        if (active) setResolvedSrc(objectUrl);
      })
      .catch(() => {
        if (active) setResolvedSrc(fallback);
      });

    return () => {
      active = false;
    };
  }, [driveFileId, fallback]);

  return <img {...props} src={resolvedSrc} alt={alt} />;
}
