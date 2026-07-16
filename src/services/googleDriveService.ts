const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const driveScope = 'https://www.googleapis.com/auth/drive.file';
const driveApiBase = 'https://www.googleapis.com/drive/v3';
const driveUploadBase = 'https://www.googleapis.com/upload/drive/v3';
const rootFolderName = 'Seibu Report App';

type DriveFile = {
  id: string;
  name?: string;
  mimeType?: string;
  webViewLink?: string;
  thumbnailLink?: string;
};

let accessToken = '';
let tokenClient: GoogleTokenClient | null = null;
let gisScriptPromise: Promise<void> | null = null;
const folderCache = new Map<string, DriveFile>();
const objectUrlCache = new Map<string, string>();

export function hasGoogleDriveConfig() {
  return typeof googleClientId === 'string' && googleClientId.length > 0;
}

export function hasGoogleDriveAccessToken() {
  return accessToken.length > 0;
}

export function getGoogleDriveScope() {
  return driveScope;
}

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Identity Services could not be loaded.'));
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

async function getAccessToken() {
  if (!hasGoogleDriveConfig()) throw new Error('Google Drive client ID is not configured.');
  if (accessToken) return accessToken;
  const clientId = googleClientId as string;

  await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
      client_id: clientId,
      scope: driveScope,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error ?? 'Google Drive authorization failed.'));
          return;
        }
        accessToken = response.access_token;
        resolve(accessToken);
      }
    }) ?? null;

    if (!tokenClient) {
      reject(new Error('Google token client could not be initialized.'));
      return;
    }

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function authorizeGoogleDrive() {
  await getAccessToken();
}

async function driveFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });

  if (!response.ok && response.status === 401) {
    accessToken = '';
  }
  if (!response.ok) throw new Error(`Google Drive request failed: ${response.status}`);
  return response;
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function findFolder(name: string, parentId?: string) {
  const conditions = [
    `name = '${escapeDriveQueryValue(name)}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    'trashed = false'
  ];
  if (parentId) conditions.push(`'${parentId}' in parents`);

  const params = new URLSearchParams({
    q: conditions.join(' and '),
    fields: 'files(id,name,mimeType)',
    spaces: 'drive'
  });
  const response = await driveFetch(`${driveApiBase}/files?${params.toString()}`);
  const data = (await response.json()) as { files?: DriveFile[] };
  return data.files?.[0] ?? null;
}

async function createFolder(name: string, parentId?: string) {
  const response = await driveFetch(`${driveApiBase}/files?fields=id,name,mimeType,webViewLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    })
  });
  return (await response.json()) as DriveFile;
}

async function ensureFolder(name: string, parentId?: string) {
  const cacheKey = `${parentId ?? 'root'}:${name}`;
  const cached = folderCache.get(cacheKey);
  if (cached) return cached;

  const folder = (await findFolder(name, parentId)) ?? (await createFolder(name, parentId));
  folderCache.set(cacheKey, folder);
  return folder;
}

async function getReportFolder(reportId: string) {
  const root = await ensureFolder(rootFolderName);
  const reports = await ensureFolder('reports', root.id);
  return ensureFolder(reportId, reports.id);
}

export async function prepareGoogleDriveReportFolder(reportId: string) {
  return getReportFolder(reportId);
}

async function getPhotosFolder(reportId: string) {
  const reportFolder = await getReportFolder(reportId);
  return ensureFolder('photos', reportFolder.id);
}

function buildMultipartBody(metadata: Record<string, unknown>, file: File) {
  const boundary = `seibu-report-${crypto.randomUUID()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const body = new Blob(
    [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      JSON.stringify(metadata),
      delimiter,
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
      file,
      closeDelimiter
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  return { body, contentType: `multipart/related; boundary=${boundary}` };
}

export async function uploadReportImageToDrive(file: File, reportId: string, kind: 'cover' | 'photo', photoId?: string) {
  const parent = kind === 'cover' ? await getReportFolder(reportId) : await getPhotosFolder(reportId);
  const extension = file.name.split('.').pop() || 'jpg';
  const name = kind === 'cover' ? `cover-${Date.now()}.${extension}` : `${photoId ?? crypto.randomUUID()}.${extension}`;
  const { body, contentType } = buildMultipartBody(
    {
      name,
      parents: [parent.id]
    },
    file
  );

  const response = await driveFetch(
    `${driveUploadBase}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink`,
    {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body
    }
  );
  return (await response.json()) as DriveFile;
}

export async function getGoogleDriveFileObjectUrl(fileId: string) {
  const cached = objectUrlCache.get(fileId);
  if (cached) return cached;

  const response = await driveFetch(`${driveApiBase}/files/${encodeURIComponent(fileId)}?alt=media`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(fileId, objectUrl);
  return objectUrl;
}
