import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps } from 'firebase/app';
import { collection, getDocs, getFirestore, terminate } from 'firebase/firestore';

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

function compact(value, fallback = '-') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function unique(items) {
  return Array.from(new Set(items));
}

function validateConstructionNoPhoto(report) {
  const issues = [];
  const details = [];
  const construction = report.constructionNoPhoto;

  if (!construction) {
    issues.push('constructionNoPhoto missing');
    return { issues, details };
  }

  const requiredFields = [
    'copyType',
    'addressee',
    'honorific',
    'reportCreatedDate',
    'managementResponsibleName',
    'workResponsibleName',
    'workStartTime',
    'workEndTime',
    'workSummary'
  ];

  for (const field of requiredFields) {
    if (!construction[field]) issues.push(`constructionNoPhoto.${field} empty`);
  }

  const treatmentRows = Array.isArray(construction.treatmentRows) ? construction.treatmentRows : [];
  if (treatmentRows.length === 0) {
    issues.push('treatmentRows empty');
  }

  treatmentRows.forEach((row, index) => {
    if (!row.rowId) issues.push(`treatmentRows[${index}].rowId empty`);
    if (!row.pestName) issues.push(`treatmentRows[${index}].pestName empty`);
    if (!row.chemicalName) issues.push(`treatmentRows[${index}].chemicalName empty`);
    if (!row.treatmentMethodName) issues.push(`treatmentRows[${index}].treatmentMethodName empty`);
  });

  const pestActivityRows = Array.isArray(construction.pestActivityRows) ? construction.pestActivityRows : [];
  const treatmentPests = unique(treatmentRows.map((row) => row.pestName).filter(Boolean));
  const activityPests = pestActivityRows.map((row) => row.pestName).filter(Boolean);
  const duplicatedActivityPests = activityPests.filter((pestName, index) => activityPests.indexOf(pestName) !== index);

  if (activityPests.length === 0 && treatmentPests.length > 0) {
    issues.push('pestActivityRows empty');
  }

  if (duplicatedActivityPests.length > 0) {
    issues.push(`pestActivityRows duplicated: ${unique(duplicatedActivityPests).join(', ')}`);
  }

  for (const pestName of treatmentPests) {
    if (!activityPests.includes(pestName)) {
      issues.push(`pestActivityRows missing treatment pest: ${pestName}`);
    }
  }

  details.push(`管理責任者=${compact(construction.managementResponsibleName)}`);
  details.push(`作業責任者=${compact(construction.workResponsibleName)}`);
  details.push(`施工内容=${treatmentRows.length}件`);
  details.push(`施工対象=${treatmentPests.join(', ') || '-'}`);
  details.push(`生息状況=${activityPests.join(', ') || '-'}`);

  return { issues, details };
}

function validateReport(docId, report) {
  const issues = [];
  const details = [];

  if (docId !== report.reportId) issues.push(`doc id and reportId mismatch: ${report.reportId}`);
  if (!report.reportType) issues.push('reportType empty');
  if (!report.photoType) issues.push('photoType empty');
  if (!report.title) issues.push('title empty');
  if (!report.workDate) issues.push('workDate empty');
  if (!report.locationName) issues.push('locationName empty');
  if (!report.reporterId) issues.push('reporterId empty');
  if (!report.reporterName) issues.push('reporterName empty');
  if (!report.branchId) issues.push('branchId empty');
  if (!report.branchName) issues.push('branchName empty');
  if (!report.status) issues.push('status empty');
  if (!report.createdAt) issues.push('createdAt empty');
  if (!report.updatedAt) issues.push('updatedAt empty');
  if (!Array.isArray(report.photos)) issues.push('photos is not array');

  const photos = Array.isArray(report.photos) ? report.photos : [];
  if (report.photoType === 'with_photo') {
    if (report.coverImageUrl && !report.coverDriveFileId) {
      issues.push('coverImageUrl exists but coverDriveFileId empty');
    }
    photos.forEach((photo, index) => {
      if (!photo.photoId) issues.push(`photos[${index}].photoId empty`);
      if (!photo.imageUrl) issues.push(`photos[${index}].imageUrl empty`);
      if (!photo.driveFileId) issues.push(`photos[${index}].driveFileId empty`);
      if (photo.reportId !== report.reportId) issues.push(`photos[${index}].reportId mismatch`);
    });
    details.push(`Drive表紙=${compact(report.coverDriveFileId)}`);
    details.push(`写真=${photos.length}枚`);
  }

  if (report.reportType === 'construction' && report.photoType === 'without_photo') {
    const result = validateConstructionNoPhoto(report);
    issues.push(...result.issues);
    details.push(...result.details);
  }

  return { issues, details };
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

const snapshot = await getDocs(collection(firestore, 'reports'));
const reports = snapshot.docs
  .map((item) => ({ id: item.id, data: item.data() }))
  .sort((a, b) => compact(b.data.updatedAt, '').localeCompare(compact(a.data.updatedAt, '')));

console.log(`reports total: ${reports.length}`);

let issueCount = 0;
for (const { id, data } of reports) {
  const result = validateReport(id, data);
  issueCount += result.issues.length;
  console.log('');
  console.log(`report/${id}`);
  console.log(`  種別=${compact(data.reportType)} / 写真=${compact(data.photoType)} / 状態=${compact(data.status)}`);
  console.log(`  タイトル=${compact(data.title)} / 更新=${compact(data.updatedAt)}`);
  console.log(`  作成者=${compact(data.reporterName)} / 支店=${compact(data.branchName)} / 場所=${compact(data.locationName)}`);
  for (const detail of result.details) console.log(`  ${detail}`);
  if (result.issues.length === 0) {
    console.log('  CHECK=OK');
  } else {
    for (const issue of result.issues) console.log(`  ISSUE=${issue}`);
  }
}

console.log('');
console.log(`summary: reports=${reports.length}, issues=${issueCount}`);
await terminate(firestore);
if (issueCount > 0) process.exitCode = 1;
