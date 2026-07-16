import { useEffect, useState } from 'react';
import { Bug, Building2, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { findBranches } from '../../repositories/branchRepository';
import { findUsers } from '../../repositories/userRepository';

export function AdminHomePage() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [branchCount, setBranchCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([findUsers(), findBranches()]).then(([users, branches]) => {
      if (!active) return;
      setUserCount(users.length);
      setBranchCount(branches.length);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout title="管理者ホーム">
      <div className="admin-summary-grid">
        <button className="admin-summary-card" onClick={() => navigate('/admin/users')}>
          <UsersRound />
          <span>社員</span>
          <strong>{userCount}名</strong>
        </button>
        <button className="admin-summary-card" onClick={() => navigate('/admin/branches')}>
          <Building2 />
          <span>支店</span>
          <strong>{branchCount}件</strong>
        </button>
        <button className="admin-summary-card" onClick={() => navigate('/admin/treatment-masters')}>
          <Bug />
          <span>施工内容マスタ</span>
          <strong>編集</strong>
        </button>
      </div>
    </AdminLayout>
  );
}
