import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminBranchFormPage } from '../pages/admin/AdminBranchFormPage';
import { AdminBranchesPage } from '../pages/admin/AdminBranchesPage';
import { AdminHomePage } from '../pages/admin/AdminHomePage';
import { AdminTreatmentMastersPage } from '../pages/admin/AdminTreatmentMastersPage';
import { AdminUserFormPage } from '../pages/admin/AdminUserFormPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { canAccessAdmin } from '../services/adminGuardService';
import { useAuthStore } from '../stores/authStore';

export function AdminRoutes() {
  const user = useAuthStore((state) => state.user);

  if (!canAccessAdmin(user)) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route index element={<AdminHomePage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="users/new" element={<AdminUserFormPage />} />
      <Route path="users/:userId/edit" element={<AdminUserFormPage />} />
      <Route path="branches" element={<AdminBranchesPage />} />
      <Route path="branches/new" element={<AdminBranchFormPage />} />
      <Route path="branches/:branchId/edit" element={<AdminBranchFormPage />} />
      <Route path="treatment-masters" element={<AdminTreatmentMastersPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
