import { Bug, Building2, Home, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  children: ReactNode;
};

export function AdminLayout({ title, children }: Props) {
  const navigate = useNavigate();

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="eyebrow">管理者ページ</p>
          <h1>管理メニュー</h1>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>
            <Home size={18} />
            ホーム
          </NavLink>
          <NavLink to="/admin/users">
            <UsersRound size={18} />
            社員管理
          </NavLink>
          <NavLink to="/admin/branches">
            <Building2 size={18} />
            支店管理
          </NavLink>
          <NavLink to="/admin/treatment-masters">
            <Bug size={18} />
            施工内容マスタ
          </NavLink>
        </nav>
        <button className="text-button" onClick={() => navigate('/home')}>
          現場アプリへ戻る
        </button>
      </aside>
      <section className="admin-content">
        <header className="subpage-header">
          <h1>{title}</h1>
        </header>
        {children}
      </section>
    </main>
  );
}
