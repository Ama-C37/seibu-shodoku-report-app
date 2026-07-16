# Google Drive直接アップロード設定メモ

このアプリではFirebase Storageを使わず、検証段階としてフロントエンドからGoogle Drive APIへ直接画像をアップロードする。

## 方針

- 中継サーバーは使わない
- 会社共有フォルダではなく、ユーザー個人のGoogle Driveへ保存する
- Drive APIスコープは`https://www.googleapis.com/auth/drive.file`を使う
- アプリが作成したファイルだけを扱う検証にする
- Firestore `reports`には画像本体ではなく、Driveの`fileId`や参照URLを保存する

## Google Cloud Consoleで必要な設定

1. Google Cloud Consoleでプロジェクトを開く
2. Google Drive APIを有効化する
3. OAuth同意画面を設定する
4. OAuthクライアントIDを作成する
5. アプリケーションの種類はWebアプリケーションを選ぶ
6. 承認済みJavaScript生成元に開発URLを追加する
   - `http://localhost:5175`
   - 実際にViteが起動しているポートに合わせる
7. 発行されたクライアントIDを`.env`へ設定する

```env
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

## アプリでの確認手順

現在、1から7までは確認済み。

1. `.env`へ`VITE_GOOGLE_CLIENT_ID`を設定する
2. Vite dev serverを再起動する
3. アプリへログインする
4. 設定画面を開く
5. `Google Drive保存先確認`を押す
6. Googleアカウントの認可画面で許可する
7. Google Drive内に`Seibu Report App/reports/connection-test`が作成されることを確認する
8. 写真付き報告書を作成する
9. 表紙画像または報告書写真を追加する
10. Google Drive内に`Seibu Report App/reports/{reportId}`が作成されることを確認する
11. Firestore `reports`にDrive参照情報が保存されることを確認する
12. 一覧から再編集し、Drive画像が表示されることを確認する
13. PDF確認画面でDrive画像が表示されることを確認する

## 注意点

- Google Driveの通常URLは`<img src="">`で安定表示できない場合がある
- 現在は`thumbnailLink`を優先し、なければ`https://drive.google.com/uc?export=view&id={fileId}`形式を使う
- 設定画面の保存先確認では、テスト用フォルダ`connection-test`を作成する
- 個人Drive保存のため、別ユーザーが同じ画像を閲覧できるとは限らない
- 会社共有フォルダへ集約する本番運用では、Apps ScriptまたはCloud Runなどの中継方式を再検討する
- `.env`変更後はdev serverを再起動する
- 設定画面に`認可状態: 認可済み`と表示されれば、同じブラウザセッション内では画像追加時の再認可を省略できる
- 設定画面で事前に保存先確認を行うと、写真選択時の認可ポップアップ失敗を避けやすい
