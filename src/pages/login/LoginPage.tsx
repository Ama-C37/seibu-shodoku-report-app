import { FormEvent, useState } from 'react';
import { LogIn, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PrimaryButton } from '../../components/PrimaryButton';
import { appName } from '../../utils/constants';
import { useAuthStore } from '../../stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const allowPasswordlessLogin = import.meta.env.VITE_ALLOW_PASSWORDLESS_LOGIN === 'true';

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/home', { replace: true });
    } catch (error) {
      setMessage(error instanceof Error && error.message === 'This user is inactive.'
        ? 'このアカウントは無効です。管理者に確認してください。'
        : 'ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>{appName}</h1>
        <form onSubmit={submit} className="form-stack">
          {message ? <p className="alert">{message}</p> : null}
          <label>
            メールアドレス
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={password}
              disabled={allowPasswordlessLogin}
              placeholder={allowPasswordlessLogin ? '一時確認モードでは不要' : ''}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {allowPasswordlessLogin ? <p className="hint">一時確認モード: 登録済みメールアドレスだけでログインできます。</p> : null}
          <PrimaryButton icon={<LogIn size={18} />} type="submit" disabled={loading}>
            ログイン
          </PrimaryButton>
          <PrimaryButton
            icon={<UserRound size={18} />}
            variant="secondary"
            type="button"
            disabled={loading}
            onClick={() => {
              continueAsGuest();
              navigate('/home', { replace: true });
            }}
          >
            ログインせず利用
          </PrimaryButton>
        </form>
      </section>
    </main>
  );
}
