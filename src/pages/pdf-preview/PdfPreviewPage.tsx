import { Download, Edit3, Share2 } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { DriveImage } from '../../components/DriveImage';
import { HeaderNavButton } from '../../components/HeaderNavButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useReportStore } from '../../stores/reportStore';
import { downloadPdfPages, getPdfPagesBlob } from '../../services/pdfService';
import { errors, photoTypeLabel, reportTypeLabel } from '../../utils/constants';
import { formatDate } from '../../utils/dateFormatter';
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

const photosPerPage = 6;
const pdfPageWidth = 794;
const compactClasses = [
  'compact-activity',
  'compact-activity-tight',
  'compact-treatment',
  'compact-treatment-tight',
  'compact-meta',
  'compact-meta-tight',
  'compact-page'
] as const;
const summaryCompactThreshold = 450;

function chunkPhotos<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));
}

function honorificLabel(value?: string) {
  return value === 'sama' ? '様' : '御中';
}

function copyTypeLabel(value?: string) {
  return value === 'company' ? '会社控' : '御客様控';
}

function getSummaryCompactClassName(textLength: number) {
  if (textLength <= summaryCompactThreshold) return '';

  const classNames: Array<(typeof compactClasses)[number]> = [
    'compact-activity',
    'compact-treatment',
    'compact-meta'
  ];

  if (textLength > 550) {
    classNames.push('compact-activity-tight', 'compact-treatment-tight', 'compact-meta-tight');
  }

  if (textLength > 650) {
    classNames.push('compact-page');
  }

  return classNames.join(' ');
}

export function PdfPreviewPage() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const report = useReportStore((store) => store.reports.find((item) => item.reportId === reportId));
  const isLoading = useReportStore((store) => store.isLoading);
  const hasLoaded = useReportStore((store) => store.hasLoaded);
  const refresh = useReportStore((store) => store.refresh);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const previewRef = useRef<HTMLElement | null>(null);
  const summaryTextLength = (report?.constructionNoPhoto?.workSummary || report?.content || '').trim().length;
  const summaryCompactClassName = getSummaryCompactClassName(summaryTextLength);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function updatePreviewScale() {
      const containerWidth = previewRef.current?.clientWidth ?? window.innerWidth;
      const nextScale = Math.min(1, containerWidth / pdfPageWidth);
      setPreviewScale(Number(nextScale.toFixed(4)));
    }

    updatePreviewScale();
    window.addEventListener('resize', updatePreviewScale);
    return () => window.removeEventListener('resize', updatePreviewScale);
  }, []);

  useLayoutEffect(() => {
    const page = previewRef.current?.querySelector<HTMLElement>('.pdf-management-page');
    if (!page) return;
    const pageElement = page;
    let frameId = 0;

    function pageFits() {
      const summary = pageElement.querySelector<HTMLElement>('.management-summary');
      const summaryText = summary?.querySelector<HTMLElement>('p');
      const pageOverflow = pageElement.scrollHeight - pageElement.clientHeight;
      const summaryOverflow = summary && summaryText
        ? summaryText.getBoundingClientRect().bottom - summary.getBoundingClientRect().bottom
        : 0;
      return (
        pageOverflow <= 1 &&
        summaryOverflow <= 1
      );
    }

    frameId = window.requestAnimationFrame(() => {
      const minimumCompactCount = Math.max(0, Math.ceil((summaryTextLength - summaryCompactThreshold) / 50));
      const minimumCompactClasses = summaryCompactClassName.split(' ').filter(Boolean);
      pageElement.classList.remove(...compactClasses.filter((className) => !minimumCompactClasses.includes(className)));
      for (const [index, className] of compactClasses.entries()) {
        if (index >= minimumCompactCount && pageFits()) break;
        pageElement.classList.add(className);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [report?.reportId, report?.content, report?.constructionNoPhoto, summaryCompactClassName, summaryTextLength, isLoading, hasLoaded]);

  if (isLoading || !hasLoaded) {
    return (
      <main className="app-shell">
        <p className="empty-text">読み込み中...</p>
      </main>
    );
  }

  if (!report) return <Navigate to="/home" replace />;

  const currentReport = report;
  const usesImages = currentReport.photoType === 'with_photo';
  const isConstructionNoPhotoTemplate = currentReport.reportType === 'construction' && currentReport.photoType === 'without_photo';
  const constructionNoPhoto = currentReport.constructionNoPhoto;
  const treatmentRows = constructionNoPhoto?.treatmentRows?.length
    ? constructionNoPhoto.treatmentRows
    : constructionNoPhoto
      ? [
          {
            rowId: 'legacy-row',
            pestName: constructionNoPhoto.targetPests,
            chemicalName: constructionNoPhoto.chemicals,
            treatmentMethodName: constructionNoPhoto.treatmentMethod,
            chemicalAmount: constructionNoPhoto.chemicalAmount,
            notes: constructionNoPhoto.notes
          }
        ]
      : [];
  const activityCells = constructionNoPhoto
    ? [
        ...constructionNoPhoto.pestActivityRows.filter((row) => row.pestName.trim()),
        ...Array.from({ length: 4 }, () => ({ pestName: '', level: '' as const }))
      ].slice(0, 4)
    : [];
  const fileName = `${currentReport.title || 'report'}.pdf`;
  const reportLocation = currentReport.address || currentReport.locationName || '未入力';
  const excelTreatmentRows = Array.from({ length: 6 }, (_, index) => treatmentRows[index] ?? {
    rowId: `excel-empty-${index}`,
    pestName: '',
    chemicalName: '',
    treatmentMethodName: '',
    chemicalAmount: '',
    notes: ''
  });

  function getPreviewPages(variant?: 'pdf1' | 'pdf2') {
    const selector = variant ? `.pdf-page[data-pdf-variant="${variant}"]` : '.pdf-page';
    return Array.from(previewRef.current?.querySelectorAll<HTMLElement>(selector) ?? []);
  }

  function renderPdfPage(content: ReactNode, key?: string) {
    return (
      <div
        className="pdf-page-shell"
        key={key}
        style={{
          width: `${pdfPageWidth * previewScale}px`,
          height: `${1123 * previewScale}px`
        }}
      >
        <div
          className="pdf-page-scale"
          style={{
            transform: `scale(${previewScale})`
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  async function sharePdf(variant?: 'pdf1' | 'pdf2') {
    setMessage('');
    setCreating(true);
    try {
      const pages = getPreviewPages(variant);
      const blob = await getPdfPagesBlob(pages);
      const file = new File([blob], variant ? `${currentReport.title || 'report'}-${variant}.pdf` : fileName, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: currentReport.title });
      } else {
        await downloadPdfPages(pages, file.name);
      }
    } catch {
      setMessage(errors.pdf);
    } finally {
      setCreating(false);
    }
  }

  async function downloadPdf(variant?: 'pdf1' | 'pdf2') {
    setMessage('');
    setCreating(true);
    try {
      await downloadPdfPages(getPreviewPages(variant), variant ? `${currentReport.title || 'report'}-${variant}.pdf` : fileName);
    } catch {
      setMessage(errors.pdf);
    } finally {
      setCreating(false);
    }
  }

  function renderPdfActions() {
    return (
      <>
        <PrimaryButton icon={<Edit3 size={18} />} variant="secondary" onClick={() => navigate(`/report-form/${currentReport.reportId}/edit`)}>
          入力画面に戻る
        </PrimaryButton>
        {isConstructionNoPhotoTemplate ? (
          <>
            <PrimaryButton icon={<Download size={18} />} onClick={() => downloadPdf('pdf1')} disabled={creating}>
              PDF1ダウンロード
            </PrimaryButton>
            <PrimaryButton icon={<Download size={18} />} onClick={() => downloadPdf('pdf2')} disabled={creating}>
              PDF2ダウンロード
            </PrimaryButton>
            <PrimaryButton icon={<Share2 size={18} />} variant="secondary" onClick={() => sharePdf('pdf2')} disabled={creating}>
              PDF2共有
            </PrimaryButton>
          </>
        ) : (
          <>
            <PrimaryButton icon={<Download size={18} />} onClick={() => downloadPdf()} disabled={creating}>
              PDFダウンロード
            </PrimaryButton>
            <PrimaryButton icon={<Share2 size={18} />} variant="secondary" onClick={() => sharePdf()} disabled={creating}>
              共有
            </PrimaryButton>
          </>
        )}
      </>
    );
  }

  return (
    <main className="app-shell">
      <header className="subpage-header row-header">
        <h1>PDF確認</h1>
        <HeaderNavButton target="home" />
      </header>
      {message ? <p className="alert">{message}</p> : null}
      {creating ? <p className="hint">PDFを作成しています。</p> : null}
      <div className="action-bar pdf-top-action-bar">
        {renderPdfActions()}
      </div>
      <section className="pdf-preview" ref={previewRef}>
        {isConstructionNoPhotoTemplate && constructionNoPhoto ? (
          <>
            <div className="pdf-variant-label">PDF1</div>
            {renderPdfPage(<div className={`pdf-page pdf-management-page reference-management-page ${summaryCompactClassName}`.trim()} data-pdf-variant="pdf1">
              <div className="management-fixed-area">
                <div className="management-legal-note">「ビル管理法」・「食品衛生法」・「労働安全衛生法」に定められる備付帳簿用</div>
                <div className="management-title-row">
                  <div className="management-title-main">
                    <h2>防除作業管理報告書</h2>
                  </div>
                  <div className="management-right-head">
                    <div className="management-copy-type">{copyTypeLabel(constructionNoPhoto.copyType)}</div>
                    <div className="management-report-date">{formatDate(constructionNoPhoto.reportCreatedDate)}</div>
                    <div className="company-seal-box" aria-label="会社印欄" />
                  </div>
                </div>
                <div className="management-head-grid">
                  <div className="management-left-head">
                    <div className="management-addressee">
                      <strong>{constructionNoPhoto.addressee || ' '}</strong>
                      <span>{honorificLabel(constructionNoPhoto.honorific)}</span>
                    </div>
                    <table className="management-responsible-table">
                      <tbody>
                        <tr>
                          <th>管理責任者</th>
                          <td>{constructionNoPhoto.managementResponsibleName}</td>
                        </tr>
                        <tr>
                          <th>作業責任者</th>
                          <td>{constructionNoPhoto.workResponsibleName}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="management-intro">毎度お取引に預り有難うございます。下記の通り作業完了いたしましたので結果と共に報告致します。</p>
                <table className="management-meta-table">
                  <tbody>
                    <tr>
                      <th>施工日時</th>
                      <td>{formatDate(constructionNoPhoto.reportCreatedDate)}</td>
                      <th>作業時間</th>
                      <td>{constructionNoPhoto.workStartTime} から {constructionNoPhoto.workEndTime}</td>
                    </tr>
                    <tr>
                      <th>施工場所</th>
                      <td colSpan={3}>{reportLocation}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3 className="management-section-title">施工内容</h3>
              <table className="management-table management-treatment-table">
                <thead>
                  <tr>
                    <th>対象害虫獣</th>
                    <th>使用薬剤</th>
                    <th>処理方法</th>
                    <th>薬剤使用量</th>
                    <th>備考</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentRows.map((row) => (
                    <tr key={row.rowId}>
                      <td>{row.pestName}</td>
                      <td>{row.chemicalName}</td>
                      <td>{row.treatmentMethodName}</td>
                      <td>{row.chemicalAmount}</td>
                      <td>{row.notes || ' '}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <section className="management-summary">
                <h3>作業内容摘要</h3>
                <p className="pre-line">{constructionNoPhoto.workSummary || currentReport.content}</p>
              </section>
              <h3 className="management-section-title">生息状況</h3>
              <table className="management-activity-table">
                <tbody>
                  <tr>
                    {activityCells.map((row, index) => (
                      <th key={`activity-pest-${index}`}>{row.pestName || ' '}</th>
                    ))}
                  </tr>
                  <tr>
                    {activityCells.map((row, index) => (
                      <td key={`activity-level-${index}`}>{row.level || ' '}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>)}
            <div className="pdf-variant-label">PDF2</div>
            {renderPdfPage(<div className="pdf-page excel-report-page" data-pdf-variant="pdf2">
              <div className="excel-grid">
                <div className="excel-cell excel-note">「ビル管理法」・「食品衛生法」・「労働安全衛生法」に定める備付帳簿用</div>
                <div className="excel-cell excel-title">防 除 作 業 完 了 報 告 書</div>
                <div className="excel-cell excel-copy">{copyTypeLabel(constructionNoPhoto.copyType)}</div>
                <div className="excel-cell excel-addressee">{constructionNoPhoto.addressee || ' '}</div>
                <div className="excel-cell excel-honorific">{honorificLabel(constructionNoPhoto.honorific)}</div>
                <div className="excel-cell excel-label excel-manager-label">管理責任者</div>
                <div className="excel-cell excel-value excel-manager-value">{constructionNoPhoto.managementResponsibleName}</div>
                <div className="excel-cell excel-label excel-worker-label">作業責任者</div>
                <div className="excel-cell excel-value excel-worker-value">{constructionNoPhoto.workResponsibleName}</div>
                <div className="excel-cell excel-label excel-staff-label">作業員</div>
                <div className="excel-cell excel-value excel-staff-value">{constructionNoPhoto.workResponsibleName}</div>
                <div className="excel-cell excel-intro">毎度お引立に預り有難うございます。下記の通り作業完了いたしましたので結果と共に報告いたします。</div>
                <div className="excel-cell excel-label excel-date-label">施　工　日　時</div>
                <div className="excel-cell excel-value excel-date-value">{formatDate(constructionNoPhoto.reportCreatedDate)}</div>
                <div className="excel-cell excel-label excel-time-label">作業時間</div>
                <div className="excel-cell excel-value excel-time-value">{constructionNoPhoto.workStartTime}</div>
                <div className="excel-cell excel-wave">～</div>
                <div className="excel-cell excel-value excel-time-end">{constructionNoPhoto.workEndTime}</div>
                <div className="excel-cell excel-label excel-place-label">施　工　場　所</div>
                <div className="excel-cell excel-value excel-place-value">{reportLocation}</div>
                <div className="excel-cell excel-section excel-treatment-title">施　　工　　内　　容</div>
                <div className="excel-cell excel-head excel-pest-head">対 象 害 虫</div>
                <div className="excel-cell excel-head excel-chemical-head">使 用 薬 剤</div>
                <div className="excel-cell excel-head excel-method-head">処 理 方 法</div>
                <div className="excel-cell excel-head excel-amount-head">薬 剤 使 用 量</div>
                <div className="excel-cell excel-head excel-notes-head">備      考</div>
                {excelTreatmentRows.map((row, index) => (
                  <div className="excel-treatment-row" key={row.rowId}>
                    <div className="excel-cell excel-value excel-row-pest" style={{ gridRow: `${19 + index} / ${20 + index}` }}>{row.pestName || ' '}</div>
                    <div className="excel-cell excel-value excel-row-chemical" style={{ gridRow: `${19 + index} / ${20 + index}` }}>{row.chemicalName || ' '}</div>
                    <div className="excel-cell excel-value excel-row-method" style={{ gridRow: `${19 + index} / ${20 + index}` }}>{row.treatmentMethodName || ' '}</div>
                    <div className="excel-cell excel-value excel-row-amount" style={{ gridRow: `${19 + index} / ${20 + index}` }}>{row.chemicalAmount || ' '}</div>
                    <div className="excel-cell excel-value excel-row-notes" style={{ gridRow: `${19 + index} / ${20 + index}` }}>{row.notes || ' '}</div>
                  </div>
                ))}
                <div className="excel-cell excel-summary">
                  <p className="pre-line">{constructionNoPhoto.workSummary || currentReport.content}</p>
                </div>
                <div className="excel-cell excel-section excel-activity-title">生　　息　　状　　況</div>
                {activityCells.map((row, index) => (
                  <div className="excel-cell excel-head excel-activity-pest" style={{ gridColumn: `${2 + index * 10} / ${12 + index * 10}` }} key={`excel-activity-pest-${index}`}>
                    {row.pestName || ' '}
                  </div>
                ))}
                {activityCells.map((row, index) => (
                  <div className="excel-cell excel-value excel-activity-level" style={{ gridColumn: `${2 + index * 10} / ${12 + index * 10}` }} key={`excel-activity-level-${index}`}>
                    {row.level || ' '}
                  </div>
                ))}
                <div className="excel-footer-text">上記の通り実施いたしました。</div>
                <div className="excel-cell excel-head excel-effect-label">効果判定</div>
                <div className="excel-cell excel-value excel-effect-value">-　・　+　・　++　・　+++</div>
              </div>
            </div>)}
          </>
        ) : (
          <>
        {renderPdfPage(<div className="pdf-page pdf-cover-page">
          <div className="pdf-page-header">
            <strong>SEIBU SHODOKU</strong>
            <span>Cover</span>
          </div>
          <div className="pdf-cover-title">
            <p>{reportTypeLabel(currentReport.reportType)}</p>
            <h2>{currentReport.title}</h2>
          </div>
          {usesImages ? (
            <div className="pdf-cover-image">
              {currentReport.coverImageUrl ? (
                <DriveImage
                  driveFileId={currentReport.coverDriveFileId}
                  fallbackSrc={currentReport.coverImageUrl}
                  alt="施工現場全景"
                />
              ) : (
                <span>施工現場全景</span>
              )}
            </div>
          ) : null}
          <dl className="pdf-cover-meta">
            <dt>作業日</dt>
            <dd>{formatDate(currentReport.workDate)}</dd>
            <dt>作業場所</dt>
            <dd>{reportLocation}</dd>
            <dt>報告者</dt>
            <dd>{currentReport.reporterName}</dd>
            <dt>所属支店</dt>
            <dd>{currentReport.branchName || '未設定'}</dd>
          </dl>
          <footer className="pdf-cover-footer">
            <span>Submitted report prepared for customer review</span>
            <strong>西武消毒</strong>
          </footer>
        </div>, 'cover')}
        {renderPdfPage(<div className="pdf-page pdf-report-page">
          <div className="pdf-page-header">
            <strong>SEIBU SHODOKU</strong>
            <span>Report</span>
          </div>
          <h2>報告内容</h2>
          <dl className="pdf-meta-list">
            <dt>作業日</dt>
            <dd>{formatDate(currentReport.workDate)}</dd>
            <dt>作業場所</dt>
            <dd>{reportLocation}</dd>
          </dl>
          <section className="pdf-text-section">
            <h3>本文</h3>
            <p className="pre-line">{currentReport.content}</p>
          </section>
          <section className="pdf-text-section">
            <h3>備考</h3>
            <p className="pre-line">{currentReport.remarks || ' '}</p>
          </section>
        </div>, 'report')}
        {usesImages && currentReport.photos.length > 0
          ? chunkPhotos(currentReport.photos, photosPerPage).map((photoPage, pageIndex) => (
              renderPdfPage(<div className="pdf-page pdf-photo-page">
                <div className="pdf-page-header">
                  <strong>SEIBU SHODOKU</strong>
                  <span>Photos {pageIndex + 1}</span>
                </div>
                <h2>写真記録</h2>
                <div className="photo-page">
                  {photoPage.map((photo, index) => {
                    const photoNumber = pageIndex * photosPerPage + index + 1;
                    return (
                      <figure key={photo.photoId}>
                        <figcaption>
                          <strong>写真 {photoNumber}</strong>
                          <span>{photo.description || '写真説明'}</span>
                        </figcaption>
                        <DriveImage driveFileId={photo.driveFileId} fallbackSrc={photo.imageUrl} alt={photo.description || '報告書写真'} />
                      </figure>
                    );
                  })}
                </div>
              </div>, `photo-page-${pageIndex}`)
            ))
          : null}
          </>
        )}
      </section>
      <div className="action-bar">
        {renderPdfActions()}
      </div>
    </main>
  );
}
