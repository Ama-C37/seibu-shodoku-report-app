import type { PhotoType } from '../models/report';
import type { ReportPhoto } from '../models/reportPhoto';

export type ReportFormValues = {
  title: string;
  workDate: string;
  locationName: string;
  reporterName: string;
  content: string;
  remarks: string;
  photoType: PhotoType;
  photos: ReportPhoto[];
};

export function validateReport(values: ReportFormValues) {
  const messages: string[] = [];
  if (!values.title.trim()) messages.push('報告書タイトルを入力してください。');
  if (values.title.length > 100) messages.push('報告書タイトルは100文字以内で入力してください。');
  if (!values.workDate) messages.push('作業日を入力してください。');
  if (!values.locationName.trim()) messages.push('作業場所を入力してください。');
  if (!values.reporterName.trim()) messages.push('報告者名を入力してください。');
  if (!values.content.trim()) messages.push('報告内容を入力してください。');
  if (values.content.length > 3000) messages.push('報告内容は3000文字以内で入力してください。');
  if (values.remarks.length > 1000) messages.push('備考は1000文字以内で入力してください。');
  if (values.photoType === 'with_photo' && values.photos.length === 0) {
    messages.push('写真付き報告書は写真を1枚以上追加してください。');
  }
  return messages;
}
