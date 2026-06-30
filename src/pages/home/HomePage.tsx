import { FilePlus2, FolderOpen, Settings, SquareCheckBig } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { appName } from '../../utils/constants';
import { useAuthStore } from '../../stores/authStore';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">現場報告書作成支援</p>
          <h1>{appName}</h1>
        </div>
      </header>
      <section className="user-summary">
        <strong>{user?.name ?? '未ログイン'}</strong>
        <span>{user?.branchName || '所属支店未設定'}</span>
      </section>
      <nav className="menu-list">
        <button onClick={() => navigate('/report-type')}>
          <FilePlus2 />
          新規報告書作成
        </button>
        <button onClick={() => navigate('/report-list/draft')}>
          <FolderOpen />
          下書き一覧
        </button>
        <button onClick={() => navigate('/report-list/submitted')}>
          <SquareCheckBig />
          提出済み一覧
        </button>
        <button onClick={() => navigate('/settings')}>
          <Settings />
          設定
        </button>
      </nav>
    </main>
  );
}
