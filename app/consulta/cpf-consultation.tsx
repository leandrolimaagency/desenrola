"use client";

import { FormEvent, useState } from "react";
import { validCpf } from "../../lib/cpf";

type CpfLookup = {
  name: string;
  cpf: string;
  lookupId: string;
};

function formatCpf(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function CpfConsultation() {
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState("");
  const [lookup, setLookup] = useState<CpfLookup>();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLookup(undefined);

    const digits = cpf.replace(/\D/g, "");
    if (!validCpf(digits)) {
      setStatus("Digite um CPF válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cpf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: digits })
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const error =
          payload && typeof payload === "object" && "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Não foi possível realizar a consulta.";
        setStatus(error);
        return;
      }

      if (
        !payload ||
        typeof payload !== "object" ||
        !("name" in payload) ||
        typeof payload.name !== "string" ||
        !payload.name.trim() ||
        !("cpf" in payload) ||
        typeof payload.cpf !== "string" ||
        payload.cpf !== digits ||
        !("lookupId" in payload) ||
        typeof payload.lookupId !== "string" ||
        !/^[A-Za-z0-9_-]{43}$/.test(payload.lookupId)
      ) {
        setStatus("A consulta não retornou dados válidos. Confira o CPF e tente novamente.");
        return;
      }

      setLookup({
        name: payload.name.trim(),
        cpf: payload.cpf,
        lookupId: payload.lookupId
      });
    } catch {
      setStatus("Não foi possível consultar os dados. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmAndContinue() {
    if (!lookup || confirming) return;
    setStatus("");
    setConfirming(true);

    try {
      const sessionResponse = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookupId: lookup.lookupId })
      });
      const sessionPayload: unknown = await sessionResponse.json();
      const session =
        sessionPayload && typeof sessionPayload === "object" && "session" in sessionPayload &&
        typeof sessionPayload.session === "string"
          ? sessionPayload.session
          : "";

      if (!sessionResponse.ok || !/^[A-Za-z0-9_-]{43}$/.test(session)) {
        const error =
          sessionPayload && typeof sessionPayload === "object" && "error" in sessionPayload &&
          typeof sessionPayload.error === "string"
            ? sessionPayload.error
            : "Não foi possível iniciar o atendimento.";
        setStatus(error);
        return;
      }

      window.sessionStorage.setItem("typebot-session", session);
      window.location.assign("/atendimento");
    } catch {
      setStatus("Não foi possível iniciar o atendimento. Verifique sua conexão e tente novamente.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="consultation-card cpf-entry-card">
      <form onSubmit={submit}>
        <input
          id="cpf"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          aria-label="CPF"
          value={cpf}
          onChange={(event) => {
            setCpf(formatCpf(event.target.value));
            setStatus("");
            setLookup(undefined);
          }}
          disabled={loading || confirming}
        />
        <button type="submit" disabled={loading || confirming}>
          {loading ? "Consultando..." : "Consultar CPF grátis"}{" "}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      {lookup && (
        <section
          className="result cpf-confirmation"
          aria-labelledby="cpf-confirmation-title"
          aria-live="polite"
        >
          <h2 id="cpf-confirmation-title">Confirme seus dados</h2>
          <p>Confira se as informações abaixo estão corretas antes de continuar.</p>
          <dl>
            <div>
              <dt>Nome completo</dt>
              <dd>{lookup.name}</dd>
            </div>
            <div>
              <dt>CPF</dt>
              <dd>{formatCpf(lookup.cpf)}</dd>
            </div>
          </dl>
          <button
            className="confirm-button"
            type="button"
            onClick={confirmAndContinue}
            disabled={confirming}
          >
            {confirming ? "Preparando atendimento..." : "Confirmar e continuar"}
            <span aria-hidden="true">→</span>
          </button>
          <button
            className="cpf-correct-button"
            type="button"
            onClick={() => {
              setCpf("");
              setLookup(undefined);
              setStatus("");
            }}
            disabled={confirming}
          >
            Não sou eu. Corrigir CPF
          </button>
        </section>
      )}

      {status && (
        <p className="error message" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
