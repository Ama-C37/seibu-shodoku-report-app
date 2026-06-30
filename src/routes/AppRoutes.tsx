import { Navigate, Route, Routes } from 'react-router-dom';

import { AiCorrectionPage } from '../pages/ai-correction/AiCorrectionPage';
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/login/LoginPage';
import { PdfPreviewPage } from '../pages/pdf-preview/PdfPreviewPage';
import { PhotoManagerPage } from '../pages/photo-manager/PhotoManagerPage';
import { PhotoTypePage } from '../pages/photo-type/PhotoTypePage';
import { ReportDetailPage } from '../pages/report-detail/ReportDetailPage';
import { ReportFormPage } from '../pages/report-form/ReportFormPage';
import { ReportListPage } from '../pages/report-list/ReportListPage';
import { ReportTypePage } from '../pages/report-type/ReportTypePage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { SplashPage } from '../pages/splash/SplashPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/report-type" element={<ReportTypePage />} />
      <Route path="/photo-type/:reportType" element={<PhotoTypePage />} />
      <Route path="/report-form/:reportType/:photoType" element={<ReportFormPage />} />
      <Route path="/report-form/:reportId/edit" element={<ReportFormPage />} />
      <Route path="/photo-manager" element={<PhotoManagerPage />} />
      <Route path="/ai-correction" element={<AiCorrectionPage />} />
      <Route path="/pdf-preview/:reportId" element={<PdfPreviewPage />} />
      <Route path="/report-list/:status" element={<ReportListPage />} />
      <Route path="/report-detail/:reportId" element={<ReportDetailPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
