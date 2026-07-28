import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

import type { AppUser } from '../models/appUser';
import { getFirebaseServices } from '../services/firebaseService';
import { findUser, findUserByEmail } from './userRepository';

const currentUserKey = 'seibu-report-current-user';
const inactiveUserMessage = 'This user is inactive.';
const allowPasswordlessLogin = import.meta.env.VITE_ALLOW_PASSWORDLESS_LOGIN === 'true';

// MVP local implementation. Replace this module with Firebase Authentication
// session handling when the production auth flow is introduced.
export function loadCurrentUser() {
  const raw = localStorage.getItem(currentUserKey);
  return raw ? (JSON.parse(raw) as AppUser) : null;
}

function buildLocalUser(email: string): AppUser {
  const normalizedEmail = email.trim();
  const isAdmin = normalizedEmail.toLowerCase().includes('admin');
  const now = new Date().toISOString();
  return {
    userId: normalizedEmail || 'local-user',
    name: isAdmin ? '管理者' : '現場担当者',
    email: normalizedEmail,
    branchId: 'default',
    branchName: '本社',
    role: isAdmin ? 'admin' : 'worker',
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

function persistCurrentUser(user: AppUser) {
  localStorage.setItem(currentUserKey, JSON.stringify(user));
  return user;
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  const normalizedEmail = email.trim();
  const firebase = getFirebaseServices();

  if (allowPasswordlessLogin) {
    const registeredUser = await findUserByEmail(normalizedEmail);
    if (!registeredUser) throw new Error('User is not registered.');
    if (!registeredUser.isActive) throw new Error(inactiveUserMessage);
    return persistCurrentUser(registeredUser);
  }

  if (firebase) {
    const credential = await signInWithEmailAndPassword(firebase.auth, normalizedEmail, password);
    const registeredUser = await findUser(credential.user.uid) ?? await findUserByEmail(normalizedEmail);
    if (registeredUser) {
      if (!registeredUser.isActive) {
        await firebaseSignOut(firebase.auth);
        throw new Error(inactiveUserMessage);
      }
      return persistCurrentUser(registeredUser);
    }

    await firebaseSignOut(firebase.auth);
    throw new Error('User is not registered.');
  }

  const registeredUser = await findUserByEmail(normalizedEmail);
  if (registeredUser) {
    if (!registeredUser.isActive) throw new Error(inactiveUserMessage);
    return persistCurrentUser(registeredUser);
  }

  const user = buildLocalUser(normalizedEmail);
  persistCurrentUser(user);
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
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(currentUserKey, JSON.stringify(user));
  return user;
}

export async function signOut() {
  const firebase = getFirebaseServices();
  if (firebase) await firebaseSignOut(firebase.auth);
  localStorage.removeItem(currentUserKey);
}

export function updateCurrentUser(user: AppUser) {
  const currentUser = loadCurrentUser();
  if (!currentUser) return;
  if (currentUser.userId !== user.userId && currentUser.email !== user.email) return;
  localStorage.setItem(currentUserKey, JSON.stringify(user));
}
