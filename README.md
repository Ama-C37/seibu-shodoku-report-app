# 西武消毒 現場報告書作成支援Webアプリ MVP 開発仕様書

関連ドキュメント:

- [仕様書](./SPECIFICATION.md)
- [実装計画書](./IMPLEMENTATION_PLAN.md)
- [Google Drive設定メモ](./GOOGLE_DRIVE_SETUP.md)

## 0. 現在の開発状況

### ここまで実装したもの

- React + TypeScript + Viteのアプリ基盤
- 現場担当者向けの報告書作成フロー
- ログイン画面、ホーム画面、各ページへの戻る導線
- 報告書種別選択、写真有無選択、報告書入力
- 表紙画像の追加、変更、削除
- GPSによる住所取得
- 写真追加、写真説明入力、写真削除、画像圧縮
- AI添削画面と仮添削ロジック
- 下書き保存、提出済み保存、一覧表示
- 一覧から既存報告書を編集し、同じ`reportId`へ上書き保存
- PDF確認、PDFダウンロード、Web Share API共有
- PDFは表紙ページ、報告ページ、写真ページに分割
- 写真ページは1ページ6枚、2列×3段、7枚目以降は次ページ
- 管理者ページ `/admin`
- 社員管理、支店管理
- 管理者ページを将来分離しやすい構成
- Firebase環境変数 `.env` 設定
- Firebase初期化サービス
- Firebase設定済みの場合にFirebase Authenticationのメール/パスワードログインを使用
- Firebase AuthenticationユーザーとFirestore `users` 社員情報の照合
- Firestore `users` に登録済みで有効な社員だけログイン許可
- Firestore `users` の `role: admin` による管理者ページ制御
- Firestore `users` の `role: branch_manager` による支店長ロール
- 管理者ページの社員追加・編集で、権限として管理者、支店長、現場担当者を選択可能
- 社員情報の所属支店`branchId`と支店長ユーザーの所属支店`branchId`を使って、報告書作成者と所属支店の支店長を紐づけ
- 支店や支店長を追加した場合も、同じ支店に所属する支店長がその支店の管理責任者候補になる設計
- Firestore `users` の社員一覧、社員追加、社員編集
- Firestore `branches` の支店一覧、支店追加、支店編集
- Firestore `reports` の下書き保存、提出済み保存、一覧表示、既存報告書編集
- Firestore `ai_corrections` のAI添削履歴保存
- 初期管理者データ作成済み
  - `users/y-ishibashi-seibu-s-co-jp`
  - `branches/joto`
- Google Drive OAuth Client ID設定済み
- 設定画面からGoogle Drive認可完了
- 個人Google Drive内に`Seibu Report App/reports/connection-test`作成確認済み
- 表紙画像、報告書写真のGoogle Drive直接アップロード実装済み
- Google Driveへ画像が保存されることを確認済み
- Drive画像をDrive APIからBlob取得し、Object URLでアプリ内表示する方式へ変更済み
- PDF確認画面でGoogle Drive画像が表示されることを確認済み
- Cloudflare Tunnel経由でAndroid Chromeからアプリを起動し、ログイン、Drive認可、画像アップロード、PDF画像表示まで確認済み
- 施工報告書・写真なしは、防除作業管理報告書として表紙なしの1枚PDFテンプレートで出力
- 施工報告書・写真なしの管理責任者欄は、作成者の所属支店に紐づく支店長を自動入力
- 例: 城東支店所属の作成者が写真なし施工報告書を作成する場合、城東支店の`role: branch_manager`社員名を管理責任者へ自動入力
- 施工報告書・写真なしの施工内容は、管理者ページの施工内容マスタから対象害虫獣、使用薬剤、処理方法を連動選択
- 施工報告書・写真なしの施工内容は複数行追加でき、対象害虫獣、使用薬剤、処理方法、薬剤使用量、備考を1セットで入力
- 施工報告書・写真なしの生息状況は、施工内容で選択した対象害虫獣を自動反映し、重複する対象害虫獣は1行に統合
- 生息状況では対象害虫獣名を直接編集せず、施工内容側の選択内容を正として、判定のみ`-`、`＋`、`＋＋`から選択
- Android端末で写真なし施工報告書の新規作成、施工内容複数行、生息状況自動反映、PDF確認、PDF出力を確認済み
- Firestore `reports` 保存内容の詳細確認済み
  - `reports`全7件を`scripts/verifyReports.mjs`で検査
  - 写真なし施工報告書2件の管理責任者、施工内容複数行、生息状況が期待通り保存されていることを確認
  - 写真付き報告書5件のDrive表紙参照、写真Drive参照、写真枚数を確認
  - 検査結果は`reports=7, issues=0`
- Firebase未設定時はlocalStorage仮ログインで継続動作

### 現在まだ仮実装のもの

- Firebase未設定時のみ報告書、AI添削履歴はlocalStorage保存
- Firebase Storageは料金プラン都合で使用しない方針
- Google Drive APIへの中継なし直接アップロードは検証済み。ただし本番運用では、個人Drive依存、認可切れ、組織共有、監査性の制約を再確認する必要あり
- `VITE_GOOGLE_CLIENT_ID`設定済み。Cloudflare Tunnelなど確認用URLを変える場合は、Google Cloud Consoleの承認済みJavaScript生成元へ都度追加が必要
- Drive画像の削除、差し替え時は、当面Google Drive上の元ファイルを自動削除しない
- PDF自体のGoogle Drive自動保存は未実装
- OpenAI APIのサーバー経由接続は未実装
- 初回パスワード作成フローは未実装

### 次にスタートする場所

写真なし施工報告書の再編集、PDFレイアウト確認、摘要欄長文対応、作業単位コミット運用は完了扱いとする。

完了済み:

1. 写真なし施工報告書のレイアウト確認
2. 現行PDF構造整理の要否判断。現状の見た目で満足しているため後回し
3. 摘要欄長文対応の要否判断。現状運用では問題なしとして後回し
4. 修正・実装ごとに作業単位で検証してコミットする運用

次に行う作業:

1. 管理者、支店長、現場担当者、無効ユーザーの権限制御を確認する
2. Firestoreセキュリティルールを本番向けに整理する
3. 初回パスワード作成フローを実装する
4. OpenAI APIをサーバー経由で接続する
5. iOS Safariでカメラ、GPS、PDF共有を追加確認する

Google Drive設定手順は [Google Drive設定メモ](./GOOGLE_DRIVE_SETUP.md) を参照する。

### Android実機テスト時の起動方法

Android端末で実機テストする場合は、ローカルIP直アクセスではなくCloudflare TunnelをHTTP/2固定で起動する。QUIC接続だと環境によってCloudflare 1033が出るため、今後は必ずHTTP/2固定を使う。

1つ目のターミナル:

```bash
npm run dev:android
```

2つ目のターミナル:

```bash
npm run tunnel:android
```

`tunnel:android`のログに表示される`https://...trycloudflare.com`をAndroid Chromeで開く。GoogleログインやDrive認可で「無効な生成元」が出た場合は、そのURLをGoogle Cloud ConsoleのOAuthクライアントの承認済みJavaScript生成元へ追加する。

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
- Google Drive API
- Firebase設定値は`.env`の`VITE_FIREBASE_*`環境変数から読み込む
- 実際のFirebase設定値はリポジトリへ直接書かない
- Google Drive連携は中継サーバーを使わず、Google Identity Services + Drive APIをフロントエンドから直接利用する検証方針
- Drive APIの検証では会社共有フォルダではなく、まずユーザー個人Google Drive内のアプリ用フォルダを保存先にする

### 外部API

- OpenAI API
  - 用途: 入力文章のAI添削
  - APIキーはフロントエンドに直接置かない
  - Firebase Functions、Cloud Run、または別サーバー経由で呼び出す

### ブラウザ機能

- カメラ/写真ライブラリ: `<input type="file" accept="image/*" capture>` を利用
- GPS位置情報: Geolocation API
- 住所自動入力: GPS取得後に逆ジオコーディングで住所欄へ反映
- PDF生成: jsPDF、pdf-lib、または react-pdf
- PDFプレビューの紙面PDF化: html2canvas + jsPDF
- PDF共有: Web Share API、未対応環境ではPDFダウンロード
- ローカル保存: IndexedDB または localStorage

## 4. MVPで実装する機能

### 4-1. ログイン機能

- メールアドレス・パスワードでログイン
- ログインせず利用も可能
- ログイン済みの場合、氏名・所属支店を報告書に自動入力
- 未ログイン利用時はローカル保存を基本とする

#### 初回パスワード作成フロー案

ログイン時のパスワード作成について相談があった場合は、以下の案1・案2を再度提示する。

案1: Firebase Authenticationで初回パスワード設定フローを作る。

- 本番運用ではこの案を優先する
- 管理者が社員情報を登録する
- 社員のメールアドレスへ初回ログイン用リンク、またはパスワード設定リンクを送る
- 社員は初回アクセス時のみパスワード作成画面でパスワードを設定する
- 2回目以降はメールアドレス + パスワードで通常ログインする
- Firestoreの`users`には`passwordInitialized`のような初回設定済みフラグを持たせる
- パスワード自体はFirestoreやlocalStorageへ保存せず、Firebase Authenticationに管理させる

案2: localStorage仮実装で初回パスワード作成フローを擬似的に作る。

- Firebase連携前の画面フロー確認用としてのみ使用する
- 管理者が社員管理で社員を登録する
- 登録済み社員にパスワード未設定フラグを持たせる
- 初回ログイン時だけパスワード作成画面へ遷移する
- パスワード設定後、2回目以降は通常ログイン扱いにする
- 本番ではlocalStorageに本物のパスワードを保存しない
- Firebase連携時に案1へ置き換える

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
- 表紙画像
- GPS取得による住所自動入力
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

- Geolocation APIで現在地を取得
- 取得ボタンを押すと逆ジオコーディングで住所を取得し、住所欄へ自動入力
- 住所は日本向けに、都道府県 → 市区町村 → 町名・丁目 → 番地 → 号の順で表示する
- 番地・号は逆ジオコーディング結果に含まれる場合のみ表示する
- 国名「日本」と郵便番号は住所欄に表示しない
- 画面上に緯度・経度は表示しない
- 緯度・経度は内部データとして保存できる
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
- 施工現場の全景写真
- 作業日
- 作業場所
- 住所
- 報告者名
- 所属支店

報告ページ:

- 作業日
- 作業場所
- 住所
- 報告内容
- 備考

写真ページ:

- 1ページ6枚
- 2列×3段
- 各写真の上に写真説明欄
- 写真が6枚を超える場合は自動改ページ
- 写真なし報告書の場合、写真ページは作成しない
- PDF確認画面に表示したA4紙面をhtml2canvasで画像化し、jsPDFでPDF出力する
- 画面プレビューとダウンロード・共有されるPDFの見た目をそろえる

### 4-9. 保存機能

- 下書き保存
- 提出済み保存
- PDF生成後の保存
- MVP初期段階ではIndexedDBまたはlocalStorageへ保存
- Firebase連携後はFirestoreへ報告書データを保存
- Firebase Storageは使用しない
- 写真、表紙画像はGoogle Drive APIでユーザー個人Google Driveへ直接アップロードする検証方針
- Firestoreには画像本体ではなく、Driveの`fileId`、表示用URL、ファイル名、MIME typeなどの参照情報を保存する
- PDFは当面、生成・ダウンロード・Web Share API共有を継続し、自動Drive保存は後続検討とする

### 4-10. PWA機能

- スマートフォンのホーム画面に追加できる
- アプリアイコンとアプリ名を設定する
- 最低限のオフライン起動に対応する
- オフライン時の保存はローカル保存とし、同期機能は将来拡張とする

### 4-11. 管理者機能

初期段階では、現場アプリと同じWebアプリ内に管理者ページを追加する。

将来的には、管理者機能を別Webアプリとして分離する可能性があるため、最初から管理者機能を独立モジュールとして実装する。

管理者機能で扱う対象:

- 社員情報
  - 名前
  - メールアドレス
  - 所属支店
  - 権限
  - 有効 / 無効状態
- 支店情報
- ログインアカウント情報
- 管理者 / 現場担当者の権限
- 有効 / 無効状態

初期実装で利用できるURL:

- `/admin`
- `/admin/users`
- `/admin/users/new`
- `/admin/users/:userId/edit`
- `/admin/branches`
- `/admin/branches/new`
- `/admin/branches/:branchId/edit`

MVP初期段階の管理者ログイン:

- Firebase連携前の仮実装では、登録済み社員の`role`が`admin`の場合に管理者ページへアクセスできる
- 開発確認用として、メールアドレスに`admin`を含めてログインした場合も`admin`ロールとして扱う
- ログイン時は社員管理に登録されたメールアドレスを照合し、登録済み社員の名前をログイン表示名として使用する
- 報告書作成時の報告者名は、ログイン中ユーザーの名前を初期値として使用する
- Firebase連携後は、この仮ルールを廃止し、Authentication + Firestore上のユーザーロールで判定する

実装方針:

- 管理者ページは`/admin`配下にまとめる
- 管理者ページの画面は`src/pages/admin/`にまとめる
- 管理者専用コンポーネントは`src/components/admin/`にまとめる
- 社員情報・支店情報のデータ操作は専用repositoryへ分離する
- 管理者判定と権限チェックは共通ガード関数・共通ルートで一元管理する
- 現場担当者向け画面から管理者機能を直接呼び出さない
- 管理者機能が大きくなった場合は、`pages/admin`、`components/admin`、管理者用repository、権限チェック処理を別アプリへ移植できる構成にする

移行しづらくなるため禁止する作り方:

- 現場画面のコンポーネントに管理者処理を混ぜる
- 管理者だけ使う状態管理を全体ストアへ強く依存させる
- 支店・社員データの操作を各画面に直書きする
- 管理者判定を複数画面にバラバラに書く
- `/home`や設定画面に管理機能を直接埋め込む

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
| ADM-001 | AdminHomePage | 管理者ホーム |
| ADM-002 | AdminUsersPage | 社員一覧 |
| ADM-003 | AdminUserFormPage | 社員追加・編集 |
| ADM-004 | AdminBranchesPage | 支店一覧 |
| ADM-005 | AdminBranchFormPage | 支店追加・編集 |

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

AdminRoutes
 ├─ /admin → AdminHomePage
 ├─ /admin/users → AdminUsersPage
 ├─ /admin/users/new → AdminUserFormPage
 ├─ /admin/users/:userId/edit → AdminUserFormPage
 ├─ /admin/branches → AdminBranchesPage
 ├─ /admin/branches/new → AdminBranchFormPage
 └─ /admin/branches/:branchId/edit → AdminBranchFormPage

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
 └─ 報告書選択 → ReportFormPage

ReportFormPage
 ├─ 既存報告書を保存 → 同一reportIdへ上書き保存
 └─ PDF確認 → PdfPreviewPage

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
  "role": "admin | branch_manager | worker",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### branches

```json
{
  "branchId": "string",
  "branchName": "string",
  "address": "string",
  "phoneNumber": "string",
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
  "coverImageUrl": "string",
  "coverDriveFileId": "string",
  "coverDriveWebViewLink": "string",
  "coverDriveThumbnailLink": "string",
  "coverDriveMimeType": "string",
  "coverDriveName": "string",
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
  "driveFileId": "string",
  "driveWebViewLink": "string",
  "driveThumbnailLink": "string",
  "driveMimeType": "string",
  "driveName": "string",
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

## 8. Google Drive画像保存設計

Firebase Storageは使用しない。まずは検証用として、ReactアプリからGoogle Drive APIへ中継なしで直接アップロードする。

検証方針:

- Google Identity ServicesでGoogleアカウントの認可を取得する
- Drive APIスコープはまず`https://www.googleapis.com/auth/drive.file`を使う
- 保存先は会社共有フォルダではなく、ログインしたGoogle個人アカウント内のアプリ用フォルダにする
- 写真追加時、または報告書保存時に、表紙画像と報告書写真をGoogle Driveへアップロードする
- Firestore `reports` には画像本体を保存せず、Drive参照情報だけ保存する
- 再編集時はFirestoreに保存されたDrive参照情報から画像を表示する
- PDFは当面、アプリ内で生成、ダウンロード、Web Share API共有のみ行う
- PDFのGoogle Drive自動保存は、画像保存検証後に別途判断する

想定するDriveフォルダ:

```text
Google Drive 個人アカウント
 └─ Seibu Report App/
     └─ reports/
         └─ {reportId}/
             ├─ cover-{timestamp}.jpg
             └─ photos/
                 ├─ {photoId}.jpg
                 └─ ...
```

Firestoreに保存する画像参照情報の例:

```ts
type DriveImageRef = {
  driveFileId: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  imageUrl?: string;
};
```

注意点:

- `.env`に`VITE_GOOGLE_CLIENT_ID`が未設定の場合は、従来通りBase64画像として保存する
- Google Drive設定済みの場合、表紙画像選択時と写真追加時にDriveへアップロードする
- 初回アップロード時にGoogleアカウント認可が必要になる
- 設定画面の`Google Drive保存先確認`で事前に認可しておくと、写真選択時の認可失敗を避けやすい
- Google Driveの共有URLは、そのまま`<img src="">`で安定表示できない場合がある
- 検証段階では`thumbnailLink`またはDrive API経由の取得URLで表示できるか確認する
- 個人Drive保存では、別ユーザーが同じ画像を閲覧できない可能性がある
- 会社共有フォルダへ集約する本番運用に移る場合は、Apps ScriptやCloud Runなどの中継方式を再検討する

### Google Drive画像の差し替え・削除方針

当面は、アプリ内で表紙画像や報告書写真を差し替え・削除しても、Google Drive上の元ファイルは自動削除しない。

理由:

- 過去の報告書、確認中のPDF、再編集画面が古いDrive画像を参照している可能性がある
- 自動削除すると、誤削除により報告書画像が表示できなくなるリスクがある
- Drive容量は消費するが、MVP段階ではデータ欠損を避けることを優先する

運用方針:

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

## 9. Webアプリフォルダ構成

```text
src/
 ├─ main.tsx
 ├─ App.tsx
 ├─ routes/
 │   ├─ AppRoutes.tsx
 │   └─ AdminRoutes.tsx
 ├─ pages/
 │   ├─ admin/
 │   │   ├─ AdminHomePage.tsx
 │   │   ├─ AdminUsersPage.tsx
 │   │   ├─ AdminUserFormPage.tsx
 │   │   ├─ AdminBranchesPage.tsx
 │   │   └─ AdminBranchFormPage.tsx
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
 │   ├─ userRepository.ts
 │   ├─ branchRepository.ts
 │   ├─ reportRepository.ts
 │   └─ storageRepository.ts
 ├─ services/
 │   ├─ adminGuardService.ts
 │   ├─ gpsService.ts
 │   ├─ aiCorrectionService.ts
 │   ├─ pdfService.ts
 │   └─ imageService.ts
 ├─ stores/
 │   ├─ authStore.ts
 │   ├─ reportStore.ts
 │   └─ photoStore.ts
 ├─ components/
 │   ├─ admin/
 │   │   ├─ AdminLayout.tsx
 │   │   ├─ UserForm.tsx
 │   │   └─ BranchForm.tsx
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
  coverImageUrl?: string;
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

## 12. AI添削仕様

### 入力

ユーザーが入力した報告内容。

### プロンプト

```text
あなたは害虫害獣駆除の現場施工報告書の作成を支援するアシスタントです。
以下の文章を、お客様に提出する現場施工報告書として自然で丁寧な日本語に添削してください。
事実を追加せず、意味を変えず、簡潔で分かりやすい表現にしてください。
確定的な言い切りは避け、報告者が現場で確認・判断した内容として主体的に記述してください。
例: 「侵入経路を見つけた」ではなく「侵入経路を確認した」のように表現してください。
報告文の最後には、お客様にも注意や確認にご協力いただく趣旨の一文を、状況や入力内容に応じて自然な形で必ず明記してください。
例: 「引き続き状況を注視しながら経過を確認していく必要があると判断されます。」

### 石橋様向け報告書スタイル

AI添削では、以下の文体・構成を優先する。

- お客様へ提出する報告書としてふさわしい丁寧な文章にする
- 「急に」「もったいない」「するといいと思います」などの口語的な表現は避ける
- 「判断されます」「考えられます」「推測されます」「可能性が考えられます」「おすすめいたします」「ご検討ください」など、丁寧で客観的な表現を用いる
- 断定せず、推測は推測として記載する
- 現場で確認できた事実と、そこから考えられる推測・判断を明確に区別する
- 提案はあくまで提案として記載し、最終判断はお客様に委ねる表現にする
- 基本構成は「本日実施した作業 → 点検結果 → 結果から考えられること → 今後の注意点・提案」とする
- 「配置」「喫食」「捕獲」「閉塞」「侵入経路」「生息」「痕跡」「活動状況」「経過を観察」などのPCO業界用語は適切に残す
- 専門用語を残しつつ、一般のお客様にも理解しやすい文章にする
- 「確認されました」「現在」など同じ語尾・同じ言葉の繰り返しを避ける
- 単なる結果だけでなく、なぜそう判断したのか、なぜその提案をするのかが伝わる文章にする
- 季節要因を必要に応じて考察へ反映する
- 夏は、屋外活動の増加、建物内への依存度低下、一時的な喫食量減少の可能性を考慮する
- 冬は、建物内への侵入、足音被害増加の可能性を考慮する
- 痕跡がなく安定している場合は「良好な環境」と表現する
- 一定期間被害がなく防除効果が十分出ている場合は「一時的に駆除が完了していると判断されます」と表現できる
- 「駆除完了」と表現する場合も、再侵入の可能性と継続確認の必要性に触れる
- 必要以上に不安を煽らず、「可能性があります」「注意が必要です」「引き続き経過を観察する必要があります」に留める
- 一文が長くなりすぎないよう、作業内容・点検結果・考察を適度に区切る
- お客様が知りたい「何をしたのか」「結果はどうだったのか」「今後どうなる見込みか」「お客様は何をすればよいか」を優先して書く
- 可能な場合は「本日、対象害虫・害獣の防除作業を実施いたしました。」に近い導入から始める

過去に採用された添削結果がある場合は、採用済み文章の文体・表現傾向を参考にしてください。
ただし、過去の事実関係や固有の現場情報は現在の報告文に追加しないでください。

入力文：
{userText}
```

### 出力

添削済み文章のみ返す。

### 画面動作

- 添削前文章を保持
- 添削後文章を表示
- 採用ボタンで本文へ反映
- 採用時に、添削前文章・添削後文章・採用済み最終文章・採用日時をAI添削履歴として保存
- 次回以降の添削では、採用済み履歴の文体傾向をプロンプトへ反映
- 不採用の場合は「別案で再添削」ボタンから、前回案とは異なる構成・語尾・注意喚起文で再添削できる
- 不採用だった添削案は、同じ入力文に対する再添削時に避ける候補として保存する
- キャンセルで破棄

### 学習・改善方針

- OpenAIのモデル自体を自動学習させるのではなく、アプリ側で採用履歴を保存して次回プロンプトに反映する
- 不採用の添削結果は文体改善の参考にせず、同じ入力文で似た候補を避ける目的に限定して利用する
- MVP初期段階ではlocalStorageに保存し、Firebase連携後は`ai_corrections`へ保存する
- 個人情報・顧客名・住所など、過去報告書固有の事実を次回添削文へ混入させない

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

デザイン:

- SEIBU SHODOKUのヘッダー
- 緑のタイトル帯
- 施工現場の全景写真
- 作業日、作業場所、住所、報告者、所属支店は表紙画像の下に枠なしで表示
- 顧客提出用の落ち着いた余白設計
- 西武消毒名義のフッター

### 報告ページ

表示項目:

- 作業日
- 作業場所
- 住所
- 本文
- 備考

デザイン:

- ページヘッダー
- セクション見出し
- メタ情報の罫線区切り
- 本文と備考を独立したセクションとして表示

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

- 1ページ6枚
- 2列×3段
- 写真説明は写真上部
- 7枚目以降は次ページ
- 13枚目以降は3ページ目
- 写真なし報告書では写真ページを出力しない

### PDF生成方式

- PDF確認画面に表紙ページ、報告ページ、写真ページをA4比率で表示する
- ダウンロード・共有時は、表示中の`.pdf-page`要素をhtml2canvasで画像化する
- 画像化した各ページをjsPDFへA4縦で配置する
- 日本語フォント埋め込みなしでも、ブラウザ表示に近い見た目でPDF化できる構成にする
- Web Share APIでPDFファイル共有できる環境では共有を実行し、未対応環境ではPDFダウンロードへフォールバックする

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

実装済み:

- 表紙ページ、報告ページ、写真ページに分けたPDF確認画面を作成
- html2canvas + jsPDFで、画面プレビューと同じ紙面をPDF化
- PDFダウンロードとWeb Share API共有を実装

### Step 9

ローカル保存を実装する。

実装済み:

- 下書き一覧・提出済み一覧から報告書を選択した場合、既存報告書の編集画面へ直接遷移
- 選択した報告書の`reportId`を維持し、保存時は新規作成ではなく同一データへ上書き保存
- 一覧から開く場合はセッション一時下書きより保存済みデータを優先してフォームへ反映

### Step 10

Firebase連携を追加する。

現在の状態:

- Firebase設定値は`.env`へ入力済み
- Firebase初期化サービスは追加済み
- Firebase設定がある場合、ログイン処理はFirebase Authenticationを使用
- Firestore `users`との社員照合は実装済み
- Firestore `users`、`branches`、`reports`、`ai_corrections`への保存処理は実装済み
- Firebase Storageは使用しない方針
- 画像保存はGoogle Drive APIへの中継なし直接アップロードで実装済み
- Google Driveへの実画像アップロード確認済み
- Drive画像はDrive APIからBlob取得し、Object URLとしてアプリ内表示する方式で実装済み
- PDF確認画面でDrive画像表示確認済み
- Android ChromeからCloudflare Tunnel経由でログイン、Drive認可、画像アップロード、PDF画像表示まで確認済み

次に行うこと:

- Firestore `reports`に保存されたDrive参照情報と報告書入力項目を確認する
- 一覧から再編集し、Drive画像参照が維持されたまま上書き保存できるか確認する
- 画像差し替え・削除時は古いDriveファイルを自動削除しない方針で進める
- 後続で、未参照Drive画像を管理者が確認して削除できる整理機能を設計する
- Firestore接続失敗時のエラー表示とlocalStorageフォールバック方針を整理する

### Step 11

AI添削機能をサーバー経由で追加する。

### Step 12

管理者ページを同一Webアプリ内に追加する。

実装方針:

- まずは案1として、同じWebアプリ内に`/admin`配下の管理者ページを作る
- 将来案2として管理者専用Webアプリへ移行できるよう、管理者機能は独立したディレクトリ・ルート・repositoryで実装する
- 社員管理、支店管理、権限管理を現場画面から分離して実装する
- 管理者判定は共通ガードで一元管理し、各画面に直書きしない

実装済み:

- `/admin`配下の管理者ルートを追加
- 管理者ホームを追加
- 社員一覧、社員追加、社員編集を追加
- 支店一覧、支店追加、支店編集を追加
- 社員情報は`userRepository`へ分離
- 支店情報は`branchRepository`へ分離
- 管理者判定は`adminGuardService`へ集約
- 管理者専用UIは`components/admin`へ分離
- Firebase設定済みの場合、社員・支店データはFirestoreへ保存
- Firebase未設定時のみ、社員・支店データはlocalStorageへ保存

まずはFirestore保存まで接続済み。次はGoogle Drive APIへの中継なし直接アップロード検証と、AI機能の本番API接続を進める。

## 18. 初期開発での注意点

- 最初から全機能を完全実装しない
- まずは画面遷移と入力フォームを完成させる
- PDF出力を早めに確認する
- Firebase連携は後から追加できる構造にする
- OpenAI APIキーはフロントエンドに直接書かない
- APIキーは環境変数とサーバー側で管理する
- ログイン時のパスワード作成について相談された場合は、Firebase Authenticationを使う案1と、localStorage仮実装で画面フローだけ確認する案2を再度提示する
- 本番運用ではパスワードをFirestoreやlocalStorageへ保存せず、Firebase Authenticationに管理させる
- 写真ファイルは容量が大きくなりすぎないよう圧縮する
- 位置情報利用時はブラウザ権限確認を必ず行う
- カメラ、GPS、PWAはHTTPS環境で検証する
- iOS SafariではWeb Share APIやPWA挙動に制限があるため代替導線を用意する
- 管理者機能は現場担当者向け機能から分離して実装する
- 管理者ページは`/admin`配下にまとめ、`/home`や設定画面に管理機能を直接埋め込まない
- 管理者専用状態は管理者モジュール内に閉じ、全体ストアへ強く依存させない
- 社員情報・支店情報の読み書きはrepositoryに集約し、各画面へ直書きしない
- 管理者判定と権限チェックは共通ガードへ集約し、複数画面にバラバラに書かない
- 将来管理者専用アプリへ移行する可能性を前提に、`pages/admin`、`components/admin`、管理者用repository、権限チェック処理を移植しやすい構成にする

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

- 承認フロー
- 差戻し機能
- 通知機能
- 案件管理
- 複数テンプレート管理
- Excel出力
- 写真からの自動説明文生成
- 音声入力
- 完全なオフライン同期

## 21. 2026-07-15時点の実装メモ

今回実装・調整した内容:

- 写真なし施工報告書のPDF確認画面レイアウトを、参照元PDFに近づける方向で調整
- 施工内容より上の領域を固定座標化し、タイトル、控、報告日、会社印、宛先、責任者欄、施工日時、作業時間、施工場所の位置を個別調整できるようにした
- 管理責任者・作業責任者欄は、宛先欄の横幅を維持したまま責任者表だけ短くする方針に変更
- 施工内容と生息状況の外枠を太線で統一し、内側セル線との差が出るようにした
- 施工日時と作業時間の枠を左右二等分に調整
- 旧「施工場所」入力欄を削除し、住所入力欄を施工場所として扱う方針に変更
- PDF確認画面とPDF出力では、旧施工場所を表示せず、住所を施工場所として表示する
- 住所が空の古いデータのみ、互換用に旧施工場所を施工場所として表示する
- GPS取得は住所欄へ反映する。保存時は住所を`address`と`locationName`の両方へ入れ、既存画面との互換性を維持する

次回再開する作業:

1. 参照元PDFとアプリの写真なし施工報告書レイアウトを並べて比較し、最終調整する
2. 各欄の枠線の太さ、外枠、内枠、罫線の見え方を調整する
3. 摘要欄の入力内容が長い場合にレイアウトがずれる問題を調整する

次回再開時にすり合わせる内容:

- 写真なし施工報告書のレイアウトを参照元PDFへどこまで厳密に合わせるか
- 摘要欄が長い場合、文字サイズを下げるのか、欄の高さを変えるのか、2枚目へ送るのか
- PDF出力とアプリ内確認画面の見た目を完全一致させるか、確認画面は縮小表示として割り切るか
- 写真付き報告書側のレイアウト調整を次に進めるか
- 権限管理、Firestore Security Rules、Google Drive画像整理機能、AI添削の本番API接続の優先順位
