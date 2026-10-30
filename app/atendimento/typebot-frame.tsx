"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type SessionResponse = {
  success: boolean;
  nome?: string;
  cpf?: string;
  error?: string;
};

export default function TypebotFrame({
  onNameLoaded
}: {
  onNameLoaded: (name: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initializeTypebot() {
      let session: string | null;
      try {
        session = window.sessionStorage.getItem("typebot-session");
      } catch {
        setError("Não foi possível recuperar a sessão deste atendimento. Volte à consulta e tente novamente.");
        return;
      }

      const typebotUrl = process.env.NEXT_PUBLIC_TYPEBOT_URL;
      if (!typebotUrl) {
        setError("O canal de atendimento está temporariamente indisponível.");
        return;
      }

      try {
        if (session && !/^[A-Za-z0-9_-]{43}$/.test(session)) {
          setError("Esta sessão não está disponível ou expirou. Volte à consulta e confirme seus dados novamente.");
          return;
        }

        const destination = new URL(typebotUrl);
        const typebotId = destination.pathname.split("/").filter(Boolean).at(-1);
        if (
          destination.protocol !== "https:" ||
          !typebotId ||
          !containerRef.current
        ) {
          setError("O endereço do canal de atendimento está inválido.");
          return;
        }

        const prefilledVariables: Record<string, string> = {};
        if (session) {
          const response = await fetch(`/api/session/${encodeURIComponent(session)}`, {
            cache: "no-store"
          });
          const payload = (await response.json()) as SessionResponse;
          if (
            !response.ok ||
            payload.success !== true ||
            typeof payload.nome !== "string" ||
            payload.nome.trim().length === 0 ||
            typeof payload.cpf !== "string" ||
            !/^\d{11}$/.test(payload.cpf)
          ) {
            setError(payload.error ?? "Não foi possível recuperar os dados desta sessão. Volte à consulta e tente novamente.");
            return;
          }

          const name = payload.nome.trim();
          prefilledVariables.session = session;
          prefilledVariables.nome = name;
          prefilledVariables.cpf = payload.cpf;
          onNameLoaded(name);
        }

        const config = JSON.stringify({
          typebot: typebotId,
          apiHost: destination.origin,
          prefilledVariables
        }).replace(/</g, "\\u003c");
        const frame = document.createElement("iframe");
        frame.className = "typebot-frame";
        frame.title = "Atendimento";
        frame.srcdoc = `<!doctype html>
          <html lang="pt-BR">
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                html, body { width: 100%; height: 100%; margin: 0; background: #f8f8f8; }
                typebot-standard { display: block; width: 100%; height: 100%; min-height: 100vh; }
              </style>
            </head>
            <body>
              <typebot-standard></typebot-standard>
              <script id="typebot-config" type="application/json">${config}</script>
              <script type="module">
                try {
                  const Typebot = await import("https://cdn.jsdelivr.net/npm/@typebot.io/js@0.10.11/dist/web.js");
                  Typebot.default.initStandard(JSON.parse(document.getElementById("typebot-config").textContent));
                  parent.postMessage({ type: "typebot-ready" }, "*");
                } catch {
                  parent.postMessage({ type: "typebot-error" }, "*");
                }
              </script>
            </body>
          </html>`;

        const handleEmbedMessage = (event: MessageEvent) => {
          if (event.source !== frame.contentWindow) return;
          if (event.data?.type === "typebot-error") {
            window.removeEventListener("message", handleEmbedMessage);
            window.clearTimeout(embedTimeout);
            setError("Não foi possível carregar o atendimento. Verifique sua conexão e tente novamente.");
          } else if (event.data?.type === "typebot-ready") {
            window.removeEventListener("message", handleEmbedMessage);
            window.clearTimeout(embedTimeout);
          }
        };
        window.addEventListener("message", handleEmbedMessage);
        const embedTimeout = window.setTimeout(() => {
          window.removeEventListener("message", handleEmbedMessage);
          setError("O atendimento demorou para carregar. Atualize a página e tente novamente.");
        }, 20000);
        containerRef.current.replaceChildren(frame);

        if (session) window.sessionStorage.removeItem("typebot-session");
      } catch {
        setError("Não foi possível carregar o atendimento. Verifique sua conexão e tente novamente.");
      }
    }

    void initializeTypebot();
  }, []);

  if (error) {
    return (
      <section className="atendimento-state" role="alert">
        <h1>Não foi possível abrir o atendimento</h1>
        <p>{error}</p>
        <a className="start-button" href="/consulta">Voltar à consulta</a>
      </section>
    );
  }

  return (
    <>
      <section className="attendant-bar" aria-label="Atendimento">
        <Image
          src="/assets/attendant-avatar.png"
          alt=""
          className="attendant-avatar"
          width={44}
          height={44}
        />
        <div>
          <p className="attendant-name">Leticia M.</p>
          <p className="attendant-label">Atendimento</p>
        </div>
      </section>
      <div
        ref={containerRef}
        className="typebot-container"
        aria-label="Atendimento"
      >
        <p className="atendimento-loading" role="status">
          Preparando seu atendimento...
        </p>
      </div>
    </>
  );
}
