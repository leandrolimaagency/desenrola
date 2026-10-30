"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerificacaoPage() {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  function continueToPlatform(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (answer.trim() !== "2") {
      setError("Resposta incorreta. Tente novamente.");
      return;
    }
    router.push("/plataforma");
  }

  return (
    <main className="intro-page">
      <section className="intro-stage verification-stage">
        <div className="intro-card verification-background">
          <Image src="/assets/logo-mark.png" alt="" className="intro-logo" width={80} height={80} />
          <h1>Vamos começar?</h1>
          <p>Continue para conhecer as próximas etapas.</p>
          <span className="intro-button" aria-hidden="true">
            Prosseguir <span aria-hidden="true">→</span>
          </span>
        </div>

        <div className="verification-overlay">
          <section
            aria-labelledby="verification-title"
            className="verification-dialog"
          >
            <p className="verification-eyebrow">FILTRO SIMPLES ANTI-SPAM</p>
            <h1 id="verification-title">Antes de continuar</h1>
            <p className="verification-prompt">Resolva a conta para prosseguir.</p>
            <form onSubmit={continueToPlatform}>
              <label htmlFor="verification-answer">
                1 + 1 =
              </label>
              <input
                autoFocus
                id="verification-answer"
                inputMode="numeric"
                maxLength={2}
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value.replace(/\D/g, ""));
                  setError("");
                }}
              />
              <button type="submit">Confirmar e continuar</button>
            </form>
            {error && <p className="verification-error" role="alert">{error}</p>}
            <p className="verification-disclaimer">
              Isto não verifica sua identidade nem substitui medidas de segurança.
            </p>
          </section>
        </div>
      </section>
      <footer className="intro-footer">
        <nav aria-label="Links legais">
          <Link href="/consulta">Política de Privacidade</Link>
          <Link href="/consulta">Termos de Uso</Link>
          <a href="mailto:contato@exemplo.com">Contato</a>
        </nav>
      </footer>
    </main>
  );
}
