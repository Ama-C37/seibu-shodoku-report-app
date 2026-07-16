import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { Branch } from '../../models/branch';
import { findBranch, saveBranch } from '../../repositories/branchRepository';

export function AdminBranchFormPage() {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const isEdit = Boolean(branchId);
  const [existing, setExisting] = useState<Branch | null>(null);
  const [loaded, setLoaded] = useState(!isEdit);
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!branchId) return;
    let active = true;
    findBranch(branchId).then((branch) => {
      if (!active) return;
      setExisting(branch);
      setBranchName(branch?.branchName ?? '');
      setAddress(branch?.address ?? '');
      setPhoneNumber(branch?.phoneNumber ?? '');
      setIsActive(branch?.isActive ?? true);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [branchId]);

  if (loaded && isEdit && !existing) return <Navigate to="/admin/branches" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    if (!branchName.trim()) {
      setMessage('支店名を入力してください。');
      setSaving(false);
      return;
    }

    const now = new Date().toISOString();
    await saveBranch({
      branchId: existing?.branchId ?? crypto.randomUUID(),
      branchName: branchName.trim(),
      address: address.trim(),
      phoneNumber: phoneNumber.trim(),
      isActive,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    });
    navigate('/admin/branches');
  }

  return (
    <AdminLayout title={isEdit ? '支店編集' : '支店追加'}>
      {!loaded ? <p className="muted-text">読み込み中...</p> : null}
      <form className="form-stack admin-form" onSubmit={submit}>
        {message ? <p className="alert">{message}</p> : null}
        <label>
          支店名
          <input value={branchName} onChange={(event) => setBranchName(event.target.value)} />
        </label>
        <label>
          住所
          <input value={address} onChange={(event) => setAddress(event.target.value)} />
        </label>
        <label>
          電話番号
          <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          有効
        </label>
        <div className="action-bar">
          <PrimaryButton type="submit" disabled={saving || !loaded}>保存</PrimaryButton>
          <PrimaryButton type="button" variant="secondary" onClick={() => navigate('/admin/branches')}>
            キャンセル
          </PrimaryButton>
        </div>
      </form>
    </AdminLayout>
  );
}
