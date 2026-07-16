import type { AppUser } from '../models/appUser';
import { getFirebaseServices } from '../services/firebaseService';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

const usersKey = 'seibu-report-users';
const initialTimestamp = new Date().toISOString();

const defaultUsers: AppUser[] = [
  {
    userId: 'admin',
    name: '管理者',
    email: 'admin@example.com',
    branchId: 'default',
    branchName: '本社',
    role: 'admin',
    isActive: true,
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp
  }
];

function normalizeRole(value: Partial<AppUser>['role']): AppUser['role'] {
  if (value === 'admin' || value === 'branch_manager') return value;
  return 'worker';
}

// MVP local implementation. Replace this module with Firestore `users`
// persistence without changing admin pages that call this repository.
function loadUsers() {
  const raw = localStorage.getItem(usersKey);
  if (raw) return JSON.parse(raw) as AppUser[];
  localStorage.setItem(usersKey, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function normalizeUser(userId: string, value: Partial<AppUser>): AppUser {
  const now = new Date().toISOString();
  return {
    userId,
    name: value.name ?? '',
    email: value.email ?? '',
    branchId: value.branchId ?? '',
    branchName: value.branchName ?? '',
    role: normalizeRole(value.role),
    isActive: value.isActive ?? true,
    createdAt: value.createdAt ?? now,
    updatedAt: value.updatedAt ?? now
  };
}

function sortUsers(users: AppUser[]) {
  return users.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

export async function findUsers() {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDocs(collection(firebase.firestore, 'users'));
    return sortUsers(snapshot.docs.map((item) => normalizeUser(item.id, item.data() as Partial<AppUser>)));
  }

  return sortUsers(loadUsers());
}

export async function findUser(userId: string) {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDoc(doc(firebase.firestore, 'users', userId));
    return snapshot.exists() ? normalizeUser(snapshot.id, snapshot.data() as Partial<AppUser>) : null;
  }

  return loadUsers().find((user) => user.userId === userId) ?? null;
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const firebase = getFirebaseServices();
  if (firebase) {
    const usersQuery = query(collection(firebase.firestore, 'users'), where('email', '==', normalizedEmail));
    const snapshot = await getDocs(usersQuery);
    const found = snapshot.docs[0];
    return found ? normalizeUser(found.id, found.data() as Partial<AppUser>) : null;
  }

  return loadUsers().find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function findBranchManagerByBranchId(branchId: string) {
  if (!branchId) return null;
  const firebase = getFirebaseServices();
  if (firebase) {
    const usersQuery = query(
      collection(firebase.firestore, 'users'),
      where('branchId', '==', branchId),
      where('role', '==', 'branch_manager'),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(usersQuery);
    const found = snapshot.docs[0];
    return found ? normalizeUser(found.id, found.data() as Partial<AppUser>) : null;
  }

  return loadUsers().find((user) => user.branchId === branchId && user.role === 'branch_manager' && user.isActive) ?? null;
}

export async function saveUser(user: AppUser) {
  const firebase = getFirebaseServices();
  if (firebase) {
    await setDoc(doc(firebase.firestore, 'users', user.userId), user);
    return;
  }

  const now = new Date().toISOString();
  const users = loadUsers();
  const index = users.findIndex((item) => item.userId === user.userId);
  const value = {
    ...user,
    createdAt: user.createdAt ?? users[index]?.createdAt ?? now,
    updatedAt: now
  };
  if (index >= 0) {
    users[index] = value;
  } else {
    users.push(value);
  }
  localStorage.setItem(usersKey, JSON.stringify(users));
}

export function findUsersLocal() {
  return loadUsers().sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

export function findUserLocal(userId: string) {
  return findUsersLocal().find((user) => user.userId === userId) ?? null;
}
