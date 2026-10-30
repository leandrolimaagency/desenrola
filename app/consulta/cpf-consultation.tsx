"use client";

import { FormEvent, useState } from "react";

type CpfResult = {
  name: string;
  cpf: string;
  birthDate?: string;
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

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export default function CpfConsultation() {
  const cpfFlowEnabled = process.env.NEXT_PUBLIC_CPF_FLOW_ENABLED === "true";
  const typebotConfigured = Boolean(process.env.NEXT_PUBLIC_TYPEBOT_URL);
  const [cpf, setCpf] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);
  const [result, setResult] = useState<CpfResult>();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setStatusIsSuccess(false);
    setResult(undefined);
    if (!cpfFlowEnabled) {
      setStatus("A consulta estará disponível após a configuração segura do atendimento.");
      return;
    }

    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) {
      setStatus("Digite um CPF válido com 11 números.");
      return;
    }
    if (!consent) {
      setStatus("Confirme o consentimento para consultar seus dados.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cpf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: digits, consent })
      });
      const payload = await response.json();

      if (!response.ok) {
        setStatus(payload.error ?? "Não foi possível realizar a consulta.");
        return;
      }
      setResult(payload);
      setStatus("Confira os dados antes de continuar.");
      setStatusIsSuccess(true);
    } catch {
      setStatus("Não foi possível realizar a consulta. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmAndContinue() {
    if (!cpfFlowEnabled) {
      setStatus("A consulta estará disponível após a configuração segura do atendimento.");
      setStatusIsSuccess(false);
      return;
    }
    if (!result || confirming) return;
    if (!consent) {
      setStatus("Confirme o consentimento para continuar.");
      setStatusIsSuccess(false);
      return;
    }
    const typebotUrl = process.env.NEXT_PUBLIC_TYPEBOT_URL;
    if (!typebotUrl) {
      setStatus("O atendimento ainda não está configurado. Tente novamente mais tarde.");
      setStatusIsSuccess(false);
      return;
    }

    setConfirming(true);
    setStatus("");
    setStatusIsSuccess(false);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookupId: result.lookupId })
      });
      const payload = await response.json();
      if (!response.ok || typeof payload.session !== "string") {
        setStatus(payload.error ?? "Não foi possível iniciar o atendimento.");
        return;
      }

      window.sessionStorage.setItem("typebot-session", payload.session);
      window.location.assign("/atendimento");
    } catch {
      setStatus("Não foi possível iniciar o atendimento. Verifique sua conexão e tente novamente.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="consultation-card">
      <p className="eyebrow">ETAPA FINAL · CONSULTA DIGITAL</p>
      <h1>Consulte seus dados</h1>
      <p className="muted">
        Informe seu CPF para consultar seus dados cadastrais. A consulta é realizada pela CPF.CNPJ.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="cpf">CPF</label>
        <input
          id="cpf"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(event) => {
            setCpf(formatCpf(event.target.value));
            setResult(undefined);
            setStatus("");
            setStatusIsSuccess(false);
          }}
          disabled={!cpfFlowEnabled || loading || confirming}
        />
        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              if (!event.target.checked) {
                setResult(undefined);
                setStatus("");
                setStatusIsSuccess(false);
              }
            }}
            disabled={!cpfFlowEnabled || loading || confirming}
          />
          <span>
            Autorizo o envio do meu CPF à CPF.CNPJ para consulta cadastral. O resultado ficará
            armazenado temporariamente por até 20 minutos para confirmação e continuidade
            do atendimento em nosso canal, conforme a{" "}
            <a href="#privacidade">política de privacidade</a>.
          </span>
        </label>
        <button type="submit" disabled={!cpfFlowEnabled || loading || confirming}>
          {!cpfFlowEnabled
            ? "Consulta temporariamente indisponível"
            : loading
              ? "Consultando..."
              : "Consultar CPF"}{" "}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      {!cpfFlowEnabled && (
        <p className="integration-note" role="status">
          Estamos finalizando a configuração segura da consulta. Nenhum CPF será enviado neste momento.
        </p>
      )}

      {status && (
        <p className={`${statusIsSuccess ? "success" : "error"} message`} role="status">
          {status}
        </p>
      )}
      {result && (
        <div className="result" aria-live="polite">
          <p><b>Nome:</b> {result.name}</p>
          <p><b>CPF:</b> {maskCpf(result.cpf)}</p>
          <p><b>Data de nascimento:</b> {result.birthDate || "Não informada pelo provedor"}</p>
          {typebotConfigured ? (
            <button
              className="confirm-button"
              type="button"
              onClick={confirmAndContinue}
              disabled={confirming}
            >
              {confirming ? "Preparando atendimento..." : "CONFIRMAR E CONTINUAR"}
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <p className="flow-disclaimer">
              Consulta concluída. O atendimento pelo Typebot ainda não está conectado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
