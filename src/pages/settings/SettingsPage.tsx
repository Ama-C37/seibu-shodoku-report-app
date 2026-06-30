export function SettingsPage() {
  return (
    <main className="app-shell">
      <header className="subpage-header">
        <h1>設定</h1>
      </header>
      <section className="settings-list">
        <article>
          <h2>OpenAI API</h2>
          <p>APIキーはフロントエンドに直接置かず、Firebase Functionsなどのサーバー側で管理します。</p>
        </article>
        <article>
          <h2>Firebase連携</h2>
          <p>MVP初期段階はローカル保存で動作し、Repository層をFirebase実装へ差し替えます。</p>
        </article>
      </section>
    </main>
  );
}
