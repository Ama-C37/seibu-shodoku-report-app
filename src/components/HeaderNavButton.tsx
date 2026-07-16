import { Home, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  target: 'home' | 'login';
};

export function HeaderNavButton({ target }: Props) {
  const navigate = useNavigate();
  const isLogin = target === 'login';

  return (
    <button className="header-nav-button" type="button" onClick={() => navigate(isLogin ? '/login' : '/home')}>
      {isLogin ? <LogIn size={18} /> : <Home size={18} />}
      <span>{isLogin ? 'ログイン画面へ' : 'ホームへ戻る'}</span>
    </button>
  );
}
