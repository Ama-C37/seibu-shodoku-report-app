import { FormEvent, useMemo, useState } from 'react';
import { Camera, FileText, MapPin, Save, Send, Sparkles } from 'lucide-react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { LoadingOverlay } from '../../components/LoadingOverlay';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { PhotoType, Report, ReportStatus, ReportType } from '../../models/report';
import type { ReportPhoto } from '../../models/reportPhoto';
import { getCurrentPosition } from '../../services/gpsService';
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
};

type DraftForm = {
  title: string;
  workDate: string;
  locationName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  reporterName: string;
  branchName: string;
  content: string;
  remarks: string;
  photos: ReportPhoto[];
};

function draftKey(reportId: string) {
  return `seibu-report-form-draft-${reportId}`;
}

function loadDraft(reportId: string) {
  const raw = sessionStorage.getItem(draftKey(reportId));
  return raw ? (JSON.parse(raw) as DraftForm) : null;
}

export function ReportFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const state = (location.state ?? {}) as LocationState;
  const user = useAuthStore((store) => store.user);
  const save = useReportStore((store) => store.save);
  const reports = useReportStore((store) => store.reports);
  const setPhotoStore = usePhotoStore((store) => store.setPhotos);
  const existing = reports.find((report) => report.reportId === params.reportId);
  const isEdit = Boolean(params.reportId);

  const initialReportId = useMemo(() => existing?.reportId ?? crypto.randomUUID(), [existing?.reportId]);
  const reportType = (existing?.reportType ?? params.reportType) as ReportType | undefined;
  const photoType = (existing?.photoType ?? params.photoType) as PhotoType | undefined;
  const draft = useMemo(() => loadDraft(initialReportId), [initialReportId]);

  const [title, setTitle] = useState(draft?.title ?? existing?.title ?? '');
  const [workDate, setWorkDate] = useState(draft?.workDate ?? existing?.workDate ?? todayInputValue());
  const [locationName, setLocationName] = useState(draft?.locationName ?? existing?.locationName ?? '');
  const [address, setAddress] = useState(draft?.address ?? existing?.address ?? '');
  const [latitude, setLatitude] = useState<number | undefined>(draft?.latitude ?? existing?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(draft?.longitude ?? existing?.longitude);
  const [reporterName, setReporterName] = useState(
    draft?.reporterName ?? existing?.reporterName ?? (user?.name === '未ログイン' ? '' : user?.name ?? '')
  );
  const [branchName, setBranchName] = useState(draft?.branchName ?? existing?.branchName ?? user?.branchName ?? '');
  const [content, setContent] = useState(state.correctedText ?? draft?.content ?? existing?.content ?? '');
  const [remarks, setRemarks] = useState(draft?.remarks ?? existing?.remarks ?? '');
  const [photos, setPhotos] = useState<ReportPhoto[]>(state.photos ?? draft?.photos ?? existing?.photos ?? []);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!reportType || !photoType || !reportTypes.includes(reportType) || !photoTypes.includes(photoType)) {
    return <Navigate to="/report-type" replace />;
  }

  if (isEdit && !existing) return <Navigate to="/home" replace />;

  const currentReportType = reportType as ReportType;
  const currentPhotoType = photoType as PhotoType;

  async function acquireGps() {
    setLoading(true);
    setMessage('');
    try {
      const position = await getCurrentPosition();
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    } catch {
      setMessage(errors.gps);
    } finally {
      setLoading(false);
    }
  }

  function buildReport(status: ReportStatus): Report {
    const now = new Date().toISOString();
    return {
      reportId: initialReportId,
      reportType: currentReportType,
      photoType: currentPhotoType,
      title: title.trim(),
      workDate,
      locationName: locationName.trim(),
      address: address.trim(),
      latitude,
      longitude,
      reporterId: user?.userId ?? 'guest',
      reporterName: reporterName.trim(),
      branchId: user?.branchId ?? '',
      branchName: branchName.trim(),
      content: content.trim(),
      correctedContent: state.correctedText ?? existing?.correctedContent ?? '',
      remarks: remarks.trim(),
      status,
      pdfUrl: existing?.pdfUrl,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      submittedAt: status === 'submitted' ? now : existing?.submittedAt,
      photos
    };
  }

  function persistDraft() {
    const draftValue: DraftForm = {
      title,
      workDate,
      locationName,
      address,
      latitude,
      longitude,
      reporterName,
      branchName,
      content,
      remarks,
      photos
    };
    sessionStorage.setItem(draftKey(initialReportId), JSON.stringify(draftValue));
  }

  function validate() {
    const messages = validateReport({
      title,
      workDate,
      locationName,
      reporterName,
      content,
      remarks,
      photoType: currentPhotoType,
      photos
    });
    setMessage(messages[0] ?? '');
    return messages.length === 0;
  }

  function submit(status: ReportStatus) {
    if (!validate()) return;
    save(buildReport(status));
    sessionStorage.removeItem(draftKey(initialReportId));
    navigate('/home', { replace: true });
  }

  function previewPdf(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const report = buildReport('draft');
    save(report);
    sessionStorage.removeItem(draftKey(initialReportId));
    navigate(`/pdf-preview/${report.reportId}`);
  }

  return (
    <LoadingOverlay loading={loading}>
      <main className="app-shell">
        <header className="subpage-header">
          <h1>報告書入力</h1>
          <p>{reportTypeLabel(currentReportType)} / {photoTypeLabel(currentPhotoType)}</p>
        </header>
        <form className="form-stack" onSubmit={previewPdf}>
          {message ? <p className="alert">{message}</p> : null}
          <label>
            報告書タイトル
            <input value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            作業日
            <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} />
          </label>
          <label>
            作業場所
            <input value={locationName} onChange={(event) => setLocationName(event.target.value)} />
          </label>
          <label>
            住所
            <input value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          <section className="inline-panel">
            <div>
              <strong>GPS取得位置</strong>
              <p>{latitude && longitude ? `緯度 ${latitude}\n経度 ${longitude}` : '未取得'}</p>
            </div>
            <PrimaryButton icon={<MapPin size={18} />} variant="secondary" type="button" onClick={acquireGps}>
              取得
            </PrimaryButton>
          </section>
          <label>
            報告者名
            <input value={reporterName} onChange={(event) => setReporterName(event.target.value)} />
          </label>
          <label>
            所属支店
            <input value={branchName} onChange={(event) => setBranchName(event.target.value)} />
          </label>
          <label>
            報告内容
            <textarea value={content} maxLength={3000} rows={9} onChange={(event) => setContent(event.target.value)} />
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
          <label>
            備考
            <textarea value={remarks} maxLength={1000} rows={4} onChange={(event) => setRemarks(event.target.value)} />
          </label>
          {currentPhotoType === 'with_photo' ? (
            <button
              className="photo-manager-link"
              type="button"
              onClick={() => {
                persistDraft();
                setPhotoStore(photos);
                navigate('/photo-manager', { state: { backTo: location.pathname, reportId: initialReportId } });
              }}
            >
              <Camera size={20} />
              写真管理 ({photos.length}枚)
            </button>
          ) : null}
          <div className="action-bar">
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
