import { useEffect, useState } from 'react';
import { Plus, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { AppUser } from '../../models/appUser';
import { findUsers } from '../../repositories/userRepository';

function roleLabel(role: AppUser['role']) {
  if (role === 'admin') return '管理者';
  if (role === 'branch_manager') return '支店長';
  return '現場担当者';
}

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    findUsers()
      .then((items) => {
        if (active) setUsers(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout title="社員管理">
      <div className="admin-toolbar">
        <PrimaryButton icon={<Plus size={18} />} onClick={() => navigate('/admin/users/new')}>
          社員追加
        </PrimaryButton>
      </div>
      {loading ? <p className="muted-text">読み込み中...</p> : null}
      <div className="admin-table">
        <div className="admin-table-row admin-table-head">
          <span>名前</span>
          <span>メール</span>
          <span>支店</span>
          <span>権限</span>
          <span>状態</span>
          <span></span>
        </div>
        {users.map((user) => (
          <div className="admin-table-row" key={user.userId}>
            <span>{user.name}</span>
            <span>{user.email || '未設定'}</span>
            <span>{user.branchName || '未設定'}</span>
            <span>{roleLabel(user.role)}</span>
            <span>{user.isActive ? '有効' : '無効'}</span>
            <button className="text-button" onClick={() => navigate(`/admin/users/${user.userId}/edit`)}>
              <SquarePen size={16} />
              編集
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
