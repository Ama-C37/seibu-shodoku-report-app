# 西武消毒 現場報告書作成支援Webアプリ 仕様書

## 1. 目的

現場担当者がスマートフォンのブラウザから、報告書作成、写真添付、GPS住所取得、AI添削、PDF出力、PDF共有まで完了できるWebアプリを作る。

管理者は同じWebアプリ内の`/admin`から、社員情報、支店情報、権限情報を管理できるようにする。管理者機能は将来別アプリへ分離する可能性があるため、現場機能とは分離して実装する。

## 2. 対象環境

- iOS Safari
- Android Chrome
- PCブラウザ

スマートフォン利用を主対象にしつつ、管理者ページはPCでも操作しやすい構成にする。

## 3. 使用技術

- React
- TypeScript
- Vite
- React Router
- Zustand
- jsPDF
- html2canvas
- browser-image-compression
- lucide-react
- Firebase Authentication
- Cloud Firestore
- Google Drive API
- OpenAI API

Firebase Storageは使用しない。写真と表紙画像は、Google Drive APIを使ってログインしたGoogleアカウントの個人Driveへ保存する。Firestoreには画像本体を保存せず、Driveの`fileId`などの参照情報を保存する。

OpenAI APIは今後接続する。本番ではOpenAI APIキーをフロントエンドへ置かず、Firebase Functions、Cloud Run、または別サーバー経由で呼び出す。

Firebase接続設定は`.env`の`VITE_FIREBASE_*`環境変数から読み込む。実際の値はリポジトリへ直接書かず、`.env.example`にはキー名のみを記載する。
Google Drive接続設定は`.env`の`VITE_GOOGLE_CLIENT_ID`から読み込む。確認用URLを変える場合は、Google Cloud ConsoleのOAuthクライアントに承認済みJavaScript生成元を追加する。

## 4. 現在実装済み

### 現場アプリ

- ログイン画面
- ログインせず利用
- ホーム画面
- `/home`からログイン画面へ戻るボタン
- `/home`より先の現場ページからホームへ戻るボタン
- 報告書種別選択
- 写真有無選択
- 報告書入力
- 表紙画像追加、変更、削除
- GPS住所取得
- 報告者名、所属支店の自動入力
- 写真追加
- 写真説明入力
- 写真削除
- 画像圧縮
- AI添削画面
- AI添削の仮ロジック
- AI添削採用履歴のlocalStorage保存
- 下書き保存
- 提出済み保存
- 下書き一覧
- 提出済み一覧
- 一覧から既存報告書を直接編集
- 既存報告書の上書き保存
- PDF確認画面
- PDFダウンロード
- Web Share API共有
- 施工報告書・写真なしの防除作業管理報告書1枚PDF
- 設定画面
- PWA manifest
- Firebase Authenticationメール/パスワードログイン
- Firestore `users`との照合によるログイン制御
- Firestore `users`の`role`による管理者制御
- Firestore `users`の`role: branch_manager`による支店長設定
- 管理者ページの社員追加・編集で、管理者、支店長、現場担当者の権限を設定
- 社員の所属支店`branchId`と支店長の所属支店`branchId`による支店長紐づけ
- Firestore `branches`、`reports`、`ai_corrections`保存
- Google Drive APIへの表紙画像、報告書写真アップロード
- Google Drive画像のDrive API Blob取得表示
- Android Chromeでのログイン、Drive認可、画像アップロード、PDF画像表示確認
- 施工報告書・写真なしの管理責任者は、作成者の所属支店に紐づく支店長を自動入力
- 支店や支店長を追加した場合も、同じ支店に所属する`role: branch_manager`の社員を管理責任者として扱う
- 施工内容マスタにより、対象害虫獣、使用薬剤、処理方法を管理者ページから追加・変更
- 施工報告書・写真なしの施工内容は複数行入力に対応
- 施工内容1行は、対象害虫獣、使用薬剤、処理方法、薬剤使用量、備考を1セットとして扱う
- 施工報告書・写真なしの生息状況は、施工内容で選択された対象害虫獣を自動反映
- 施工内容の複数行で同じ対象害虫獣が選択された場合、生息状況では1行に統合
- 生息状況の対象害虫獣名は施工内容側を正とし、ユーザーは生息判定のみ`-`、`＋`、`＋＋`から選択
- Android端末で写真なし施工報告書の施工内容複数行、生息状況自動反映、PDF出力を確認済み
- Firestore `reports`保存内容を`scripts/verifyReports.mjs`で確認済み
- Firestore確認結果は`reports=7, issues=0`

### PDF仕様

- 表紙ページ、報告ページ、写真ページに分割
- 表紙ページに報告書タイトル、報告書種別、施工現場全景画像、作業日、作業場所、住所、報告者、所属支店を表示
- 表紙画像は枠内に全体が収まるように表示し、切り抜かない
- 表紙画像の余白背景と枠線は表示しない
- 報告ページには作業日、作業場所、住所、本文、備考を表示
- 報告ページには報告書種別を表示しない
- 写真ページは1ページ6枚、2列×3段で表示
- 7枚目から2ページ目、13枚目から3ページ目として自動改ページ
- PDF確認画面のA4紙面をhtml2canvasで画像化し、jsPDFでPDF化

### 管理者ページ

- `/admin`管理者ホーム
- `/admin/users`社員一覧
- `/admin/users/new`社員追加
- `/admin/users/:userId/edit`社員編集
- `/admin/branches`支店一覧
- `/admin/branches/new`支店追加
- `/admin/branches/:branchId/edit`支店編集
- 管理者ページ入口を管理者ログイン時のみ`/home`に表示
- 社員情報は`userRepository`へ分離
- 支店情報は`branchRepository`へ分離
- 管理者判定は`adminGuardService`へ集約
- 管理者UIは`components/admin`へ分離

### 支店長ロールと管理責任者自動入力

- 社員ロールは`admin`、`branch_manager`、`worker`の3種類
- 画面表示ではそれぞれ管理者、支店長、現場担当者として扱う
- 支店長はFirestore `users`で`role: branch_manager`として保存する
- 支店長も通常社員と同じく`branchId`と`branchName`を持つ
- 写真なし施工報告書の作成時は、ログイン中ユーザーの`branchId`を基準に同じ支店の支店長を検索する
- 見つかった支店長の氏名を、写真なし施工報告書の管理責任者欄へ自動入力する
- 今後、支店や支店長を追加する場合は、支店長ユーザーの所属支店を正しく設定すれば報告書作成者の支店と自動で紐づく
- 同じ支店に支店長が複数いる場合の優先順位は未定。現状は最初に取得できた有効な支店長を使用する

## 5. 現在の仮実装

- Firebase未設定時の認証はlocalStorageベース
- Firebase環境変数が設定済みの場合、ログイン処理はFirebase Authenticationのメール/パスワード認証を使用する
- Firebase未設定時のみ社員、支店、報告書、AI添削履歴はlocalStorage保存
- 登録済み社員のメールアドレスでログインした場合は、社員管理に登録された名前、支店、権限を使用
- AI添削はOpenAI API未接続の仮ロジック
- PDF自体のGoogle Drive自動保存は未実装
- Google Drive画像削除、差し替え時は、当面Google Drive上の古いファイルを自動削除しない

## 6. これから実装するもの

### 優先度高

- Firestoreセキュリティルール
- OpenAI APIをサーバー経由で呼ぶ実装
- 初回パスワード作成フロー
- 一般ユーザー、管理者、無効ユーザーの権限制御確認
- iOS Safariでのカメラ、GPS、PDF共有確認

### 優先度中

- 写真のドラッグ並び替え
- Google Drive内の未参照画像を管理者が確認して削除する整理機能
- PDF自体のGoogle Drive保存
- PDF生成後のPDF保存
- オフライン保存データとFirestoreの同期
- PWA Service Worker対応
- 管理者ページの検索、絞り込み
- 社員・支店の削除ではなく無効化運用の徹底

### 優先度低

- 承認フロー
- 差戻し機能
- 通知機能
- 案件管理
- 複数テンプレート管理
- Excel出力
- 写真からの自動説明文生成
- 音声入力

## 7. 初回パスワード作成フロー案

ログイン時のパスワード作成について相談があった場合は、以下の案1と案2を再度提示する。

### 案1: Firebase Authenticationで実装

本番運用ではこの案を優先する。

- 管理者が社員情報を登録
- 社員のメールアドレスへ初回ログイン用リンク、またはパスワード設定リンクを送信
- 初回アクセス時だけパスワード作成画面を表示
- 2回目以降はメールアドレスとパスワードで通常ログイン
- Firestoreの`users`に`passwordInitialized`などの初回設定済みフラグを持たせる
- パスワード自体はFirestoreやlocalStorageへ保存しない

### 案2: localStorageで仮実装

Firebase連携前の画面フロー確認用としてのみ使用する。

- 管理者が社員管理で社員を登録
- 社員にパスワード未設定フラグを持たせる
- 初回ログイン時だけパスワード作成画面へ遷移
- パスワード設定後、2回目以降は通常ログイン扱い
- 本番ではlocalStorageに本物のパスワードを保存しない
- Firebase連携時に案1へ置き換える

## 8. 管理者機能の実装方針

案1として、まずは同じWebアプリ内に`/admin`配下の管理者ページを作る。

将来案2として管理者専用Webアプリへ移行できるよう、以下を守る。

- 管理者ページは`src/pages/admin/`にまとめる
- 管理者コンポーネントは`src/components/admin/`にまとめる
- 社員情報は`userRepository`へ集約する
- 支店情報は`branchRepository`へ集約する
- 管理者判定は`adminGuardService`へ集約する
- 現場画面のコンポーネントに管理者処理を混ぜない
- 管理者だけ使う状態管理を全体ストアへ強く依存させない
- 支店・社員データ操作を各画面に直書きしない
- `/home`や設定画面に管理機能を直接埋め込まない

## 9. Google Drive画像運用

Firebase Storageは使用しない。表紙画像と報告書写真はGoogle Drive APIでGoogle Driveへ保存し、Firestore `reports`には画像本体ではなくDrive参照情報を保存する。

### 差し替え・削除時の方針

当面は、アプリ内で表紙画像や報告書写真を差し替え・削除しても、Google Drive上の元ファイルは自動削除しない。

1. 現段階では自動削除しない
   - 差し替えた画像もGoogle Driveに残す
   - Firestore `reports` には最新画像のDrive参照だけ保存する
   - アプリ上の削除はFirestoreの参照を外すだけにする
2. 後続で不要画像整理機能を作る
   - Firestoreの全報告書で使われている`driveFileId`を集計する
   - Google Drive内の画像一覧と比較する
   - どの報告書からも参照されていない画像だけを削除候補として表示する
   - 管理者が確認してから削除する
3. 本番前に保存期間ルールを決める
   - 例: 差し替え前画像は90日残す
   - 例: 提出済み報告書に一度使った画像は削除しない
   - 例: 下書きだけで使われた古い画像は30日後に整理対象にする

この方針によりDrive容量は消費するが、MVP段階では誤削除による報告書画像の欠損を避けることを優先する。

## 10. データモデル

### AppUser

```ts
export type AppUser = {
  userId: string;
  name: string;
  email: string;
  branchId: string;
  branchName: string;
  role: 'admin' | 'branch_manager' | 'worker';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
```

### Branch

```ts
export type Branch = {
  branchId: string;
  branchName: string;
  address?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Report

```ts
export type Report = {
  reportId: string;
  reportType: 'investigation' | 'construction';
  photoType: 'with_photo' | 'without_photo';
  title: string;
  workDate: string;
  locationName: string;
  address: string;
  coverImageUrl?: string;
  coverDriveFileId?: string;
  coverDriveWebViewLink?: string;
  coverDriveThumbnailLink?: string;
  coverDriveMimeType?: string;
  coverDriveName?: string;
  latitude?: number;
  longitude?: number;
  reporterId: string;
  reporterName: string;
  branchId: string;
  branchName: string;
  content: string;
  correctedContent: string;
  remarks: string;
  status: 'draft' | 'submitted';
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  photos: ReportPhoto[];
};
```

運用上の扱い:

- 入力画面では旧「施工場所」欄を表示しない
- ユーザーは住所欄へ施工場所を入力する
- GPS取得結果も住所欄へ反映する
- 保存時は住所を`address`へ保存し、既存画面との互換性維持のため同じ値を`locationName`にも保存する
- PDF確認画面とPDF出力では、旧施工場所を表示せず、住所を「施工場所」として表示する
- 住所が空の古い報告書だけ、互換表示として`locationName`を施工場所に使用する

### ReportPhoto

```ts
export type ReportPhoto = {
  photoId: string;
  reportId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveThumbnailLink?: string;
  driveMimeType?: string;
  driveName?: string;
  description: string;
  sortOrder: number;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};
```

## 11. 写真なし施工報告書PDFレイアウト仕様

対象:

- `reportType: construction`
- `photoType: without_photo`

現在の方針:

- 参照元PDFに近い1枚帳票として表示・出力する
- PDF出力処理は現在のDOMキャプチャ方式を維持し、レイアウトのみHTML/CSSで調整する
- 施工内容より上の領域は固定座標で配置する
- タイトル、控、報告日、会社印、宛先、管理責任者、作業責任者、挨拶文、施工日時、作業時間、施工場所は個別に位置調整できる構造にする
- 宛先欄の幅は維持し、管理責任者・作業責任者の表だけを短くできるようにする
- 施工日時と作業時間は左右二等分の枠として表示する
- 施工内容と生息状況の表は、外枠を太線、内側セル線を通常線で統一する
- 生息状況は対象害虫獣名と判定値のみを表示し、「対象害虫獣」見出し列は表示しない

次回調整が必要な点:

- 現状の見た目で運用上問題ないため、構造整理と追加の長文摘要欄対応は後回し
- 将来、xlsx原本への再現度をさらに上げる場合は、固定座標、flex、tableが混在している現行構造をブロック単位へ整理する
