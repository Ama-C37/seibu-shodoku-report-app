import { useEffect, useState } from 'react';
import { Plus, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { Branch } from '../../models/branch';
import { findBranches } from '../../repositories/branchRepository';

export function AdminBranchesPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    findBranches()
      .then((items) => {
        if (active) setBranches(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout title="支店管理">
      <div className="admin-toolbar">
        <PrimaryButton icon={<Plus size={18} />} onClick={() => navigate('/admin/branches/new')}>
          支店追加
        </PrimaryButton>
      </div>
      {loading ? <p className="muted-text">読み込み中...</p> : null}
      <div className="admin-table admin-branches-table">
        <div className="admin-table-row admin-table-head">
          <span>支店名</span>
          <span>住所</span>
          <span>電話番号</span>
          <span>状態</span>
          <span></span>
        </div>
        {branches.map((branch) => (
          <div className="admin-table-row" key={branch.branchId}>
            <span>{branch.branchName}</span>
            <span>{branch.address || '未設定'}</span>
            <span>{branch.phoneNumber || '未設定'}</span>
            <span>{branch.isActive ? '有効' : '無効'}</span>
            <button className="text-button" onClick={() => navigate(`/admin/branches/${branch.branchId}/edit`)}>
              <SquarePen size={16} />
              編集
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
