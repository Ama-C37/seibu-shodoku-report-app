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

  function submit(event: FormEvent) {
    event.preventDefault();
    signIn(email, password);
    navigate('/home', { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>{appName}</h1>
        <form onSubmit={submit} className="form-stack">
          <label>
            メールアドレス
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            パスワード
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <PrimaryButton icon={<LogIn size={18} />} type="submit">
            ログイン
          </PrimaryButton>
          <PrimaryButton
            icon={<UserRound size={18} />}
            variant="secondary"
            type="button"
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
