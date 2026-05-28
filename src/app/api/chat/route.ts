import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Turn = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `당신은 한국 신혼생활 서비스 'sinhon.life'의 AI 도우미입니다.
신혼부부의 결혼 준비(스튜디오·드레스·메이크업·웨딩홀·신혼집·정책혜택·예산 등)와 신혼생활 의사결정을 돕습니다.

원칙:
- 따뜻하고 친근한 톤. 반말 아님. "~해요" 체.
- 답변은 짧고 명확하게(3~6문장). 필요하면 번호/줄바꿈 사용.
- 모르는 정보는 추측하지 말고 "그건 확실하지 않아요" 라고 솔직히 말함.
- 정책·금액 수치는 항상 "검색·확인 권장"임을 덧붙임.
- 단순 정보 나열보다, 사용자 상황을 한두 가지 짧게 되묻고 맞춤 도움 주려 함.`;

const isValidUuid = (s: unknown): s is string =>
  typeof s === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function POST(request: Request) {
  let body: { message?: string; history?: Turn[]; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "메시지가 비어 있어요." }, { status: 400 });
  }

  const sessionId = isValidUuid(body.sessionId) ? body.sessionId : crypto.randomUUID();
  const model = process.env.OPENAI_CHAT_MODEL || "gpt-5-mini";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "AI 연결이 아직 준비 중이에요. 잠시만 기다려주세요 🙏\n(서비스 설정에서 OpenAI 키를 등록하면 바로 답변할게요)",
      degraded: true,
      sessionId,
    });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history
      .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
      .map((t) => ({ role: t.role, content: t.content })),
    { role: "user" as const, content: message },
  ];

  const startedAt = Date.now();
  let reply: string;
  let degraded = false;
  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.6,
      max_tokens: 600,
    });
    reply =
      completion.choices?.[0]?.message?.content?.trim() ??
      "죄송해요, 답변을 만들지 못했어요. 다시 한 번 보내주실래요?";
  } catch (e) {
    console.error("/api/chat openai error:", e);
    reply = "지금은 답변이 어려워요. 잠시 후 다시 시도해 주세요.";
    degraded = true;
  }
  const latencyMs = Date.now() - startedAt;

  // ─── 대화 로그 저장 (Supabase) ────────────────────────────────────
  // 실패해도 응답은 정상 반환 (fire-and-forget이지만 await로 짧게)
  let assistantMessageId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const { data: inserted } = await supabase
      .from("chat_logs")
      .insert([
        {
          user_id: userId,
          session_id: sessionId,
          role: "user",
          content: message,
          model,
        },
        {
          user_id: userId,
          session_id: sessionId,
          role: "assistant",
          content: reply,
          model,
          latency_ms: latencyMs,
        },
      ])
      .select("id, role");

    if (inserted) {
      const assistantRow = inserted.find((r) => r.role === "assistant");
      assistantMessageId = (assistantRow?.id as string) ?? null;
    }
  } catch (e) {
    console.warn("/api/chat logging skipped:", e);
  }

  return NextResponse.json({
    reply,
    sessionId,
    messageId: assistantMessageId,
    degraded,
  });
}
