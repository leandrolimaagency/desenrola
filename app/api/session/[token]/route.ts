import { NextResponse } from "next/server";
import { getRedis } from "../../../../lib/redis";

export const runtime = "nodejs";

type SessionData = {
  nome: string;
  cpf: string;
  nascimento: string;
  created_at: number;
  expires_at: number;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (process.env.TYPEBOT_FLOW_ENABLED !== "true") {
    return NextResponse.json(
      { success: false, error: "O atendimento está temporariamente indisponível." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return NextResponse.json(
      { success: false, error: "Sessão inválida ou expirada." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const session = await getRedis().get<SessionData>(`typebot-session:${token}`);
    if (
      !session ||
      typeof session.nome !== "string" ||
      typeof session.cpf !== "string" ||
      typeof session.nascimento !== "string" ||
      typeof session.expires_at !== "number" ||
      session.expires_at <= Date.now()
    ) {
      return NextResponse.json(
        { success: false, error: "Sessão inválida ou expirada." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        nome: session.nome,
        cpf: session.cpf,
        nascimento: session.nascimento
      },
      { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Não foi possível recuperar a sessão." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
