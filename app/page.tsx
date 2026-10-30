import Link from "next/link";

export default function Home() {
  return (
    <main className="intro-page">
      <section className="intro-stage">
        <div className="intro-card">
          <img src="/assets/logo-mark.png" alt="" className="intro-logo" />
          <h1>Vamos começar?</h1>
          <p>
            Vamos começar?
            <br />
            Clique abaixo para prosseguir.
          </p>
          <Link className="intro-button" href="/verificacao">
            Prosseguir <span aria-hidden="true">→</span>
          </Link>
          <p className="intro-note">Continue para conhecer as próximas etapas.</p>
        </div>
      </section>
      <footer className="intro-footer">
        <nav aria-label="Links legais">
          <Link href="/renegociacao">Política de Privacidade</Link>
          <Link href="/renegociacao">Termos de Uso</Link>
          <a href="mailto:contato@exemplo.com">Contato</a>
        </nav>
        <p>© 2026</p>
      </footer>
    </main>
  );
}
