import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getRedis } from "../../../lib/redis";
import { validCpf } from "../../../lib/cpf";

export const runtime = "nodejs";

const SESSION_TTL_SECONDS = 20 * 60;
const MAX_NAME_LENGTH = 200;

type SessionData = {
  nome: string;
  cpf: string;
  nascimento: string;
  created_at: number;
  expires_at: number;
};

export async function POST(request: Request) {
  if (process.env.TYPEBOT_FLOW_ENABLED !== "true") {
    return NextResponse.json(
      { error: "O atendimento está temporariamente indisponível." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie os dados em formato JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados de confirmação inválidos." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const lookupId = typeof payload.lookupId === "string" ? payload.lookupId : "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(lookupId)) {
    return NextResponse.json({ error: "A confirmação é inválida ou expirou. Faça uma nova consulta." }, { status: 400 });
  }

  try {
    const redis = getRedis();
    const lookup = await redis.getdel<SessionData>(`cpf-confirmation:${lookupId}`);
    if (
      !lookup ||
      typeof lookup.nome !== "string" ||
      lookup.nome.length > MAX_NAME_LENGTH ||
      typeof lookup.cpf !== "string" ||
      !validCpf(lookup.cpf) ||
      typeof lookup.nascimento !== "string" ||
      lookup.nascimento.length > 32 ||
      typeof lookup.expires_at !== "number" ||
      lookup.expires_at <= Date.now()
    ) {
      return NextResponse.json(
        { error: "A confirmação é inválida ou expirou. Faça uma nova consulta." },
        { status: 404 }
      );
    }

    const sessionId = randomBytes(32).toString("base64url");
    const createdAt = Date.now();
    const session: SessionData = {
      nome: lookup.nome,
      cpf: lookup.cpf,
      nascimento: lookup.nascimento,
      created_at: createdAt,
      expires_at: createdAt + SESSION_TTL_SECONDS * 1000
    };
    await getRedis().set(`typebot-session:${sessionId}`, session, { ex: SESSION_TTL_SECONDS });

    return NextResponse.json(
      { success: true, session: sessionId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível iniciar o atendimento agora. Tente novamente." },
      { status: 503 }
    );
  }
}
