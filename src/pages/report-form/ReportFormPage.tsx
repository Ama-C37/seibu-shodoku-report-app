import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Camera, FileText, MapPin, Plus, Save, Send, Sparkles, Trash2 } from 'lucide-react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { DriveImage } from '../../components/DriveImage';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { HeaderNavButton } from '../../components/HeaderNavButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { ConstructionNoPhotoHonorific, ConstructionNoPhotoReport, PestActivityLevel, PhotoType, Report, ReportStatus, ReportType } from '../../models/report';
import type { ReportPhoto } from '../../models/reportPhoto';
import type { ChemicalMaster, PestMaster, TreatmentMethodMaster } from '../../models/treatmentMaster';
import { getStoredManagementResponsibleName } from '../settings/SettingsPage';
import { compressImage } from '../../services/imageService';
import { authorizeGoogleDrive, hasGoogleDriveAccessToken, hasGoogleDriveConfig } from '../../services/googleDriveService';
import { storeReportImage } from '../../services/imageStorageService';
import { getCurrentPosition, reverseGeocode } from '../../services/gpsService';
import { canEditReport } from '../../services/reportPermissionService';
import { findBranchManagerByBranchId } from '../../repositories/userRepository';
import { findChemicalMasters, findPestMasters, findTreatmentMethodMasters } from '../../repositories/treatmentMasterRepository';
import { useAuthStore } from '../../stores/authStore';
import { usePhotoStore } from '../../stores/photoStore';
import { useReportStore } from '../../stores/reportStore';
import { errors, photoTypeLabel, reportTypeLabel } from '../../utils/constants';
import { todayInputValue } from '../../utils/dateFormatter';
import { validateReport } from '../../utils/validators';

const reportTypes = ['investigation', 'construction'];
const photoTypes = ['with_photo', 'without_photo'];

type LocationState = {
  correctedText?: string;
  photos?: ReportPhoto[];
  resetDraft?: boolean;
};

type DraftForm = {
  reportId: string;
  title: string;
  workDate: string;
  locationName: string;
  address: string;
  coverImageUrl?: string;
  coverDriveFileId?: string;
  coverDriveWebViewLink?: string;
  coverDriveThumbnailLink?: string;
  coverDriveMimeType?: string;
  coverDriveName?: string;
  latitude?: number;
  longitude?: number;
  reporterName: string;
  branchName: string;
  content: string;
  remarks: string;
  photos: ReportPhoto[];
  constructionNoPhoto?: ConstructionNoPhotoReport;
};

const defaultPestRows: ConstructionNoPhotoReport['pestActivityRows'] = [
  { pestName: '', level: '-' },
  { pestName: '', level: '-' },
  { pestName: '', level: '-' }
];

function buildDefaultTreatmentRows(existing?: ConstructionNoPhotoReport): NonNullable<ConstructionNoPhotoReport['treatmentRows']> {
  if (existing?.treatmentRows?.length) return existing.treatmentRows;
  return [
    {
      rowId: crypto.randomUUID(),
      pestName: existing?.targetPests ?? '',
      chemicalName: existing?.chemicals ?? '',
      treatmentMethodName: existing?.treatmentMethod ?? '',
      chemicalAmount: existing?.chemicalAmount ?? '',
      notes: existing?.notes ?? ''
    }
  ];
}

function defaultConstructionNoPhotoReport(
  reportCreatedDate: string,
  workResponsibleName: string,
  existing?: ConstructionNoPhotoReport
): ConstructionNoPhotoReport {
  return {
    copyType: existing?.copyType ?? 'customer',
    addressee: existing?.addressee ?? '',
    honorific: existing?.honorific ?? 'onchu',
    reportCreatedDate: existing?.reportCreatedDate ?? reportCreatedDate,
    managementResponsibleName: existing?.managementResponsibleName ?? getStoredManagementResponsibleName(),
    workResponsibleName: existing?.workResponsibleName ?? workResponsibleName,
    workStartTime: existing?.workStartTime ?? '',
    workEndTime: existing?.workEndTime ?? '',
    targetPests: existing?.targetPests ?? '',
    chemicals: existing?.chemicals ?? '',
    treatmentMethod: existing?.treatmentMethod ?? '',
    chemicalAmount: existing?.chemicalAmount ?? '',
    notes: existing?.notes ?? '',
    treatmentRows: buildDefaultTreatmentRows(existing),
    workSummary: existing?.workSummary ?? '',
    pestActivityRows: existing?.pestActivityRows?.length ? existing.pestActivityRows : defaultPestRows
  };
}

function draftKey(pathname: string) {
  return `seibu-report-form-draft-${pathname}`;
}

function loadDraft(pathname: string) {
  const raw = sessionStorage.getItem(draftKey(pathname));
  return raw ? (JSON.parse(raw) as DraftForm) : null;
}

function verifySavedReport(expected: Report, saved: Report | null) {
  if (!saved) return false;

  const expectedPhotoDriveFileIds = expected.photos.map((photo) => photo.driveFileId ?? '').filter(Boolean);
  const savedPhotoDriveFileIds = saved.photos.map((photo) => photo.driveFileId ?? '').filter(Boolean);

  return (
    saved.reportId === expected.reportId &&
    saved.title === expected.title &&
    saved.workDate === expected.workDate &&
    saved.locationName === expected.locationName &&
    saved.address === expected.address &&
    saved.reporterName === expected.reporterName &&
    saved.branchName === expected.branchName &&
    saved.content === expected.content &&
    saved.remarks === expected.remarks &&
    saved.status === expected.status &&
    (expected.coverDriveFileId ? saved.coverDriveFileId === expected.coverDriveFileId : true) &&
    expectedPhotoDriveFileIds.every((fileId) => savedPhotoDriveFileIds.includes(fileId))
  );
}

export function ReportFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const state = (location.state ?? {}) as LocationState;
  const user = useAuthStore((store) => store.user);
  const save = useReportStore((store) => store.save);
  const reports = useReportStore((store) => store.reports);
  const isReportLoading = useReportStore((store) => store.isLoading);
  const hasReportsLoaded = useReportStore((store) => store.hasLoaded);
  const refreshReports = useReportStore((store) => store.refresh);
  const setPhotoStore = usePhotoStore((store) => store.setPhotos);
  const existing = reports.find((report) => report.reportId === params.reportId);
  const isEdit = Boolean(params.reportId);

  const draft = useMemo(() => (state.resetDraft ? null : loadDraft(location.pathname)), [location.pathname, state.resetDraft]);
  const initialReportId = useMemo(() => existing?.reportId ?? draft?.reportId ?? crypto.randomUUID(), [draft?.reportId, existing?.reportId]);
  const reportType = (existing?.reportType ?? params.reportType) as ReportType | undefined;
  const photoType = (existing?.photoType ?? params.photoType) as PhotoType | undefined;
  const isConstructionNoPhotoTemplate = reportType === 'construction' && photoType === 'without_photo';

  const [title, setTitle] = useState(draft?.title ?? existing?.title ?? '');
  const [workDate, setWorkDate] = useState(draft?.workDate ?? existing?.workDate ?? todayInputValue());
  const [address, setAddress] = useState(draft?.address || existing?.address || draft?.locationName || existing?.locationName || '');
  const [coverImageUrl, setCoverImageUrl] = useState(draft?.coverImageUrl ?? existing?.coverImageUrl ?? '');
  const [coverDriveFileId, setCoverDriveFileId] = useState(draft?.coverDriveFileId ?? existing?.coverDriveFileId ?? '');
  const [coverDriveWebViewLink, setCoverDriveWebViewLink] = useState(draft?.coverDriveWebViewLink ?? existing?.coverDriveWebViewLink ?? '');
  const [coverDriveThumbnailLink, setCoverDriveThumbnailLink] = useState(
    draft?.coverDriveThumbnailLink ?? existing?.coverDriveThumbnailLink ?? ''
  );
  const [coverDriveMimeType, setCoverDriveMimeType] = useState(draft?.coverDriveMimeType ?? existing?.coverDriveMimeType ?? '');
  const [coverDriveName, setCoverDriveName] = useState(draft?.coverDriveName ?? existing?.coverDriveName ?? '');
  const [latitude, setLatitude] = useState<number | undefined>(draft?.latitude ?? existing?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(draft?.longitude ?? existing?.longitude);
  const [reporterName, setReporterName] = useState(
    draft?.reporterName ?? existing?.reporterName ?? (user?.name === '未ログイン' ? '' : user?.name ?? '')
  );
  const [branchName, setBranchName] = useState(draft?.branchName ?? existing?.branchName ?? user?.branchName ?? '');
  const [content, setContent] = useState(state.correctedText ?? draft?.content ?? existing?.content ?? '');
  const [remarks, setRemarks] = useState(draft?.remarks ?? existing?.remarks ?? '');
  const [photos, setPhotos] = useState<ReportPhoto[]>(state.photos ?? draft?.photos ?? existing?.photos ?? []);
  const [pestMasters, setPestMasters] = useState<PestMaster[]>([]);
  const [chemicalMasters, setChemicalMasters] = useState<ChemicalMaster[]>([]);
  const [treatmentMethodMasters, setTreatmentMethodMasters] = useState<TreatmentMethodMaster[]>([]);
  const [managementResponsibleOptions, setManagementResponsibleOptions] = useState<string[]>([]);
  const [constructionNoPhoto, setConstructionNoPhoto] = useState<ConstructionNoPhotoReport>(() =>
    defaultConstructionNoPhotoReport(
      workDate,
      reporterName,
      draft?.constructionNoPhoto ?? existing?.constructionNoPhoto
    )
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [canEditExisting, setCanEditExisting] = useState(!isEdit);
  const [hasCheckedEditPermission, setHasCheckedEditPermission] = useState(!isEdit);

  useEffect(() => {
    void refreshReports();
  }, [refreshReports]);

  useEffect(() => {
    let active = true;
    if (!isEdit) {
      setCanEditExisting(true);
      setHasCheckedEditPermission(true);
      return () => {
        active = false;
      };
    }
    if (!existing) {
      setCanEditExisting(false);
      setHasCheckedEditPermission(hasReportsLoaded);
      return () => {
        active = false;
      };
    }
    setHasCheckedEditPermission(false);
    canEditReport(user, existing).then((editable) => {
      if (!active) return;
      setCanEditExisting(editable);
      setHasCheckedEditPermission(true);
    });
    return () => {
      active = false;
    };
  }, [existing, hasReportsLoaded, isEdit, user]);

  useEffect(() => {
    const savedName = constructionNoPhoto.managementResponsibleName.trim();
    if (!isConstructionNoPhotoTemplate || !savedName) return;
    setManagementResponsibleOptions((current) => Array.from(new Set([...current, savedName])));
  }, [constructionNoPhoto.managementResponsibleName, isConstructionNoPhotoTemplate]);

  useEffect(() => {
    if (!isConstructionNoPhotoTemplate) return;
    let active = true;
    Promise.all([findPestMasters(), findChemicalMasters(), findTreatmentMethodMasters()]).then(([pests, chemicals, methods]) => {
      if (!active) return;
      const activePests = pests.filter((item) => item.isActive);
      const activeChemicals = chemicals.filter(
        (item) => item.isActive && activePests.some((pest) => pest.pestId === item.pestId)
      );
      const activeMethods = methods.filter(
        (item) => item.isActive && activeChemicals.some((chemical) => chemical.chemicalId === item.chemicalId)
      );
      setPestMasters(activePests);
      setChemicalMasters(activeChemicals);
      setTreatmentMethodMasters(activeMethods);
      setConstructionNoPhoto((current) => {
        const treatmentRows = (current.treatmentRows?.length ? current.treatmentRows : buildDefaultTreatmentRows(current)).map((row) => {
          const pest = activePests.find((item) => item.pestName === row.pestName || item.pestId === row.pestId);
          const chemical = activeChemicals.find(
            (item) => item.chemicalName === row.chemicalName || item.chemicalId === row.chemicalId
          );
          const method = activeMethods.find(
            (item) => item.treatmentMethodName === row.treatmentMethodName || item.treatmentMethodId === row.treatmentMethodId
          );
          return {
            ...row,
            pestId: row.pestId ?? pest?.pestId,
            chemicalId: row.chemicalId ?? chemical?.chemicalId,
            treatmentMethodId: row.treatmentMethodId ?? method?.treatmentMethodId
          };
        });
        return {
          ...current,
          treatmentRows,
          pestActivityRows: syncPestActivityRows(treatmentRows, current.pestActivityRows)
        };
      });
    });
    return () => {
      active = false;
    };
  }, [isConstructionNoPhotoTemplate]);

  useEffect(() => {
    const branchIdForManager = existing?.branchId ?? user?.branchId;
    if (!isConstructionNoPhotoTemplate || !branchIdForManager) return;
    let active = true;
    findBranchManagerByBranchId(branchIdForManager).then((branchManager) => {
      if (!active || !branchManager) return;
      setManagementResponsibleOptions((current) => Array.from(new Set([...current, branchManager.name])));
      if (isEdit || draft?.constructionNoPhoto?.managementResponsibleName) return;
      setConstructionNoPhoto((current) => ({
        ...current,
        managementResponsibleName: current.managementResponsibleName || branchManager.name
      }));
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [draft?.constructionNoPhoto?.managementResponsibleName, existing?.branchId, isConstructionNoPhotoTemplate, isEdit, user?.branchId]);

  if (!reportType || !photoType || !reportTypes.includes(reportType) || !photoTypes.includes(photoType)) {
    return <Navigate to="/report-type" replace />;
  }

  if (isEdit && (isReportLoading || !hasReportsLoaded || !hasCheckedEditPermission)) {
    return (
      <main className="app-shell">
        <p className="empty-text">読み込み中...</p>
      </main>
    );
  }

  if (isEdit && !existing) return <Navigate to="/home" replace />;
  if (isEdit && !canEditExisting) return <Navigate to="/home" replace />;

  const currentReportType = reportType as ReportType;
  const currentPhotoType = photoType as PhotoType;
  const usesImages = currentPhotoType === 'with_photo';

  function updateConstructionNoPhoto(values: Partial<ConstructionNoPhotoReport>) {
    setConstructionNoPhoto((current) => ({ ...current, ...values }));
  }

  function updatePestActivityRow(index: number, values: Partial<ConstructionNoPhotoReport['pestActivityRows'][number]>) {
    setConstructionNoPhoto((current) => ({
      ...current,
      pestActivityRows: current.pestActivityRows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...values } : row))
    }));
  }

  function syncPestActivityRows(
    treatmentRows: NonNullable<ConstructionNoPhotoReport['treatmentRows']>,
    currentRows: ConstructionNoPhotoReport['pestActivityRows']
  ) {
    const levelByPestName = new Map(currentRows.map((row) => [row.pestName, row.level]));
    const uniquePestNames = Array.from(new Set(treatmentRows.map((row) => row.pestName.trim()).filter(Boolean)));
    return uniquePestNames.map((pestName) => ({
      pestName,
      level: levelByPestName.get(pestName) ?? '-'
    }));
  }

  function updateTreatmentRow(rowId: string, values: Partial<NonNullable<ConstructionNoPhotoReport['treatmentRows']>[number]>) {
    setConstructionNoPhoto((current) => ({
      ...current,
      treatmentRows: (current.treatmentRows ?? []).map((row) => (row.rowId === rowId ? { ...row, ...values } : row))
    }));
  }

  function addTreatmentRow() {
    setConstructionNoPhoto((current) => ({
      ...current,
      treatmentRows: [
        ...(current.treatmentRows ?? []),
        {
          rowId: crypto.randomUUID(),
          pestName: '',
          chemicalName: '',
          treatmentMethodName: '',
          chemicalAmount: '',
          notes: ''
        }
      ]
    }));
  }

  function removeTreatmentRow(rowId: string) {
    setConstructionNoPhoto((current) => {
      const nextRows = (current.treatmentRows ?? []).filter((row) => row.rowId !== rowId);
      const treatmentRows = nextRows.length ? nextRows : buildDefaultTreatmentRows();
      return {
        ...current,
        treatmentRows,
        pestActivityRows: syncPestActivityRows(treatmentRows, current.pestActivityRows)
      };
    });
  }

  function chemicalsForPest(pestId?: string) {
    return chemicalMasters.filter((item) => item.pestId === pestId);
  }

  function methodsForChemical(chemicalId?: string) {
    return treatmentMethodMasters.filter((item) => item.chemicalId === chemicalId);
  }

  function selectPest(rowId: string, pestId: string) {
    const pest = pestMasters.find((item) => item.pestId === pestId);
    const nextChemical = chemicalMasters.find((item) => item.pestId === pestId);
    const nextMethod = treatmentMethodMasters.find((item) => item.chemicalId === nextChemical?.chemicalId);
    setConstructionNoPhoto((current) => {
      const nextRows = (current.treatmentRows ?? []).map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              pestId,
              pestName: pest?.pestName ?? '',
              chemicalId: nextChemical?.chemicalId ?? '',
              chemicalName: nextChemical?.chemicalName ?? '',
              treatmentMethodId: nextMethod?.treatmentMethodId ?? '',
              treatmentMethodName: nextMethod?.treatmentMethodName ?? ''
            }
          : row
      );
      return {
        ...current,
        treatmentRows: nextRows,
        pestActivityRows: syncPestActivityRows(nextRows, current.pestActivityRows)
      };
    });
  }

  function selectChemical(rowId: string, chemicalId: string) {
    const chemical = chemicalMasters.find((item) => item.chemicalId === chemicalId);
    const nextMethod = treatmentMethodMasters.find((item) => item.chemicalId === chemicalId);
    updateTreatmentRow(rowId, {
      chemicalId,
      chemicalName: chemical?.chemicalName ?? '',
      treatmentMethodId: nextMethod?.treatmentMethodId ?? '',
      treatmentMethodName: nextMethod?.treatmentMethodName ?? ''
    });
  }

  function selectTreatmentMethod(rowId: string, treatmentMethodId: string) {
    const treatmentMethod = treatmentMethodMasters.find((item) => item.treatmentMethodId === treatmentMethodId);
    updateTreatmentRow(rowId, {
      treatmentMethodId,
      treatmentMethodName: treatmentMethod?.treatmentMethodName ?? ''
    });
  }

  async function acquireGps() {
    setLoading(true);
    setMessage('');
    try {
      const position = await getCurrentPosition();
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      const detectedAddress = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      setAddress(detectedAddress);
    } catch {
      setMessage(errors.gps);
    } finally {
      setLoading(false);
    }
  }

  function buildReport(status: ReportStatus): Report {
    const now = new Date().toISOString();
    const constructionTemplate = isConstructionNoPhotoTemplate
      ? {
          ...constructionNoPhoto,
          targetPests: constructionNoPhoto.treatmentRows?.[0]?.pestName ?? constructionNoPhoto.targetPests,
          chemicals: constructionNoPhoto.treatmentRows?.[0]?.chemicalName ?? constructionNoPhoto.chemicals,
          treatmentMethod: constructionNoPhoto.treatmentRows?.[0]?.treatmentMethodName ?? constructionNoPhoto.treatmentMethod,
          chemicalAmount: constructionNoPhoto.treatmentRows?.[0]?.chemicalAmount ?? constructionNoPhoto.chemicalAmount,
          notes: constructionNoPhoto.treatmentRows?.[0]?.notes ?? constructionNoPhoto.notes,
          reportCreatedDate: constructionNoPhoto.reportCreatedDate || workDate,
          workResponsibleName: constructionNoPhoto.workResponsibleName || reporterName.trim(),
          workSummary: content.trim(),
          treatmentRows: constructionNoPhoto.treatmentRows?.length ? constructionNoPhoto.treatmentRows : buildDefaultTreatmentRows(constructionNoPhoto)
        }
      : undefined;

    return {
      reportId: initialReportId,
      reportType: currentReportType,
      photoType: currentPhotoType,
      title: isConstructionNoPhotoTemplate ? '防除作業管理報告書' : title.trim(),
      workDate: isConstructionNoPhotoTemplate ? constructionTemplate?.reportCreatedDate ?? workDate : workDate,
      locationName: address.trim(),
      address: address.trim(),
      coverImageUrl: usesImages ? coverImageUrl : undefined,
      coverDriveFileId: usesImages ? coverDriveFileId || undefined : undefined,
      coverDriveWebViewLink: usesImages ? coverDriveWebViewLink || undefined : undefined,
      coverDriveThumbnailLink: usesImages ? coverDriveThumbnailLink || undefined : undefined,
      coverDriveMimeType: usesImages ? coverDriveMimeType || undefined : undefined,
      coverDriveName: usesImages ? coverDriveName || undefined : undefined,
      latitude,
      longitude,
      reporterId: existing?.reporterId ?? user?.userId ?? 'guest',
      reporterName: reporterName.trim(),
      branchId: existing?.branchId ?? user?.branchId ?? '',
      branchName: branchName.trim(),
      content: content.trim(),
      correctedContent: state.correctedText ?? existing?.correctedContent ?? '',
      remarks: remarks.trim(),
      status,
      pdfUrl: existing?.pdfUrl,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      submittedAt: status === 'submitted' ? now : existing?.submittedAt,
      photos: usesImages ? photos : [],
      constructionNoPhoto: constructionTemplate
    };
  }

  function persistDraft() {
    const draftValue: DraftForm = {
      reportId: initialReportId,
      title,
      workDate,
      locationName: address,
      address,
      coverImageUrl,
      coverDriveFileId,
      coverDriveWebViewLink,
      coverDriveThumbnailLink,
      coverDriveMimeType,
      coverDriveName,
      latitude,
      longitude,
      reporterName,
      branchName,
      content,
      remarks,
      photos,
      constructionNoPhoto
    };
    sessionStorage.setItem(draftKey(location.pathname), JSON.stringify(draftValue));
  }

  function validate() {
    const messages = validateReport({
      title: isConstructionNoPhotoTemplate ? '防除作業管理報告書' : title,
      workDate: isConstructionNoPhotoTemplate ? constructionNoPhoto.reportCreatedDate : workDate,
      locationName: address,
      reporterName: isConstructionNoPhotoTemplate ? constructionNoPhoto.workResponsibleName : reporterName,
      content,
      remarks,
      photoType: currentPhotoType,
      photos
    });
    if (isConstructionNoPhotoTemplate) {
      if (!constructionNoPhoto.addressee.trim()) messages.push('宛名を入力してください。');
      if (!constructionNoPhoto.managementResponsibleName.trim()) messages.push('管理責任者を入力してください。');
      if (!constructionNoPhoto.workStartTime.trim()) messages.push('作業開始時間を入力してください。');
      if (!constructionNoPhoto.workEndTime.trim()) messages.push('作業終了時間を入力してください。');
    }
    setMessage(messages[0] ?? '');
    return messages.length === 0;
  }

  async function handleCoverImage(file?: File) {
    if (!file) return;
    setLoading(true);
    setMessage('');
    try {
      if (hasGoogleDriveConfig() && !hasGoogleDriveAccessToken()) {
        await authorizeGoogleDrive();
      }
      const compressed = await compressImage(file);
      const storedImage = await storeReportImage(compressed, initialReportId, 'cover');
      setCoverImageUrl(storedImage.imageUrl);
      setCoverDriveFileId(storedImage.driveFileId ?? '');
      setCoverDriveWebViewLink(storedImage.driveWebViewLink ?? '');
      setCoverDriveThumbnailLink(storedImage.driveThumbnailLink ?? '');
      setCoverDriveMimeType(storedImage.driveMimeType ?? '');
      setCoverDriveName(storedImage.driveName ?? '');
    } catch {
      setMessage(hasGoogleDriveConfig() ? errors.drive : errors.photo);
    } finally {
      setLoading(false);
    }
  }

  async function submit(status: ReportStatus) {
    if (!validate()) return;
    const report = buildReport(status);
    setLoading(true);
    try {
      const savedReport = await save(report);
      if (!verifySavedReport(report, savedReport)) {
        setMessage('保存後のデータ確認に失敗しました。時間をおいて再度保存してください。');
        return;
      }
    } finally {
      setLoading(false);
    }
    sessionStorage.removeItem(draftKey(location.pathname));
    navigate('/home', { replace: true });
  }

  async function previewPdf(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const report = buildReport('draft');
    setLoading(true);
    try {
      const savedReport = await save(report);
      if (!verifySavedReport(report, savedReport)) {
        setMessage('保存後のデータ確認に失敗しました。時間をおいて再度保存してください。');
        return;
      }
    } finally {
      setLoading(false);
    }
    sessionStorage.removeItem(draftKey(location.pathname));
    navigate(`/pdf-preview/${report.reportId}`);
  }

  return (
    <LoadingOverlay loading={loading}>
      <main className="app-shell">
        <header className="subpage-header row-header">
          <div>
            <h1>報告書入力</h1>
            <p>{reportTypeLabel(currentReportType)} / {photoTypeLabel(currentPhotoType)}</p>
          </div>
          <HeaderNavButton target="home" />
        </header>
        <form className="form-stack" onSubmit={previewPdf}>
          {message ? <p className="alert">{message}</p> : null}
          {isConstructionNoPhotoTemplate ? (
            <section className="form-section">
              <p className="legal-note">「ビル管理法」・「食品衛生法」・「労働安全衛生法」に定められる備付帳簿用</p>
              <h2>防除作業管理報告書</h2>
              <div className="two-column-fields">
                <label>
                  控の種類
                  <select
                    value={constructionNoPhoto.copyType}
                    onChange={(event) =>
                      updateConstructionNoPhoto({ copyType: event.target.value as ConstructionNoPhotoReport['copyType'] })
                    }
                  >
                    <option value="customer">御客様控</option>
                    <option value="company">会社控</option>
                  </select>
                </label>
                <label>
                  報告日
                  <input
                    type="date"
                    value={constructionNoPhoto.reportCreatedDate}
                    onChange={(event) => {
                      updateConstructionNoPhoto({ reportCreatedDate: event.target.value });
                      setWorkDate(event.target.value);
                    }}
                  />
                </label>
              </div>
              <div className="input-action-row">
                <label>
                  宛名
                  <input
                    value={constructionNoPhoto.addressee}
                    onChange={(event) => updateConstructionNoPhoto({ addressee: event.target.value })}
                  />
                </label>
                <label>
                  敬称
                  <select
                    value={constructionNoPhoto.honorific}
                    onChange={(event) =>
                      updateConstructionNoPhoto({ honorific: event.target.value as ConstructionNoPhotoHonorific })
                    }
                  >
                    <option value="sama">様</option>
                    <option value="onchu">御中</option>
                  </select>
                </label>
              </div>
              <div className="two-column-fields">
                <label>
                  管理責任者
                  <input
                    list="management-responsible-options"
                    value={constructionNoPhoto.managementResponsibleName}
                    onChange={(event) => updateConstructionNoPhoto({ managementResponsibleName: event.target.value })}
                  />
                  <datalist id="management-responsible-options">
                    {managementResponsibleOptions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </label>
                <label>
                  作業責任者
                  <input
                    value={constructionNoPhoto.workResponsibleName}
                    onChange={(event) => {
                      updateConstructionNoPhoto({ workResponsibleName: event.target.value });
                      setReporterName(event.target.value);
                    }}
                  />
                </label>
              </div>
            </section>
          ) : (
            <>
              <label>
                報告書タイトル
                <input value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label>
                作業日
                <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} />
              </label>
            </>
          )}
          <label>
            {isConstructionNoPhotoTemplate ? '施工場所' : '作業場所'}
            <span className="input-action-row">
              <input value={address} onChange={(event) => setAddress(event.target.value)} />
              <PrimaryButton icon={<MapPin size={18} />} variant="secondary" type="button" onClick={acquireGps}>
                GPS
              </PrimaryButton>
            </span>
          </label>
          {usesImages ? (
            <section className="cover-image-input">
              <div className="cover-image-header">
                <div>
                  <strong>表紙画像</strong>
                  <p>施工現場の全景写真を表紙に表示します</p>
                </div>
                <div className="cover-image-actions">
                  {coverImageUrl ? (
                    <>
                      <label className="button button-secondary">
                        <Camera size={18} />
                        <span>変更</span>
                        <input type="file" accept="image/*" capture="environment" onChange={(event) => handleCoverImage(event.target.files?.[0])} />
                      </label>
                      <PrimaryButton
                        icon={<Trash2 size={18} />}
                        variant="secondary"
                        type="button"
                        onClick={() => {
                          setCoverImageUrl('');
                          setCoverDriveFileId('');
                          setCoverDriveWebViewLink('');
                          setCoverDriveThumbnailLink('');
                          setCoverDriveMimeType('');
                          setCoverDriveName('');
                        }}
                      >
                        削除
                      </PrimaryButton>
                    </>
                  ) : null}
                </div>
              </div>
              {coverImageUrl ? (
                <DriveImage
                  className="cover-image-preview"
                  driveFileId={coverDriveFileId}
                  fallbackSrc={coverImageUrl}
                  alt="表紙画像プレビュー"
                />
              ) : (
                <label className="cover-image-drop">
                  <Camera size={22} />
                  表紙画像を追加
                  <input type="file" accept="image/*" capture="environment" onChange={(event) => handleCoverImage(event.target.files?.[0])} />
                </label>
              )}
            </section>
          ) : null}
          {!isConstructionNoPhotoTemplate ? (
            <>
              <label>
                報告者名
                <input value={reporterName} onChange={(event) => setReporterName(event.target.value)} />
              </label>
              <label>
                所属支店
                <input value={branchName} onChange={(event) => setBranchName(event.target.value)} />
              </label>
            </>
          ) : (
            <section className="form-section">
              <div className="two-column-fields">
                <label>
                  施工日時
                  <input type="date" value={constructionNoPhoto.reportCreatedDate} readOnly />
                </label>
                <label>
                  作業時間
                  <span className="time-range-fields">
                    <input
                      type="time"
                      value={constructionNoPhoto.workStartTime}
                      onChange={(event) => updateConstructionNoPhoto({ workStartTime: event.target.value })}
                    />
                    <span>から</span>
                    <input
                      type="time"
                      value={constructionNoPhoto.workEndTime}
                      onChange={(event) => updateConstructionNoPhoto({ workEndTime: event.target.value })}
                    />
                  </span>
                </label>
              </div>
              <div className="section-title-row">
                <h2>施工内容</h2>
                <PrimaryButton icon={<Plus size={18} />} type="button" variant="secondary" onClick={addTreatmentRow}>
                  追加
                </PrimaryButton>
              </div>
              <div className="treatment-row-list">
                {(constructionNoPhoto.treatmentRows ?? []).map((row, index) => {
                  const rowChemicals = chemicalsForPest(row.pestId);
                  const rowMethods = methodsForChemical(row.chemicalId);
                  return (
                    <section className="treatment-row-card" key={row.rowId}>
                      <div className="treatment-row-header">
                        <strong>施工内容 {index + 1}</strong>
                        {(constructionNoPhoto.treatmentRows?.length ?? 0) > 1 ? (
                          <button className="text-button danger" type="button" onClick={() => removeTreatmentRow(row.rowId)}>
                            <Trash2 size={16} />
                            削除
                          </button>
                        ) : null}
                      </div>
                      <div className="construction-grid">
                        <label>
                          対象害虫獣
                          <select value={row.pestId ?? ''} onChange={(event) => selectPest(row.rowId, event.target.value)}>
                            <option value="">選択してください</option>
                            {pestMasters.map((pest) => (
                              <option key={pest.pestId} value={pest.pestId}>
                                {pest.pestName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          使用薬剤
                          <select value={row.chemicalId ?? ''} onChange={(event) => selectChemical(row.rowId, event.target.value)} disabled={!row.pestId}>
                            <option value="">選択してください</option>
                            {rowChemicals.map((chemical) => (
                              <option key={chemical.chemicalId} value={chemical.chemicalId}>
                                {chemical.chemicalName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          処理方法
                          <select
                            value={row.treatmentMethodId ?? ''}
                            onChange={(event) => selectTreatmentMethod(row.rowId, event.target.value)}
                            disabled={!row.chemicalId}
                          >
                            <option value="">選択してください</option>
                            {rowMethods.map((method) => (
                              <option key={method.treatmentMethodId} value={method.treatmentMethodId}>
                                {method.treatmentMethodName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          薬剤使用量
                          <input value={row.chemicalAmount} onChange={(event) => updateTreatmentRow(row.rowId, { chemicalAmount: event.target.value })} />
                        </label>
                        <label className="construction-grid-wide">
                          備考
                          <input value={row.notes} onChange={(event) => updateTreatmentRow(row.rowId, { notes: event.target.value })} />
                        </label>
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>
          )}
          <label>
            {isConstructionNoPhotoTemplate ? '作業内容摘要' : '報告内容'}
            <textarea value={content} maxLength={3000} rows={9} onChange={(event) => setContent(event.target.value)} />
            <span className="field-count">{content.length}/3000</span>
          </label>
          <PrimaryButton
            icon={<Sparkles size={18} />}
            variant="secondary"
            type="button"
            onClick={() => {
              persistDraft();
              navigate('/ai-correction', { state: { text: content, backTo: location.pathname } });
            }}
          >
            AI添削
          </PrimaryButton>
          {isConstructionNoPhotoTemplate ? (
            <section className="form-section">
              <h2>生息状況</h2>
              <div className="pest-activity-list">
                {constructionNoPhoto.pestActivityRows.map((row, index) => (
                  <div className="pest-activity-row" key={`pest-row-${index}`}>
                    <input
                      value={row.pestName}
                      placeholder={index === 0 ? '対象害虫獣名' : '追加対象'}
                      readOnly
                    />
                    <select
                      value={row.level}
                      onChange={(event) => updatePestActivityRow(index, { level: event.target.value as PestActivityLevel })}
                    >
                      <option value="-">-</option>
                      <option value="+">＋</option>
                      <option value="++">＋＋</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <label>
              備考
              <textarea value={remarks} maxLength={1000} rows={4} onChange={(event) => setRemarks(event.target.value)} />
              <span className="field-count">{remarks.length}/1000</span>
            </label>
          )}
          {usesImages ? (
            <button
              className="photo-manager-link"
              type="button"
              onClick={() => {
                persistDraft();
                setPhotoStore(photos);
                navigate('/photo-manager', { state: { backTo: location.pathname, reportId: initialReportId } });
              }}
            >
              <span className="photo-manager-main">
                <Camera size={20} />
                <span>写真管理</span>
              </span>
              <strong>{photos.length}枚</strong>
            </button>
          ) : null}
          <div className="action-bar form-action-bar">
            <PrimaryButton icon={<FileText size={18} />} type="submit">
              PDF確認
            </PrimaryButton>
            <PrimaryButton icon={<Save size={18} />} variant="secondary" type="button" onClick={() => submit('draft')}>
              下書き保存
            </PrimaryButton>
            <PrimaryButton icon={<Send size={18} />} type="button" onClick={() => submit('submitted')}>
              提出済み保存
            </PrimaryButton>
          </div>
        </form>
      </main>
    </LoadingOverlay>
  );
}
