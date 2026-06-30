import type { PhotoType, ReportStatus, ReportType } from '../models/report';

export const appName = '西武消毒 報告書';

export const errors = {
  gps: '現在地を取得できませんでした。位置情報の許可設定を確認してください。',
  photo: '写真を取得できませんでした。もう一度お試しください。',
  ai: 'AI添削に失敗しました。通信環境を確認してください。',
  pdf: 'PDFの作成に失敗しました。入力内容を確認してください。',
  save: '保存に失敗しました。通信環境を確認してください。'
};

export function reportTypeLabel(value: ReportType) {
  return value === 'construction' ? '施工報告書' : '調査報告書';
}

export function photoTypeLabel(value: PhotoType) {
  return value === 'with_photo' ? '写真付き' : '写真なし';
}

export function reportStatusLabel(value: ReportStatus) {
  return value === 'submitted' ? '提出済み' : '下書き';
}
