import Link from "next/link";

export default function PlataformaPage() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand-link" href="/" aria-label="Desenrola — página inicial">
          <img src="/assets/logo-mark.png" alt="" className="brand-logo" />
          <span>Desenrola</span>
        </Link>
        <Link className="header-action" href="/consulta">Entrar</Link>
      </header>

      <div className="finance-banner">
        <img
          src="/assets/finance-screen.png"
          alt="Pessoa usando um celular para acompanhar suas finanças"
        />
      </div>

      <section className="welcome-section">
        <div className="welcome-card">
          <img src="/assets/logo-mark.png" alt="Logomarca Desenrola" className="welcome-logo" />
          <h1>Um novo começo para suas finanças</h1>
          <p>Conheça possibilidades para organizar sua vida financeira.</p>
          <Link className="start-button" href="/consulta">
            Começar agora <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <p className="footer-title">Desenrola</p>
        <p>Todos os direitos reservados © 2026</p>
        <nav aria-label="Links legais">
          <Link href="/consulta">Política de Privacidade</Link>
          <Link href="/consulta">Termos de Uso</Link>
          <a href="mailto:contato@exemplo.com">Contato</a>
        </nav>
      </footer>
    </main>
  );
}
