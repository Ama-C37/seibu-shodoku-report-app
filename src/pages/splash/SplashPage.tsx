import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { appName } from '../../utils/constants';
import { useAuthStore } from '../../stores/authStore';

export function SplashPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate(user ? '/home' : '/login', { replace: true });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [navigate, user]);

  return (
    <main className="splash page-center">
      <FileText size={72} />
      <h1>{appName}</h1>
      <div className="spinner" />
    </main>
  );
}
