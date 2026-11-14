import Image from "next/image";
import Link from "next/link";
import CpfConsultation from "./cpf-consultation";

export default function ConsultaPage() {
  return (
    <main className="cpf-landing-page">
      <section className="cpf-landing-section">
        <div className="cpf-landing-content">
          <div className="cpf-landing-card">
            <p className="cpf-landing-badge">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>DESENROLA 3.0 VEM AÍ</span>
            </p>
            <h1>
              Saiba como vai funcionar
              <br />
              <span>a renegociação de dívidas</span>
            </h1>
            <div className="cpf-landing-description">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 19 6v5c0 4.5-2.9 7.7-7 10-4.1-2.3-7-5.5-7-10V6l7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p>
                Enquanto o programa de renegociação do governo se prepara para começar, você não
                precisa esperar: consulte seu CPF grátis e confira as ofertas para negociar na
                Acordo Certo.
              </p>
            </div>
            <CpfConsultation />
          </div>
          <Image
            className="cpf-landing-image"
            src="/assets/desenrola-brasil-3.png"
            alt="Desenrola Brasil 3.0, com uma mulher usando o celular"
            width={555}
            height={410}
            sizes="(max-width: 860px) 100vw, 555px"
            priority
          />
        </div>
      </section>

      <footer className="cpf-landing-footer">
        <nav aria-label="Links legais">
          <Link href="/renegociacao">Política de Privacidade</Link>
          <Link href="/renegociacao">Termos de Uso</Link>
          <a href="mailto:contato@exemplo.com">Contato</a>
        </nav>
      </footer>
    </main>
  );
}
