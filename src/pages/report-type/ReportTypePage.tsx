import { ClipboardList, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ReportTypePage() {
  const navigate = useNavigate();

  return (
    <main className="app-shell">
      <header className="subpage-header">
        <h1>報告書種別</h1>
      </header>
      <div className="choice-list">
        <button onClick={() => navigate('/photo-type/investigation')}>
          <ClipboardList />
          調査報告書
        </button>
        <button onClick={() => navigate('/photo-type/construction')}>
          <Hammer />
          施工報告書
        </button>
      </div>
    </main>
  );
}
