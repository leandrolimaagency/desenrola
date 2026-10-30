import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { validCpf } from "../../../lib/cpf";
import { getRedis } from "../../../lib/redis";

export const runtime = "nodejs";

type ProviderData = {
  name?: string;
  situation?: string;
  birthDate?: string;
};

function valueAsString(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function firstString(data: Record<string, unknown>, keys: string[]) {
  const wanted = new Set(keys.map((key) => key.toLowerCase().replace(/[_-]/g, "")));
  const visited = new Set<object>();

  function search(value: unknown): string | undefined {
    if (!value || typeof value !== "object" || visited.has(value)) return undefined;
    visited.add(value);
    const object = value as Record<string, unknown>;
    for (const [key, nestedValue] of Object.entries(object)) {
      if (wanted.has(key.toLowerCase().replace(/[_-]/g, ""))) {
        const result = valueAsString(nestedValue);
        if (result) return result;
      }
    }
    for (const nestedValue of Object.values(object)) {
      const result = search(nestedValue);
      if (result) return result;
    }
  }

  return search(data);
}

function normalizeProviderData(value: unknown): ProviderData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const data = value as Record<string, unknown>;
  return {
    name: firstString(data, ["name", "nome", "full_name", "nome_completo"]),
    situation: firstString(data, ["situation", "situacao", "situacao_cadastral", "status_cpf"]),
    birthDate: firstString(data, [
      "birthDate",
      "birth_date",
      "birthdate",
      "data_nascimento",
      "dataNascimento",
      "nascimento",
      "dt_nascimento",
      "date_of_birth",
      "dob"
    ])
  };
}

export async function POST(request: Request) {
  if (process.env.CPF_FLOW_ENABLED !== "true") {
    return NextResponse.json(
      { error: "A consulta está temporariamente indisponível." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie os dados da consulta em formato JSON." }, { status: 400 });
  }
  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const cpfInput = typeof payload.cpf === "string" ? payload.cpf : "";
  const cpf = cpfInput.replace(/\D/g, "");
  if (!validCpf(cpf)) return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
  if (payload.consent !== true) {
    return NextResponse.json({ error: "O consentimento é necessário para realizar a consulta." }, { status: 400 });
  }

  const providerUrl = process.env.CPF_PROVIDER_URL || "https://api.cpfcnpj.com.br/{token}/{package}/{cpf}";
  const providerToken = process.env.CPF_PROVIDER_TOKEN;
  if (!providerUrl || !providerToken) {
    return NextResponse.json({ error: "A consulta ainda não está configurada. Cadastre um provedor autorizado." }, { status: 503 });
  }

  const packageId = process.env.CPF_PROVIDER_PACKAGE || "1";
  const method = process.env.CPF_PROVIDER_METHOD?.toUpperCase() === "POST" ? "POST" : "GET";
  const url = providerUrl
    .replace("{token}", encodeURIComponent(providerToken))
    .replace("{package}", encodeURIComponent(packageId))
    .replace("{cpf}", encodeURIComponent(cpf));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify({ cpf }) } : {}),
      cache: "no-store",
      signal: controller.signal
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: "O provedor recusou a consulta." }, { status: 502 });
    }
    const result = normalizeProviderData(data);
    if (!result.name) {
      return NextResponse.json(
        { error: "Não encontramos dados para esse CPF. Confira o número e tente novamente." },
        { status: 404 }
      );
    }

    const lookupId = randomBytes(32).toString("base64url");
    const createdAt = Date.now();
    try {
      await getRedis().set(
        `cpf-confirmation:${lookupId}`,
        {
          nome: result.name,
          cpf,
          nascimento: result.birthDate ?? "",
          created_at: createdAt,
          expires_at: createdAt + 20 * 60 * 1000
        },
        { ex: 20 * 60 }
      );
    } catch {
      return NextResponse.json(
        { error: "A consulta foi feita, mas não foi possível preparar a confirmação. Tente novamente." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { ...result, cpf, lookupId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar o provedor." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
