import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

import type { Report, ReportStatus } from '../models/report';
import { getFirebaseServices } from '../services/firebaseService';

const reportsKey = 'seibu-report-reports';

// MVP local implementation. Replace this module with Firestore `reports`
// persistence without changing report pages/stores that call this repository.
function loadReports() {
  const raw = localStorage.getItem(reportsKey);
  return raw ? (JSON.parse(raw) as Report[]) : [];
}

function normalizeReport(reportId: string, value: Partial<Report>): Report {
  const now = new Date().toISOString();
  return {
    reportId,
    reportType: value.reportType ?? 'investigation',
    photoType: value.photoType ?? 'without_photo',
    title: value.title ?? '',
    workDate: value.workDate ?? '',
    locationName: value.locationName ?? '',
    address: value.address ?? '',
    coverImageUrl: value.coverImageUrl,
    coverDriveFileId: value.coverDriveFileId,
    coverDriveWebViewLink: value.coverDriveWebViewLink,
    coverDriveThumbnailLink: value.coverDriveThumbnailLink,
    coverDriveMimeType: value.coverDriveMimeType,
    coverDriveName: value.coverDriveName,
    latitude: value.latitude,
    longitude: value.longitude,
    reporterId: value.reporterId ?? '',
    reporterName: value.reporterName ?? '',
    branchId: value.branchId ?? '',
    branchName: value.branchName ?? '',
    content: value.content ?? '',
    correctedContent: value.correctedContent ?? '',
    remarks: value.remarks ?? '',
    status: value.status ?? 'draft',
    pdfUrl: value.pdfUrl,
    createdAt: value.createdAt ?? now,
    updatedAt: value.updatedAt ?? now,
    submittedAt: value.submittedAt,
    photos: value.photos ?? [],
    constructionNoPhoto: value.constructionNoPhoto
  };
}

function sortReports(reports: Report[]) {
  return reports.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefinedValues(item)])
    ) as T;
  }
  return value;
}

export async function findReports() {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDocs(collection(firebase.firestore, 'reports'));
    return sortReports(snapshot.docs.map((item) => normalizeReport(item.id, item.data() as Partial<Report>)));
  }

  return sortReports(loadReports());
}

export async function findReport(reportId: string) {
  const firebase = getFirebaseServices();
  if (firebase) {
    const snapshot = await getDoc(doc(firebase.firestore, 'reports', reportId));
    return snapshot.exists() ? normalizeReport(snapshot.id, snapshot.data() as Partial<Report>) : null;
  }

  return loadReports().find((report) => report.reportId === reportId) ?? null;
}

export async function findReportsByStatus(status: ReportStatus) {
  const firebase = getFirebaseServices();
  if (firebase) {
    const reportsQuery = query(collection(firebase.firestore, 'reports'), where('status', '==', status));
    const snapshot = await getDocs(reportsQuery);
    return sortReports(snapshot.docs.map((item) => normalizeReport(item.id, item.data() as Partial<Report>)));
  }

  return sortReports(loadReports().filter((report) => report.status === status));
}

export async function saveReport(report: Report) {
  const firebase = getFirebaseServices();
  if (firebase) {
    await setDoc(doc(firebase.firestore, 'reports', report.reportId), removeUndefinedValues(report));
    return;
  }

  const reports = loadReports();
  const index = reports.findIndex((item) => item.reportId === report.reportId);
  if (index >= 0) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  localStorage.setItem(reportsKey, JSON.stringify(reports));
}
