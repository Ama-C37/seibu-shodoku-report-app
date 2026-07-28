import type { AppUser } from '../models/appUser';
import type { Report } from '../models/report';
import { findUser } from '../repositories/userRepository';

export async function canEditReport(user: AppUser | null, report: Report) {
  if (!user || !user.isActive) return false;
  if (user.role === 'admin') return true;

  const reporter = await findUser(report.reporterId);
  if (reporter?.isActive === false) {
    return user.role === 'branch_manager' && user.branchId === report.branchId;
  }

  return true;
}
