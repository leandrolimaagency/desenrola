import Image from "next/image";
import Link from "next/link";
import FirstStageButton from "./first-stage-button";

export default function Home() {
  return (
    <main className="offers-page">
      <section className="offers-stage">
        <div className="offers-visual" aria-hidden="true">
          <Image
            className="offers-attendant"
            src="/assets/offers-attendant.png"
            alt=""
            width={374}
            height={328}
            priority
          />
        </div>
        <div className="offers-card">
          <h1>VERIFIQUE AS OFERTAS</h1>
          <p>
            Dê o primeiro passo para conhecer as opções de atendimento do Desenrola.
          </p>
          <FirstStageButton />
        </div>
      </section>
      <footer className="offers-footer">
        <nav aria-label="Links legais">
          <Link href="/renegociacao">Política de Privacidade</Link>
          <Link href="/renegociacao">Termos de Uso</Link>
          <a href="mailto:contato@exemplo.com">Contato</a>
        </nav>
      </footer>
    </main>
  );
}
