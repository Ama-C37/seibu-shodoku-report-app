import { useState } from 'react';
import { Cloud } from 'lucide-react';

import { HeaderNavButton } from '../../components/HeaderNavButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { hasFirebaseConfig } from '../../services/firebaseService';
import {
  getGoogleDriveScope,
  hasGoogleDriveAccessToken,
  hasGoogleDriveConfig,
  prepareGoogleDriveReportFolder
} from '../../services/googleDriveService';
import { errors } from '../../utils/constants';

const managementResponsibleNameKey = 'seibu-report-management-responsible-name';

export function getStoredManagementResponsibleName() {
  return localStorage.getItem(managementResponsibleNameKey) ?? '';
}

export function SettingsPage() {
  const firebaseReady = hasFirebaseConfig();
  const googleDriveReady = hasGoogleDriveConfig();
  const [driveMessage, setDriveMessage] = useState('');
  const [checkingDrive, setCheckingDrive] = useState(false);
  const [googleDriveAuthorized, setGoogleDriveAuthorized] = useState(hasGoogleDriveAccessToken());
  const [managementResponsibleName, setManagementResponsibleName] = useState(getStoredManagementResponsibleName());
  const [settingsMessage, setSettingsMessage] = useState('');

  async function checkGoogleDrive() {
    setDriveMessage('');
    setCheckingDrive(true);
    try {
      const folder = await prepareGoogleDriveReportFolder('connection-test');
      setGoogleDriveAuthorized(hasGoogleDriveAccessToken());
      setDriveMessage(`Google Drive保存先の確認に成功しました。フォルダ: ${folder.name ?? folder.id}`);
    } catch {
      setDriveMessage(errors.drive);
    } finally {
      setCheckingDrive(false);
    }
  }

  function saveManagementResponsibleName() {
    localStorage.setItem(managementResponsibleNameKey, managementResponsibleName.trim());
    setSettingsMessage('管理責任者を保存しました。');
  }

  return (
    <main className="app-shell">
      <header className="subpage-header row-header">
        <h1>設定</h1>
        <HeaderNavButton target="home" />
      </header>
      <section className="settings-list">
        <article>
          <h2>OpenAI API</h2>
          <p>APIキーはフロントエンドに直接置かず、Firebase Functionsなどのサーバー側で管理します。</p>
        </article>
        <article>
          <h2>Firebase連携</h2>
          <p>
            {firebaseReady
              ? 'Firebase環境変数は設定済みです。AuthenticationとFirestoreを利用できます。'
              : 'Firebase環境変数は未設定です。MVP初期段階はローカル保存で動作します。'}
          </p>
        </article>
        <article>
          <h2>Google Drive連携</h2>
          <p>
            {googleDriveReady
              ? 'Google Drive OAuth Client IDは設定済みです。個人Google Driveへの画像アップロード検証を行えます。'
              : 'Google Drive OAuth Client IDは未設定です。画像は従来通りブラウザ内データとして保存します。'}
          </p>
          <p className="hint">使用スコープ: {getGoogleDriveScope()}</p>
          <p className="hint">認可状態: {googleDriveAuthorized ? '認可済み' : '未認可'}</p>
          {driveMessage ? <p className={driveMessage === errors.drive ? 'alert' : 'hint'}>{driveMessage}</p> : null}
          <PrimaryButton icon={<Cloud size={18} />} type="button" disabled={!googleDriveReady || checkingDrive} onClick={checkGoogleDrive}>
            Google Drive保存先確認
          </PrimaryButton>
        </article>
        <article>
          <h2>報告書設定</h2>
          <label>
            管理責任者
            <input value={managementResponsibleName} onChange={(event) => setManagementResponsibleName(event.target.value)} />
          </label>
          {settingsMessage ? <p className="hint">{settingsMessage}</p> : null}
          <PrimaryButton type="button" variant="secondary" onClick={saveManagementResponsibleName}>
            保存
          </PrimaryButton>
        </article>
      </section>
    </main>
  );
}
