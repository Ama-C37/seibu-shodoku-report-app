import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

import type { Branch } from '../models/branch';
import { getFirebaseServices } from '../services/firebaseService';

const branchesKey = 'seibu-report-branches';
const initialTimestamp = new Date().toISOString();

const defaultBranches: Branch[] = [
  {
    branchId: 'default',
    branchName: '本社',
    address: '',
    phoneNumber: '',
    isActive: true,
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp
  }
];

// MVP local implementation. Replace this module with Firestore `branches`
// persistence without changing admin pages that call this repository.
function loadBranches() {
  const raw = localStorage.getItem(branchesKey);
  if (raw) return JSON.parse(raw) as Branch[];
  localStorage.setItem(branchesKey, JSON.stringify(defaultBranches));
  return defaultBranches;
}

function normalizeBranch(branchId: string, value: Partial<Branch>): Branch {
  const now = new Date().toISOString();
  return {
    branchId,
    branchName: value.branchName ?? '',
    address: value.address ?? '',
    phoneNumber: value.phoneNumber ?? '',
    isActive: value.isActive ?? true,
    createdAt: value.createdAt ?? now,
    updatedAt: value.updatedAt ?? now
  };
}

function sortBranches(branches: Branch[]) {
  return branches.sort((a, b) => a.branchName.localeCompare(b.branchName, 'ja'));
}

export async function findBranches() {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDocs(collection(firebase.firestore, 'branches'));
    return sortBranches(snapshot.docs.map((item) => normalizeBranch(item.id, item.data() as Partial<Branch>)));
  }

  return sortBranches(loadBranches());
}

export async function findBranch(branchId: string) {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDoc(doc(firebase.firestore, 'branches', branchId));
    return snapshot.exists() ? normalizeBranch(snapshot.id, snapshot.data() as Partial<Branch>) : null;
  }

  return loadBranches().find((branch) => branch.branchId === branchId) ?? null;
}

export async function saveBranch(branch: Branch) {
  const firebase = getFirebaseServices();
  if (firebase) {
    await setDoc(doc(firebase.firestore, 'branches', branch.branchId), branch);
    return;
  }

  const branches = loadBranches();
  const index = branches.findIndex((item) => item.branchId === branch.branchId);
  if (index >= 0) {
    branches[index] = branch;
  } else {
    branches.push(branch);
  }
  localStorage.setItem(branchesKey, JSON.stringify(branches));
}
