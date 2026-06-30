import { create } from 'zustand';

import type { ReportPhoto } from '../models/reportPhoto';

type PhotoState = {
  photos: ReportPhoto[];
  setPhotos: (photos: ReportPhoto[]) => void;
  clear: () => void;
};

export const usePhotoStore = create<PhotoState>((set) => ({
  photos: [],
  setPhotos: (photos) => set({ photos }),
  clear: () => set({ photos: [] })
}));
