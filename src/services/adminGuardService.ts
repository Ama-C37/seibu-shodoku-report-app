import type { AppUser } from '../models/appUser';

export function canAccessAdmin(user: AppUser | null) {
  return Boolean(user?.isActive && user.role === 'admin');
}
