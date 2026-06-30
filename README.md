# 西武消毒 現場報告書作成支援Webアプリ MVP 開発仕様書

## 1. 開発目的

現場担当者がスマートフォンのブラウザから、調査報告書・施工報告書を作成し、写真添付、GPS取得、AI文章添削、PDF出力、PDF共有まで行えるWebアプリを開発する。

まずはMVPとして、現場担当者が1台のスマートフォンで報告書作成からPDF共有まで完了できる状態を目指す。

Flutterは使用しない。Webアプリとして開発し、必要に応じてPWA化してスマートフォンのホーム画面からアプリのように利用できる構成にする。

## 2. 開発対象

スマートフォン向けWebアプリ。

対応環境:

- iOS Safari
- Android Chrome
- PCブラウザ

MVPではスマートフォン利用を主対象とし、PCブラウザでも管理・確認しやすいレスポンシブUIにする。

## 3. 使用技術

### フロントエンド

- React
- TypeScript
- Vite
- React Router
- CSS Modules または Tailwind CSS
- PWA対応

### バックエンド

- Firebase Authentication
- Cloud Firestore
- Firebase Storage

### 外部API

- OpenAI API
  - 用途: 入力文章のAI添削
  - APIキーはフロントエンドに直接置かない
  - Firebase Functions、Cloud Run、または別サーバー経由で呼び出す

### ブラウザ機能

- カメラ/写真ライブラリ: `<input type="file" accept="image/*" capture>` を利用
- GPS位置情報: Geolocation API
- PDF生成: jsPDF、pdf-lib、または react-pdf
- PDF共有: Web Share API、未対応環境ではPDFダウンロード
- ローカル保存: IndexedDB または localStorage

## 4. MVPで実装する機能

### 4-1. ログイン機能

- メールアドレス・パスワードでログイン
- ログインせず利用も可能
- ログイン済みの場合、氏名・所属支店を報告書に自動入力
- 未ログイン利用時はローカル保存を基本とする

### 4-2. ホーム画面

表示内容:

- ロゴ
- ユーザー名
- 所属支店
- 新規報告書作成
- 下書き一覧
- 提出済み一覧
- 設定

### 4-3. 報告書種別選択

以下から選択できるようにする。

- 調査報告書
- 施工報告書

### 4-4. 写真有無選択

以下から選択できるようにする。

- 写真付き
- 写真なし

### 4-5. 報告書作成

共通入力項目:

- 報告書タイトル
- 作業日
- 作業場所
- 住所
- GPS取得位置
- 報告者名
- 所属支店
- 報告内容
- 備考

写真付きの場合:

- 写真追加
- 写真説明入力
- 写真削除
- 写真並び順管理
- 画像圧縮

写真なしの場合:

- 写真入力欄は表示しない

### 4-6. GPS取得

- Geolocation APIで現在地の緯度・経度を取得
- 取得ボタンを押すと位置情報を保存
- 取得失敗時はエラーメッセージを表示
- HTTPS環境で動作させる

### 4-7. AI添削

- 報告内容入力欄の文章をサーバー経由でOpenAI APIへ送信
- 添削後の文章を表示
- 「採用」ボタンで本文に反映
- 「キャンセル」ボタンで元に戻る

### 4-8. PDF出力

PDFは以下の形式で出力する。

表紙ページ:

- 報告書タイトル
- 報告書種別
- 作業日
- 作業場所
- 住所
- 報告者名
- 所属支店
- GPS情報
- 報告内容
- 備考

写真ページ:

- 1ページ4枚
- 2列×2段
- 各写真の上に写真説明欄
- 写真が4枚を超える場合は自動改ページ
- 写真なし報告書の場合、写真ページは作成しない

### 4-9. 保存機能

- 下書き保存
- 提出済み保存
- PDF生成後の保存
- MVP初期段階ではIndexedDBまたはlocalStorageへ保存
- Firebase連携後はFirestoreへ報告書データを保存
- Firebase Storageに写真とPDFを保存

### 4-10. PWA機能

- スマートフォンのホーム画面に追加できる
- アプリアイコンとアプリ名を設定する
- 最低限のオフライン起動に対応する
- オフライン時の保存はローカル保存とし、同期機能は将来拡張とする

## 5. 画面一覧

| 画面ID | 画面名 | 内容 |
| --- | --- | --- |
| SCR-001 | SplashPage | 起動・ログイン状態確認 |
| SCR-002 | LoginPage | ログイン・ログインせず利用 |
| SCR-003 | HomePage | ホーム |
| SCR-004 | ReportTypePage | 調査・施工の選択 |
| SCR-005 | PhotoTypePage | 写真付き・写真なし選択 |
| SCR-006 | ReportFormPage | 報告書入力 |
| SCR-007 | PhotoManagerPage | 写真管理 |
| SCR-008 | AiCorrectionPage | AI添削 |
| SCR-009 | PdfPreviewPage | PDF確認 |
| SCR-010 | ReportListPage | 報告書一覧 |
| SCR-011 | ReportDetailPage | 報告書詳細 |
| SCR-012 | SettingsPage | 設定 |

## 6. 画面遷移

```text
SplashPage
 ├─ ログイン済み → HomePage
 └─ 未ログイン → LoginPage

LoginPage
 ├─ ログイン成功 → HomePage
 └─ ログインせず利用 → HomePage

HomePage
 ├─ 新規作成 → ReportTypePage
 ├─ 下書き一覧 → ReportListPage
 ├─ 提出済一覧 → ReportListPage
 └─ 設定 → SettingsPage

ReportTypePage
 ├─ 調査報告書 → PhotoTypePage
 └─ 施工報告書 → PhotoTypePage

PhotoTypePage
 ├─ 写真付き → ReportFormPage
 └─ 写真なし → ReportFormPage

ReportFormPage
 ├─ 写真管理 → PhotoManagerPage
 ├─ AI添削 → AiCorrectionPage
 ├─ PDF確認 → PdfPreviewPage
 └─ 保存 → HomePage

ReportListPage
 └─ 報告書選択 → ReportDetailPage

ReportDetailPage
 ├─ 編集 → ReportFormPage
 └─ PDF表示 → PdfPreviewPage
```

## 7. Firestore設計

### users

```json
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "branchId": "string",
  "branchName": "string",
  "role": "worker",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### reports

```json
{
  "reportId": "string",
  "reportType": "investigation | construction",
  "photoType": "with_photo | without_photo",
  "title": "string",
  "workDate": "timestamp",
  "locationName": "string",
  "address": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "reporterId": "string",
  "reporterName": "string",
  "branchId": "string",
  "branchName": "string",
  "content": "string",
  "correctedContent": "string",
  "remarks": "string",
  "status": "draft | submitted",
  "pdfUrl": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "submittedAt": "timestamp"
}
```

### reports/{reportId}/photos

```json
{
  "photoId": "string",
  "reportId": "string",
  "imageUrl": "string",
  "thumbnailUrl": "string",
  "description": "string",
  "sortOrder": 1,
  "takenAt": "timestamp",
  "latitude": 0.0,
  "longitude": 0.0,
  "createdAt": "timestamp"
}
```

### ai_corrections

```json
{
  "correctionId": "string",
  "reportId": "string",
  "userId": "string",
  "originalText": "string",
  "correctedText": "string",
  "createdAt": "timestamp"
}
```

## 8. Firebase Storage設計

```text
reports/
 └─ {reportId}/
     ├─ photos/
     │   ├─ {photoId}.jpg
     │   └─ {photoId}_thumb.jpg
     └─ pdf/
         └─ report.pdf
```

## 9. Webアプリフォルダ構成

```text
src/
 ├─ main.tsx
 ├─ App.tsx
 ├─ routes/
 │   └─ AppRoutes.tsx
 ├─ pages/
 │   ├─ splash/
 │   ├─ login/
 │   ├─ home/
 │   ├─ report-type/
 │   ├─ photo-type/
 │   ├─ report-form/
 │   ├─ photo-manager/
 │   ├─ ai-correction/
 │   ├─ pdf-preview/
 │   ├─ report-list/
 │   ├─ report-detail/
 │   └─ settings/
 ├─ models/
 │   ├─ appUser.ts
 │   ├─ report.ts
 │   └─ reportPhoto.ts
 ├─ repositories/
 │   ├─ authRepository.ts
 │   ├─ reportRepository.ts
 │   └─ storageRepository.ts
 ├─ services/
 │   ├─ gpsService.ts
 │   ├─ aiCorrectionService.ts
 │   ├─ pdfService.ts
 │   └─ imageService.ts
 ├─ stores/
 │   ├─ authStore.ts
 │   ├─ reportStore.ts
 │   └─ photoStore.ts
 ├─ components/
 │   ├─ PrimaryButton.tsx
 │   ├─ ReportCard.tsx
 │   ├─ PhotoInputCard.tsx
 │   └─ LoadingOverlay.tsx
 └─ utils/
     ├─ constants.ts
     ├─ validators.ts
     └─ dateFormatter.ts
```

## 10. 推奨npmパッケージ

```json
{
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "firebase": "latest",
    "zustand": "latest",
    "idb": "latest",
    "jspdf": "latest",
    "html2canvas": "latest",
    "browser-image-compression": "latest",
    "date-fns": "latest",
    "lucide-react": "latest",
    "vite-plugin-pwa": "latest"
  },
  "devDependencies": {
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

## 11. モデル定義

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

### ReportPhoto

```ts
export type ReportPhoto = {
  photoId: string;
  reportId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  file?: File;
  description: string;
  sortOrder: number;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};
```

### AppUser

```ts
export type AppUser = {
  userId: string;
  name: string;
  email: string;
  branchId: string;
  branchName: string;
  role: 'worker';
  isActive: boolean;
};
```

## 12. AI添削仕様

### 入力

ユーザーが入力した報告内容。

### プロンプト

```text
あなたは害虫害獣駆除の現場施工報告書の作成を支援するアシスタントです。
以下の文章を、社内報告書として自然で丁寧な日本語に添削してください。
事実を追加せず、意味を変えず、簡潔で分かりやすい表現にしてください。

入力文：
{userText}
```

### 出力

添削済み文章のみ返す。

### 画面動作

- 添削前文章を保持
- 添削後文章を表示
- 採用ボタンで本文へ反映
- キャンセルで破棄

## 13. PDF出力仕様

### PDFサイズ

A4縦。

### 表紙

表示項目:

- 報告書タイトル
- 報告書種別
- 作業日
- 作業場所
- 住所
- 報告者
- 所属支店
- GPS情報
- 報告内容
- 備考

### 写真ページ

写真付きの場合のみ作成。

レイアウト:

```text
┌──────────────┬──────────────┐
│ 写真説明      │ 写真説明      │
│ 写真          │ 写真          │
├──────────────┼──────────────┤
│ 写真説明      │ 写真説明      │
│ 写真          │ 写真          │
└──────────────┴──────────────┘
```

条件:

- 1ページ4枚
- 2列×2段
- 写真説明は写真上部
- 5枚目以降は次ページ
- 写真なし報告書では写真ページを出力しない

## 14. バリデーション

### 必須項目

- 報告書タイトル
- 作業日
- 作業場所
- 報告者名
- 報告内容

### 写真付き報告書の場合

- 写真1枚以上
- 写真説明は任意

### 入力制限

- タイトル: 100文字以内
- 報告内容: 3000文字以内
- 備考: 1000文字以内

## 15. ステータス

```text
draft      下書き
submitted  提出済み
```

MVPでは承認機能は実装しない。

将来拡張:

```text
approved   承認済み
rejected   差戻し
```

## 16. エラー処理

### GPS取得失敗

表示文:

```text
現在地を取得できませんでした。位置情報の許可設定を確認してください。
```

### 写真取得失敗

表示文:

```text
写真を取得できませんでした。もう一度お試しください。
```

### AI添削失敗

表示文:

```text
AI添削に失敗しました。通信環境を確認してください。
```

### PDF生成失敗

表示文:

```text
PDFの作成に失敗しました。入力内容を確認してください。
```

### 保存失敗

表示文:

```text
保存に失敗しました。通信環境を確認してください。
```

## 17. 開発ステップ

### Step 1

Vite + React + TypeScriptのWebアプリ構成を作成する。

### Step 2

画面一覧を作成する。

### Step 3

React Routerで画面遷移を実装する。

### Step 4

Report、ReportPhoto、AppUserモデルを作成する。

### Step 5

報告書入力フォームを作成する。

### Step 6

写真追加・削除・並び順管理・画像圧縮を作成する。

### Step 7

GPS取得機能を作成する。

### Step 8

PDF生成・プレビュー・ダウンロード・共有機能を作成する。

### Step 9

ローカル保存を実装する。

### Step 10

Firebase連携を追加する。

### Step 11

AI添削機能をサーバー経由で追加する。

まずはUIとローカル保存で動作するWebプロトタイプを作成し、その後FirebaseとAI機能を接続する。

## 18. 初期開発での注意点

- 最初から全機能を完全実装しない
- まずは画面遷移と入力フォームを完成させる
- PDF出力を早めに確認する
- Firebase連携は後から追加できる構造にする
- OpenAI APIキーはフロントエンドに直接書かない
- APIキーは環境変数とサーバー側で管理する
- 写真ファイルは容量が大きくなりすぎないよう圧縮する
- 位置情報利用時はブラウザ権限確認を必ず行う
- カメラ、GPS、PWAはHTTPS環境で検証する
- iOS SafariではWeb Share APIやPWA挙動に制限があるため代替導線を用意する

## 19. 完成条件

MVP完成条件:

- Webアプリを起動できる
- ログイン画面からホームへ進める
- 報告書種別を選択できる
- 写真付き・写真なしを選択できる
- 報告書を入力できる
- 写真を追加できる
- GPSを取得できる
- AI添削を実行できる
- PDFを生成できる
- 報告書を保存できる
- 一覧から過去報告書を確認できる
- スマートフォンブラウザで利用できる

## 20. 今回は実装しないもの

MVPでは以下は実装対象外とする。

- 管理者画面
- 承認フロー
- 差戻し機能
- 通知機能
- 案件管理
- 複数テンプレート管理
- Excel出力
- 写真からの自動説明文生成
- 音声入力
- 完全なオフライン同期
