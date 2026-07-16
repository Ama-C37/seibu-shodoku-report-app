import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';

function readEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const raw = fs.readFileSync(envPath, 'utf8');
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        const key = line.slice(0, index);
        const value = line.slice(index + 1).replace(/^["']|["']$/g, '');
        return [key, value];
      })
  );
}

function userIdFromEmail(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const env = readEnv();
const app = getApps()[0] ?? initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
});
const firestore = getFirestore(app);
const now = new Date().toISOString();

const branchIdByName = {
  '城東支店': 'joto',
  '東京支店': 'tokyo',
  '熊谷支店': 'kumagaya'
};

const requestedUsers = [
  {
    name: '杉山豊',
    email: 'j-sugiyama@seibu-s.co.jp',
    branchName: '城東支店',
    role: 'branch_manager'
  },
  {
    name: '千島宏来',
    email: 'h-chishima@seibu-s.co.jp',
    branchName: '東京支店',
    role: 'branch_manager'
  },
  {
    name: '剱地正司',
    email: 's-tsurugichi@seibu-s.co.jp',
    branchName: '東京支店',
    role: 'worker'
  },
  {
    name: '福地亮介',
    email: 'r-fukuchi@seibu-s.co.jp',
    branchName: '熊谷支店',
    role: 'branch_manager'
  },
  {
    name: '齊藤晋也',
    email: 's-saito@seibu-s.co.jp',
    branchName: '熊谷支店',
    role: 'worker'
  }
];

const branchSnapshot = await getDocs(collection(firestore, 'branches'));
const existingBranches = new Map(branchSnapshot.docs.map((item) => [item.id, item.data()]));

for (const [branchName, branchId] of Object.entries(branchIdByName)) {
  const existing = existingBranches.get(branchId);
  await setDoc(
    doc(firestore, 'branches', branchId),
    {
      branchId,
      branchName,
      address: existing?.address ?? '',
      phoneNumber: existing?.phoneNumber ?? '',
      isActive: existing?.isActive ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    },
    { merge: true }
  );
}

for (const user of requestedUsers) {
  const branchId = branchIdByName[user.branchName];
  const userId = userIdFromEmail(user.email);
  await setDoc(
    doc(firestore, 'users', userId),
    {
      userId,
      name: user.name,
      email: user.email.trim().toLowerCase(),
      branchId,
      branchName: user.branchName,
      role: user.role,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    { merge: true }
  );
  console.log(`${user.name} / ${user.email} / ${user.branchName} / ${user.role}`);
}
