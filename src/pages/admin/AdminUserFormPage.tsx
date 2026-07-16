import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { AppUser } from '../../models/appUser';
import type { Branch } from '../../models/branch';
import { findBranches } from '../../repositories/branchRepository';
import { findUser, saveUser } from '../../repositories/userRepository';
import { useAuthStore } from '../../stores/authStore';

export function AdminUserFormPage() {
  const navigate = useNavigate();
  const updateCurrentUser = useAuthStore((store) => store.updateCurrentUser);
  const { userId } = useParams();
  const isEdit = Boolean(userId);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [existing, setExisting] = useState<AppUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState('');
  const [role, setRole] = useState<AppUser['role']>('worker');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([findBranches(), userId ? findUser(userId) : Promise.resolve(null)]).then(([items, user]) => {
      if (!active) return;
      const defaultBranchId = items[0]?.branchId ?? '';
      setBranches(items);
      setExisting(user);
      setName(user?.name ?? '');
      setEmail(user?.email ?? '');
      setBranchId(user?.branchId || defaultBranchId);
      setRole(user?.role ?? 'worker');
      setIsActive(user?.isActive ?? true);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (loaded && isEdit && !existing) return <Navigate to="/admin/users" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const selectedBranch = branches.find((branch) => branch.branchId === branchId);
    if (!name.trim()) {
      setMessage('名前を入力してください。');
      setSaving(false);
      return;
    }
    if (!email.trim()) {
      setMessage('メールアドレスを入力してください。');
      setSaving(false);
      return;
    }

    const now = new Date().toISOString();
    const user: AppUser = {
      userId: existing?.userId ?? crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      branchId,
      branchName: selectedBranch?.branchName ?? '',
      role,
      isActive,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await saveUser(user);
    updateCurrentUser(user);
    navigate('/admin/users');
  }

  return (
    <AdminLayout title={isEdit ? '社員編集' : '社員追加'}>
      {!loaded ? <p className="muted-text">読み込み中...</p> : null}
      <form className="form-stack admin-form" onSubmit={submit}>
        {message ? <p className="alert">{message}</p> : null}
        <label>
          名前
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          所属支店
          <select value={branchId} onChange={(event) => setBranchId(event.target.value)}>
            {branches.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </label>
        <label>
          権限
          <select value={role} onChange={(event) => setRole(event.target.value as AppUser['role'])}>
            <option value="worker">現場担当者</option>
            <option value="branch_manager">支店長</option>
            <option value="admin">管理者</option>
          </select>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          有効
        </label>
        <div className="action-bar">
          <PrimaryButton type="submit" disabled={saving || !loaded}>保存</PrimaryButton>
          <PrimaryButton type="button" variant="secondary" onClick={() => navigate('/admin/users')}>
            キャンセル
          </PrimaryButton>
        </div>
      </form>
    </AdminLayout>
  );
}
