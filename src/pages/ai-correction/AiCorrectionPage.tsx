import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { PrimaryButton } from '../../components/PrimaryButton';
import { correctReportText } from '../../services/aiCorrectionService';
import { saveAiCorrection } from '../../repositories/aiCorrectionRepository';
import { errors } from '../../utils/constants';

type LocationState = {
  text?: string;
  backTo?: string;
};

export function AiCorrectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { text, backTo } = (location.state ?? {}) as LocationState;
  const [corrected, setCorrected] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!backTo) return;
    correctReportText(text ?? '')
      .then(setCorrected)
      .catch(() => setMessage(errors.ai))
      .finally(() => setLoading(false));
  }, [backTo, text]);

  if (!backTo) return <Navigate to="/home" replace />;
  const currentBackTo = backTo;

  function adoptCorrection() {
    saveAiCorrection({
      correctionId: crypto.randomUUID(),
      originalText: text ?? '',
      correctedText: corrected,
      adoptedText: corrected,
      adopted: true,
      createdAt: new Date().toISOString()
    });
    navigate(currentBackTo, { state: { correctedText: corrected } });
  }

  return (
    <main className="app-shell">
      <header className="subpage-header">
        <h1>AI添削</h1>
      </header>
      {message ? <p className="alert">{message}</p> : null}
      {loading ? (
        <div className="page-center small">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <section className="correction-panel">
            <h2>添削後文章</h2>
            <p className="pre-line">{corrected}</p>
          </section>
          <div className="action-bar">
            <PrimaryButton icon={<Check size={18} />} onClick={adoptCorrection}>
              採用
            </PrimaryButton>
            <PrimaryButton icon={<X size={18} />} variant="secondary" onClick={() => navigate(currentBackTo)}>
              キャンセル
            </PrimaryButton>
          </div>
        </>
      )}
    </main>
  );
}
