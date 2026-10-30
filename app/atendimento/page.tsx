"use client";

import Link from "next/link";
import { useState } from "react";
import TypebotFrame from "./typebot-frame";

export default function AtendimentoPage() {
  const [personName, setPersonName] = useState("");

  return (
    <main className="atendimento-page">
      <header className="site-header">
        <Link className="brand-link" href="/" aria-label="Desenrola — página inicial">
          <img src="/assets/logo-mark.png" alt="" className="brand-logo" />
          <span>Desenrola</span>
        </Link>
        <Link
          className="header-action"
          href="/consulta"
          title={personName || "Voltar"}
        >
          {personName || "Voltar"}
        </Link>
      </header>
      <TypebotFrame onNameLoaded={setPersonName} />
      <footer className="site-footer">
        <p className="footer-title">Desenrola</p>
        <p>Todos os direitos reservados © 2026</p>
        <nav aria-label="Links legais">
          <Link href="/consulta#privacidade">Política de Privacidade</Link>
          <Link href="/consulta#privacidade">Termos de Uso</Link>
          <a href="mailto:contato@exemplo.com">Contato</a>
        </nav>
      </footer>
    </main>
  );
}
