import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

function readEnv() {
  const raw = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, '')];
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

const branchIds = ['joto', 'tokyo', 'kumagaya'];
const emails = [
  'j-sugiyama@seibu-s.co.jp',
  'h-chishima@seibu-s.co.jp',
  's-tsurugichi@seibu-s.co.jp',
  'r-fukuchi@seibu-s.co.jp',
  's-saito@seibu-s.co.jp'
];

for (const branchId of branchIds) {
  const snapshot = await getDoc(doc(firestore, 'branches', branchId));
  console.log(`branch/${branchId}: ${snapshot.exists() ? snapshot.data().branchName : 'missing'}`);
}

for (const email of emails) {
  const userId = userIdFromEmail(email);
  const snapshot = await getDoc(doc(firestore, 'users', userId));
  if (!snapshot.exists()) {
    console.log(`user/${userId}: missing`);
    continue;
  }
  const user = snapshot.data();
  console.log(`user/${userId}: ${user.name} / ${user.email} / ${user.branchName} / ${user.role} / active=${user.isActive}`);
}
