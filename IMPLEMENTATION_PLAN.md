# 西武消毒 現場報告書作成支援Webアプリ 実装計画書

## 1. 現在の状態

現時点では、UIとローカル保存で動作するWebプロトタイプは概ね完成している。

Firebase AuthenticationとFirestore `users` の照合は接続確認済み。初期管理者ユーザーでアプリ側ログインと管理者ページ表示を確認済み。

現在は、支店、報告書、AI添削履歴のFirestore保存は実装済み。写真と表紙画像はFirebase Storageを使わず、Google Drive APIへの中継なし直接アップロード方式で実装済み。Google Drive OAuth Client ID設定、認可、`Seibu Report App/reports/connection-test`フォルダ作成、実画像アップロード、PDF確認画面でのDrive画像表示まで確認済み。

Android ChromeからCloudflare Tunnel経由でアプリを起動し、ログイン、Drive認可、フォルダ作成、画像アップロード、PDF確認画面での画像表示まで確認済み。施工報告書・写真なしは、防除作業管理報告書として1枚PDFテンプレートを実装済み。施工内容は複数行入力、対象害虫獣、使用薬剤、処理方法の連動選択、生息状況への対象害虫獣自動反映、重複対象害虫獣の統合まで実装済み。

写真なし施工報告書のAndroid端末実機テストとFirestore `reports`保存内容の詳細確認は完了済み。次は、報告書再編集フロー、PDF出力品質、権限・セキュリティルール、初回パスワード作成フローを順に仕上げる段階。Android実機テスト時はCloudflare TunnelをHTTP/2固定で起動する。

## 2. 実装済み

### フロントエンド基盤

- Vite + React + TypeScript
- React Router
- Zustand
- 画面ルーティング
- 共通ボタン
- ヘッダーナビゲーション
- レスポンシブUI

### 現場担当者機能

- ログイン画面
- ホーム画面
- 報告書種別選択
- 写真有無選択
- 報告書入力
- 表紙画像入力
- GPS住所取得
- 写真追加、削除、説明入力
- 画像圧縮
- AI添削画面
- PDF確認
- PDFダウンロード
- PDF共有
- 下書き保存
- 提出済み保存
- 一覧表示
- 一覧から既存報告書を編集
- 既存報告書への上書き保存

### 管理者機能

- `/admin`ルート
- 管理者ホーム
- 社員一覧
- 社員追加
- 社員編集
- 支店一覧
- 支店追加
- 支店編集
- 管理者ページ入口
- 管理者判定ガード
- Firebase Authenticationメール/パスワードログイン
- Firestore `users` に登録済みで有効な社員だけログイン許可
- Firestore `users` の `role: admin` による管理者ページ制御
- Firestore `users` の `role: branch_manager` による支店長ロール
- 管理者ページの社員追加・編集で、管理者、支店長、現場担当者を選択可能
- 社員の所属支店と支店長の所属支店を`branchId`で紐づける設計
- Firestore `users` の社員一覧、社員追加、社員編集
- Firestore `branches` の支店一覧、支店追加、支店編集
- Firestore `reports` の下書き保存、提出済み保存、一覧表示、既存報告書編集
- Firestore `ai_corrections` のAI添削履歴保存
- Google Drive APIへの中継なし直接アップロード基礎実装
- Drive未設定時のBase64画像保存フォールバック
- 設定画面のGoogle Drive保存先確認
- 写真選択前のGoogle Drive事前認可
- Google Drive OAuth Client ID設定
- Google Drive認可確認
- `Seibu Report App/reports/connection-test`フォルダ作成確認
- Drive画像をDrive APIからBlob取得してObject URL表示する共通コンポーネント
- 表紙画像、報告書写真のGoogle Driveアップロード確認
- PDF確認画面でのGoogle Drive画像表示確認
- Android ChromeでCloudflare Tunnel経由の主要フロー確認
- 施工報告書・写真なしの1枚PDFテンプレート
- 施工報告書・写真なしの管理責任者自動入力
- 写真なし施工報告書では、作成者の所属支店に紐づく支店長名を管理責任者欄へ自動入力
- 今後支店や支店長を追加しても、支店長ユーザーの所属支店を設定すれば同じ支店の作成者と自動で紐づく
- 施工報告書・写真なしの施工内容マスタ連動
- 施工報告書・写真なしの施工内容複数行入力
- 施工報告書・写真なしの生息状況自動反映
- `GOOGLE_DRIVE_SETUP.md`作成
- 初期管理者データ作成
  - `users/y-ishibashi-seibu-s-co-jp`
  - `branches/joto`

### ドキュメント

- README更新
- 仕様書作成
- 実装計画書作成

## 3. これから実装するもの

### 本番運用に必要なもの

- Google Drive APIへの中継なし直接アップロード検証後の運用整理
- Firestore保存内容と再編集フローの安定化
- PDF出力レイアウトの実機仕上げ
- OpenAI APIサーバー接続
- 初回パスワード作成フロー
- Firestoreセキュリティルール
- iOS Safariを含む追加実機検証

### 使い勝手改善

- 写真ドラッグ並び替え
- 管理者ページの検索、絞り込み
- 無効社員、無効支店の制御
- PDF保存履歴
- PWA Service Worker

### 将来拡張

- 承認フロー
- 差戻し
- 通知
- 案件管理
- 複数テンプレート
- Excel出力
- 写真からの自動説明文生成
- 音声入力

## 4. 推奨実装順

### Phase 1: 既存プロトタイプの整理

目的: Firebase接続前に、現在のローカル実装を本番接続へ差し替えやすい状態にする。

作業:

- READMEの矛盾修正: 完了
- 管理者画面をMVP対象外リストから削除: 完了
- localStorage repositoryの責務整理: 完了
- `authRepository`、`userRepository`、`branchRepository`、`reportRepository`のFirestore差し替え前提を明確化: 完了
- 型定義の最終確認: 完了
- 不要な直接参照をrepository経由へ寄せる: 永続データは完了。一時入力退避の`sessionStorage`は画面遷移用として維持

完了条件:

- `npm run build`が通る
- 仕様書と実装計画書が現在の実装と一致している
- Firebase接続時に差し替えるファイルが明確になっている

Phase 1整理結果:

- `authRepository`: 現在はlocalStorageのログイン状態管理。将来はFirebase Authenticationへ差し替える
- `userRepository`: 現在はlocalStorageの社員情報管理。将来はFirestore `users`へ差し替える
- `branchRepository`: 現在はlocalStorageの支店情報管理。将来はFirestore `branches`へ差し替える
- `reportRepository`: 現在はlocalStorageの報告書管理。将来はFirestore `reports`へ差し替える
- `aiCorrectionRepository`: 現在はlocalStorageの添削履歴管理。将来はFirestore `ai_corrections`へ差し替える
- `ReportFormPage`の`sessionStorage`: AI添削・写真管理から戻るための一時退避であり、Firestore移行対象ではない

### Phase 2: Firebaseプロジェクト接続

目的: 本番データ基盤を用意する。

作業:

- Firebase設定ファイルを追加: 完了
- 環境変数設計: 完了
- Firebase初期化処理を追加: 完了
- Authentication、Firestoreの接続準備: 完了。Firebase Storageは使用しない
- 開発環境と本番環境の切り分け: 環境変数方式は完了。環境別プロジェクト分離は未実施

完了条件:

- アプリからFirebaseへ接続できる: 完了
- 環境変数なしでAPIキー等を直書きしていない: 完了
- Firebase接続失敗時に画面が壊れない: 完了

Phase 2整理結果:

- Firebase初期化は`firebaseService`へ集約
- Firebase設定値は`VITE_FIREBASE_*`環境変数から読み込む
- `.env.example`に必要な環境変数名を記載
- 環境変数が未設定の場合、Firebaseサービスは`null`を返し、既存localStorage仮実装で動作継続する
- `.env`は`.gitignore`対象
- Firebase ConsoleでAuthenticationメール/パスワード有効化済み
- Firestore Database作成済み

### Phase 3: 認証と権限管理

目的: 仮ログインをFirebase Authenticationへ置き換える。

作業:

- メール/パスワードログイン実装: Firebase設定済みの場合はFirebase Authentication、未設定の場合はlocalStorage仮実装で動作
- ログアウト実装: Firebase設定済みの場合はFirebase Authenticationからもログアウト、未設定の場合はlocalStorageのみ削除
- ログイン状態監視: localStorage上の現在ユーザー復元は実装済み。Firebase Authの`onAuthStateChanged`完全同期は未実装
- Firestore `users`との照合: 完了
- `admin` / `worker`の権限判定: 完了
- 無効社員のログイン制御: 完了
- 管理者ページの本番ガード: 完了
- 初回パスワード作成フローの方式決定

推奨:

- 本番では案1、Firebase Authenticationによる初回パスワード設定フローを優先する
- localStorageへ本物のパスワードは保存しない

完了条件:

- 登録済み社員だけがログインできる: 完了
- 管理者だけが`/admin`に入れる: 完了
- 無効社員は利用できない: 完了
- 報告者名に社員管理の名前が反映される: 完了

Phase 3整理結果:

- `authRepository.signIn`を非同期化
- Firebase環境変数が設定済みの場合、`signInWithEmailAndPassword`を使う
- Firebase環境変数が未設定の場合、既存のlocalStorage仮ログインを継続する
- ログイン失敗時にログイン画面へエラー表示する
- 社員管理で無効にした社員はログインできない
- Firebase Authで認証できてもFirestore `users`に登録がないメールアドレスはログイン不可
- 管理者ユーザーでアプリ側ログイン確認済み
- 初回パスワード作成フローは未実装

### Phase 4: Firestore保存

目的: localStorage保存をFirestoreへ置き換える。

作業:

- `users`保存: 完了
- `branches`保存: 完了
- `reports`保存: 完了
- `ai_corrections`保存: 完了
- repository層のFirestore実装: 完了
- localStorage仮データからFirestoreへの移行方針整理
- エラーハンドリング

次回の推奨順:

1. `branchRepository`をFirestore `branches`対応にする: 完了
2. 管理者の支店一覧、支店追加、支店編集を非同期読み込み・保存に対応する: 完了
3. 報告書作成画面で使う支店名、ユーザー名、所属支店の反映を確認する: 完了
4. `reportRepository`をFirestore `reports`対応にする: 完了
5. 下書き保存、提出済み保存、一覧表示、既存報告書編集をFirestoreで動かす: 実装完了、主要フロー確認済み。保存項目の詳細確認は次工程
6. `aiCorrectionRepository`をFirestore `ai_corrections`対応にする: 完了
7. Firestore接続失敗時のエラー表示とlocalStorageフォールバック方針を整理する: 未着手
8. Firestoreセキュリティルールを仮運用ルールから本番向けに整理する
9. 実機でログイン、報告書作成、PDF出力まで通し確認する: Android Chromeは確認済み。iOS Safariは追加確認対象

完了条件:

- 別端末でも同じユーザー、支店、報告書が見える
- 社員・支店の管理変更がログインや報告書作成に反映される
- localStorage依存が本番動作から外れている

### Phase 5: Google Drive直接アップロード検証

目的: Firebase Storageを使わず、写真と表紙画像をユーザー個人のGoogle Driveへ保存する検証を行う。

前提:

- 中継サーバーは使わない
- 会社共有フォルダではなく、まず個人Googleアカウント内のアプリ用フォルダで試す
- Google Identity ServicesでGoogleアカウント認可を取得する
- Drive APIスコープはまず`https://www.googleapis.com/auth/drive.file`を使う
- Firestoreには画像本体ではなく、Driveの`fileId`や参照URLだけ保存する
- PDFは当面、生成、ダウンロード、Web Share API共有のみ継続する

作業:

- Google Cloud ConsoleでDrive APIを有効化
- OAuthクライアントIDを作成し、承認済みJavaScript生成元を設定
- `.env`に`VITE_GOOGLE_CLIENT_ID`を設定する: 完了
- 設定画面からGoogle Drive認可を確認する: 完了
- 個人Google Drive内に`Seibu Report App/reports/connection-test`を作成する: 完了
- `.env.example`に`VITE_GOOGLE_CLIENT_ID`などのDrive連携用環境変数を追加: 完了
- `googleDriveService`または`imageStorageService`を作成する: 完了
- Google認可ボタンまたは初回アップロード時の認可フローを作る: 初回アップロード時認可として実装済み
- 設定画面からGoogle Drive保存先確認を実行できるようにする: 完了
- 写真選択時は画像圧縮前にGoogle Drive認可を済ませる: 完了
- Google Drive設定手順をドキュメント化する: 完了
- 個人Google Drive内に`Seibu Report App/reports/{reportId}`相当の保存先を作る: 実装済み
- 表紙画像をDriveへアップロードする: 実装済み、確認済み
- 報告書写真をDriveへアップロードする: 実装済み、確認済み
- Driveの`fileId`、`webViewLink`、`thumbnailLink`、MIME typeなどをFirestore `reports`へ保存する: 実装済み
- 再編集時にDrive参照情報から画像を表示する: Drive API Blob取得方式で実装済み
- 画像削除、差し替え時の扱いを決める: 当面はGoogle Drive上の元ファイルを自動削除しない方針で決定
- ファイルサイズ制限とアップロード失敗時の扱いを決める
- Drive API Blob取得方式で画像表示が安定するか実機確認する: PC、Androidで確認済み。iOSは追加確認対象

完了条件:

- 表紙画像と報告書写真が個人Google Driveへアップロードされる: 完了
- Firestore `reports` には画像本体ではなくDrive参照情報が保存される: 実装済み、保存内容の詳細確認は次工程
- 再編集時にDrive上の画像を参照して表示できる: 実装済み、再編集保存後の維持確認は次工程
- Drive認可切れやアップロード失敗時のエラー表示方針が決まっている
- 差し替え・削除時の古いDriveファイル運用方針が決まっている: 自動削除せず、後続で管理者確認型の整理機能を作る
- 中継なし方式の運用上の制約が明確になっている

Phase 5の確認結果:

1. 写真付き報告書の新規作成: 確認済み
2. 表紙画像のDriveアップロードとDriveフォルダ作成: 確認済み
3. 写真管理からの報告書写真アップロード: 確認済み
4. PDF確認画面でのDrive画像表示: 確認済み
5. Android Chromeでのログイン、Drive認可、画像アップロード、PDF画像表示: 確認済み
6. Android端末で写真なし施工報告書の新規作成、施工内容複数行、生息状況自動反映、PDF確認、PDF出力: 確認済み
7. Firestore `reports`保存内容の詳細確認: `scripts/verifyReports.mjs`で確認済み、`reports=7, issues=0`

次回の推奨順:

1. 一覧から写真なし施工報告書を再編集し、保存後も管理責任者、施工内容、生息状況が維持されるか確認する
2. 再編集時に施工内容の追加、削除、対象害虫獣変更を行い、生息状況の自動反映と重複統合が維持されるか確認する
3. 再編集後にFirestore `reports`を`scripts/verifyReports.mjs`で再検査する
4. Android、PC、必要に応じてiOSで写真なし施工報告書のPDFダウンロード後レイアウトを確認する
5. 写真付き報告書のFirestore保存内容とDrive参照情報を再確認する
6. 表紙画像・写真を差し替えた場合、古いDriveファイルは自動削除せず、後続で未参照画像の整理機能を設計する
7. 管理者、支店長、現場担当者、無効ユーザーの権限制御を確認する
8. Firestoreセキュリティルールを本番向けに整理する
9. 初回パスワード作成フローを実装する
10. OpenAI APIをサーバー経由で接続する

上から順に進める理由:

1. 現場利用では下書き再開と修正が頻繁に発生するため、再編集フローを早めに固める必要があるため
2. 施工内容と生息状況は連動しているため、再編集時の追加、削除、変更で連動状態が崩れないことを確認する必要があるため
3. 画面で正しく見えてもFirestore保存形式が崩れていると、別端末表示や次回編集で不具合になるため
4. PDFはお客様提出物なので、入力、保存、再編集が安定した後に紙面品質を詰めるのが効率的なため
5. 写真付き報告書は既に主要確認済みだが、写真なし側の作業後に既存機能へ影響がないか確認するため
6. 画像差し替え時のDriveファイル運用は自動削除しない方針に決定済み。容量増加に備えて、未参照画像を管理者確認で整理する設計が必要なため
7. 権限制御はデータ構造と画面導線が固まってから確認した方が漏れを見つけやすいため
8. セキュリティルールは実際のデータアクセスパターン確定後に作る方が過不足を減らせるため
9. 初回パスワード作成は認証運用の仕上げであり、既存ログインと権限確認後に実装する方が安全なため
10. OpenAI APIはサーバー側実装が必要で、報告書保存・再編集・PDFの基本フローが安定してから接続する方が切り分けしやすいため

### Phase 6: OpenAI API接続

目的: AI添削を本番APIへ接続する。

作業:

- Firebase Functions、Cloud Run、または別サーバーを選定
- OpenAI APIキーをサーバー側環境変数で管理
- 添削APIエンドポイントを実装
- フロントからサーバー経由で添削依頼
- 採用履歴をFirestoreへ保存
- エラー時の代替表示

完了条件:

- フロントにOpenAI APIキーが存在しない
- AI添削が実APIで動作する
- 採用履歴が次回プロンプトに反映される

### Phase 7: PDFと共有の本番仕上げ

目的: お客様提出用PDFの安定性を上げる。

作業:

- スマホでPDF生成確認
- iOS SafariでPDF共有確認
- Android ChromeでPDF共有確認
- Web Share API非対応時のダウンロード確認
- PDF生成後のGoogle Drive保存は画像保存検証後に判断する
- 長文や写真多数の場合のレイアウト検証

完了条件:

- 表紙、報告、写真ページが崩れない
- PDFを共有またはダウンロードできる
- 生成PDFを保存できる

### Phase 8: 写真管理改善

目的: 写真付き報告書の操作性を上げる。

作業:

- 写真ドラッグ並び替え
- 並び順の永続化
- 写真説明入力の操作改善
- 大量写真時の表示改善

完了条件:

- 写真の並び順をユーザーが変更できる
- PDF写真ページに変更後の順序が反映される

### Phase 9: PWAと実機検証

目的: スマートフォン現場利用に耐える状態にする。

作業:

- Service Worker導入
- ホーム画面追加検証
- 最低限のオフライン起動
- GPS検証
- カメラ検証
- 画像圧縮検証
- PDF共有検証

完了条件:

- iOS SafariとAndroid Chromeで主要フローが動く
- HTTPS環境でカメラ、GPS、共有が動く
- オフライン時の挙動が明確になっている

## 5. 優先順位まとめ

1. Phase 1: 既存プロトタイプの整理
2. Phase 2: Firebaseプロジェクト接続
3. Phase 3: 認証と権限管理
4. Phase 4: Firestore保存
5. Phase 5: Google Drive直接アップロード検証
6. Phase 6: OpenAI API接続
7. Phase 7: PDFと共有の本番仕上げ
8. Phase 8: 写真管理改善
9. Phase 9: PWAと実機検証

## 6. 次に着手するべき作業

写真なし施工報告書PDFまわりの直近確認、権限制御確認の一部、管理責任者固定化は完了扱いとし、次に着手するべき作業は以下の6項目。

1. Firestoreセキュリティルールを本番向けに整理する
2. `npm run verify:permissions:api`で管理者、支店長、現場担当者、無効ユーザー、未ログインの実Firebase権限を確認する
3. 権限制御、Firestoreセキュリティルール、管理責任者固定化まわりの変更を作業単位でコミットする
4. 初回パスワード作成フローを実装する
5. OpenAI APIをサーバー経由で接続する
6. iOS Safariでカメラ、GPS、PDF共有、Google Drive認可まわりを追加確認する

理由:

- Phase 1は完了済み
- Phase 2はFirebase Authentication、Firestore接続まで完了済み
- Phase 3はFirestore `users`照合と管理者権限判定まで完了済み
- Phase 4はFirestore `users`、`branches`、`reports`、`ai_corrections`保存まで実装済み
- repository境界を整理済み
- Firebase Storageは使用せず、画像保存はGoogle Drive APIへの中継なし直接アップロードで確認済み
- Android実機相当の確認として、Cloudflare Tunnel経由のAndroid Chromeで主要フロー確認済み
- 写真なし施工報告書の1枚PDF、施工内容複数行、施工内容マスタ連動、生息状況自動反映を実装済み
- Android端末で写真なし施工報告書の新規作成、PDF確認、PDF出力まで確認済み
- Firestore `reports`保存内容の詳細確認は`scripts/verifyReports.mjs`で完了済み。確認結果は`reports=7, issues=0`
- 報告書再編集時に画像、本文、施工内容、生息状況が維持されることは確認済み
- 旧「施工場所」入力欄は削除し、住所を施工場所として扱う方針へ変更済み
- PDF確認画面とPDF出力では、旧施工場所を表示せず住所を施工場所として表示する方針へ変更済み
- 写真なし施工報告書のレイアウト確認、現行PDF構造整理の要否判断、摘要欄長文対応の要否判断、作業単位コミット運用は完了扱い
- 現行PDF構造整理と摘要欄長文対応は、現在の見た目と運用で問題ないため後回し
- 権限制御確認のうち、ログイン可否、管理者ページアクセス、ホーム画面表示は完了扱い
- 無効社員はログイン不可、既存報告書の作成者名は保持、無効化しても過去報告書は削除しない方針で確認済み
- 無効社員が作成した報告書の編集は、管理者と、その社員が所属していた支店の支店長だけに制限するアプリ側ガードを実装済み
- 写真なし施工報告書の管理責任者は新規作成時に固定し、既存報告書を別支店ユーザーが開いても開いたユーザーの所属支店長へ上書きしないよう修正済み
- 残りはセキュリティルール整理、初回パスワード作成フロー、OpenAI API接続、iOS Safari追加検証

次回すり合わせる内容:

- 管理者以外が参照、作成、更新できるFirestoreデータ範囲
- 支店長ロールに支店内閲覧権限を持たせるか
- 無効ユーザーの既存報告書の扱いは、管理者と無効化前の所属支店の支店長だけ編集可能とする
- 初回パスワード作成をFirebase Authenticationのメールリンク方式にするか、管理者発行方式にするか
- Firestore Security Rules、初回パスワード作成、AI添削本番API接続の優先順位

Android実機テスト時の起動手順:

1. `npm run dev:android`でVite dev serverを`localhost:5173`に固定して起動する
2. 別ターミナルで`npm run tunnel:android`を実行し、Cloudflare Tunnelを`--protocol http2`固定で起動する
3. Tunnelログに表示される`https://...trycloudflare.com`をAndroid Chromeで開く
4. GoogleログインやDrive認可で「無効な生成元」が出た場合は、そのTunnel URLをGoogle Cloud ConsoleのOAuthクライアントへ追加する

## 7. 実装時の注意点

- 管理者機能を現場画面へ混ぜない
- 管理者画面は`/admin`配下に閉じる
- 社員・支店データ操作はrepositoryへ集約する
- 管理者判定は`adminGuardService`へ集約する
- OpenAI APIキーをフロントへ置かない
- 本物のパスワードをlocalStorageへ保存しない
- 写真、表紙画像はGoogle Drive APIへの中継なし直接アップロードを検証する
- PDFは当面、自動保存せずダウンロードとWeb Share API共有を継続する
- 会社共有フォルダへの集約や厳密な権限管理が必要になった場合は、Apps ScriptまたはCloud Runなどの中継方式を再検討する
- localStorageはMVP確認用の仮保存として扱う
- 実装ごとに`npm run build`で確認する
