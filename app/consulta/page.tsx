import Link from "next/link";
import CpfConsultation from "./cpf-consultation";

export default function ConsultaPage() {
  return (
    <main className="flow-page">
      <header className="site-header">
        <Link className="brand-link" href="/" aria-label="Desenrola — página inicial">
          <img src="/assets/logo-mark.png" alt="" className="brand-logo" />
          <span>Desenrola</span>
        </Link>
        <Link className="header-action" href="/plataforma">Voltar</Link>
      </header>

      <section className="consultation-section final-consultation" id="privacidade">
        <CpfConsultation />
      </section>

      <footer className="site-footer">
        <p className="footer-title">Desenrola</p>
        <p>Todos os direitos reservados © 2026</p>
        <nav aria-label="Links legais">
          <a href="#privacidade">Política de Privacidade</a>
          <a href="#privacidade">Termos de Uso</a>
          <a href="mailto:contato@exemplo.com">Contato</a>
        </nav>
      </footer>
    </main>
  );
}
