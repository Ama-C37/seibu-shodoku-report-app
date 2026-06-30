import type { AppUser } from '../models/appUser';

const currentUserKey = 'seibu-report-current-user';

export function loadCurrentUser() {
  const raw = localStorage.getItem(currentUserKey);
  return raw ? (JSON.parse(raw) as AppUser) : null;
}

export function signIn(email: string): AppUser {
  const user: AppUser = {
    userId: email || 'local-user',
    name: email ? email.split('@')[0] : '現場担当者',
    email,
    branchId: 'default',
    branchName: '本社',
    role: 'worker',
    isActive: true
  };
  localStorage.setItem(currentUserKey, JSON.stringify(user));
  return user;
}

export function continueAsGuest(): AppUser {
  const user: AppUser = {
    userId: 'guest',
    name: '未ログイン',
    email: '',
    branchId: '',
    branchName: '',
    role: 'worker',
    isActive: true
  };
  localStorage.setItem(currentUserKey, JSON.stringify(user));
  return user;
}

export function signOut() {
  localStorage.removeItem(currentUserKey);
}
