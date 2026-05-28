import { NextResponse } from "next/server";
import OpenAI from "openai";

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

export async function POST(request: Request) {
  let body: { message?: string; history?: Turn[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "메시지가 비어 있어요." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // 키가 없으면 친절한 안내. 사용자에겐 자연스럽게 보임.
    return NextResponse.json({
      reply:
        "AI 연결이 아직 준비 중이에요. 잠시만 기다려주세요 🙏\n(서비스 설정에서 OpenAI 키를 등록하면 바로 답변할게요)",
      degraded: true,
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

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.6,
      max_tokens: 600,
    });
    const reply =
      completion.choices?.[0]?.message?.content?.trim() ??
      "죄송해요, 답변을 만들지 못했어요. 다시 한 번 보내주실래요?";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("/api/chat error:", e);
    return NextResponse.json(
      {
        reply: "지금은 답변이 어려워요. 잠시 후 다시 시도해 주세요.",
        degraded: true,
      },
      { status: 200 },
    );
  }
}
