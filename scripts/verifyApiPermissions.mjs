import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  setDoc,
  terminate,
  where
} from 'firebase/firestore';

function readEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const raw = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const fileEnv = Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, '')];
      })
  );
  return { ...fileEnv, ...process.env };
}

const env = readEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const requiredFirebaseKeys = Object.entries(firebaseConfig).filter(([, value]) => !value);
if (requiredFirebaseKeys.length > 0) {
  console.error(`Missing Firebase config: ${requiredFirebaseKeys.map(([key]) => key).join(', ')}`);
  process.exit(1);
}

const roles = [
  {
    key: 'ADMIN',
    label: '管理者',
    required: true,
    expected: {
      readUsers: true,
      readBranches: true,
      readReports: true,
      writeUser: true,
      writeBranch: true,
      writeReport: true
    }
  },
  {
    key: 'BRANCH_MANAGER',
    label: '支店長',
    required: true,
    expected: {
      readUsers: false,
      readBranches: true,
      readReports: true,
      writeUser: false,
      writeBranch: false,
      writeReport: true
    }
  },
  {
    key: 'WORKER',
    label: '現場担当者',
    required: true,
    expected: {
      readUsers: false,
      readBranches: true,
      readReports: true,
      writeUser: false,
      writeBranch: false,
      writeReport: true
    }
  },
  {
    key: 'INACTIVE',
    label: '無効ユーザー',
    required: false,
    expected: {
      readUsers: false,
      readBranches: false,
      readReports: false,
      writeUser: false,
      writeBranch: false,
      writeReport: false
    }
  }
];

const unauthenticatedRole = {
  key: 'UNAUTHENTICATED',
  label: '未ログイン',
  expected: {
    readUsers: false,
    readBranches: false,
    readReports: false,
    writeUser: false,
    writeBranch: false,
    writeReport: false
  }
};

function credentialsFor(role) {
  return {
    email: env[`PERMISSION_TEST_${role.key}_EMAIL`],
    password: env[`PERMISSION_TEST_${role.key}_PASSWORD`]
  };
}

async function attempt(label, run) {
  try {
    await run();
    return { label, allowed: true };
  } catch (error) {
    return {
      label,
      allowed: false,
      errorCode: error?.code ?? error?.name ?? 'unknown',
      errorMessage: error?.message ?? String(error)
    };
  }
}

async function currentAppUser(auth, firestore) {
  if (!auth.currentUser) return null;
  const snapshot = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
  return snapshot.exists() ? snapshot.data() : null;
}

async function runChecks(auth, firestore, role) {
  const testId = `permission-check-${role.key.toLowerCase()}-${Date.now()}`;
  const appUser = await currentAppUser(auth, firestore);
  const reporterId = auth.currentUser?.uid ?? testId;
  const branchId = appUser?.branchId ?? 'permission-check';
  const branchName = appUser?.branchName ?? 'Permission Check';
  const testUserRef = doc(firestore, 'users', testId);
  const testBranchRef = doc(firestore, 'branches', testId);
  const testReportRef = doc(firestore, 'reports', testId);

  const checks = {
    readUsers: await attempt('users一覧取得', () => getDocs(query(collection(firestore, 'users'), limit(1)))),
    readBranches: await attempt('branches一覧取得', () => getDocs(query(collection(firestore, 'branches'), limit(1)))),
    readReports: await attempt('reports一覧取得', () => {
      const constraints = [limit(1)];
      if (role.key === 'BRANCH_MANAGER' && appUser?.branchId) constraints.unshift(where('branchId', '==', appUser.branchId));
      if (role.key === 'WORKER' && auth.currentUser?.uid) constraints.unshift(where('reporterId', '==', auth.currentUser.uid));
      return getDocs(query(collection(firestore, 'reports'), ...constraints));
    }),
    writeUser: await attempt('users書き込み', () =>
      setDoc(testUserRef, {
        userId: testId,
        name: 'Permission Check',
        email: `${testId}@example.invalid`,
        branchId: 'permission-check',
        branchName: 'Permission Check',
        role: 'worker',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    ),
    writeBranch: await attempt('branches書き込み', () =>
      setDoc(testBranchRef, {
        branchId: testId,
        branchName: 'Permission Check',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    ),
    writeReport: await attempt('reports書き込み', () =>
      setDoc(testReportRef, {
        reportId: testId,
        reportType: 'investigation',
        photoType: 'without_photo',
        title: 'Permission Check',
        workDate: new Date().toISOString().slice(0, 10),
        locationName: 'Permission Check',
        reporterId,
        reporterName: 'Permission Check',
        branchId,
        branchName,
        content: '',
        correctedContent: '',
        remarks: '',
        status: 'draft',
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    )
  };

  await Promise.allSettled([deleteDoc(testUserRef), deleteDoc(testBranchRef), deleteDoc(testReportRef)]);
  return checks;
}

function printRoleResult(role, checks) {
  console.log(`\n${role.label}`);
  let failed = 0;
  for (const [key, result] of Object.entries(checks)) {
    const expected = role.expected[key];
    const ok = result.allowed === expected;
    if (!ok) failed += 1;
    const status = result.allowed ? '許可' : '拒否';
    const expectedStatus = expected ? '許可' : '拒否';
    const detail = result.allowed ? '' : ` (${result.errorCode})`;
    console.log(`  ${ok ? 'OK' : 'NG'} ${result.label}: ${status}${detail} / 期待=${expectedStatus}`);
  }
  return failed;
}

const app = getApps()[0] ?? initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

let failures = 0;
let skipped = 0;

await signOut(auth).catch(() => undefined);
failures += printRoleResult(unauthenticatedRole, await runChecks(auth, firestore, unauthenticatedRole));

for (const role of roles) {
  const credentials = credentialsFor(role);
  if (!credentials.email || !credentials.password) {
    skipped += 1;
    const message = `PERMISSION_TEST_${role.key}_EMAIL/PASSWORD`;
    if (role.required) {
      console.log(`\n${role.label}`);
      console.log(`  NG テストユーザー未設定: ${message}`);
      failures += 1;
    } else {
      console.log(`\n${role.label}`);
      console.log(`  SKIP テストユーザー未設定: ${message}`);
    }
    continue;
  }

  const signInResult = await attempt('ログイン', () => signInWithEmailAndPassword(auth, credentials.email, credentials.password));
  if (!signInResult.allowed) {
    console.log(`\n${role.label}`);
    const expectedInactive = role.key === 'INACTIVE';
    const ok = expectedInactive;
    console.log(`  ${ok ? 'OK' : 'NG'} ログイン: 拒否 (${signInResult.errorCode}) / 期待=${expectedInactive ? '拒否' : '許可'}`);
    if (!ok) failures += 1;
    continue;
  }

  const checks = await runChecks(auth, firestore, role);
  failures += printRoleResult(role, checks);
  await signOut(auth).catch(() => undefined);
}

await terminate(firestore).catch(() => undefined);
await deleteApp(app).catch(() => undefined);

console.log(`\nsummary: failures=${failures}, skipped=${skipped}`);
if (failures > 0) process.exitCode = 1;
