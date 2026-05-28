import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Turn = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `당신은 한국 신혼생활 서비스 'sinhon.life'의 의사결정 도우미입니다.
신혼부부의 결혼 준비를 5대 결정점에서 도와요: ①스드메(sdm) ②예식장(venue) ③신혼집 인테리어(interior) ④혼수 가전·가구(goods) ⑤신혼여행(honeymoon).

지역 기본: 현재는 **인천(부평·송도) 중심**. 인천 외 지역을 물으면 "지금은 인천 부평·송도 중심이라 다른 지역은 아직 정확하지 않아요"라고 솔직히 안내해요.

톤·원칙:
- 따뜻하고 친근한 "~해요" 체. 반말 아님.
- 답변은 짧고 명확하게(3~6문장). 필요하면 번호/줄바꿈 사용.
- 모르는 건 추측하지 말고 "그건 확실하지 않아요". 특정 업체명·정확한 가격을 단정하지 않아요.
- 사용자 상황을 1~2개 짧게 되묻고 맞춤 도움 주려 함.

★의사결정 가드 모드(Choice Share 원칙):
- 5대 결정점 중 하나가 의도라고 판단되면, 대화에서 다음 슬롯을 자연스럽게 한두 개씩 채워요:
  category(5개 중 하나), region(incheon-bupyeong | incheon-songdo | incheon-etc | etc), budgetManwon(만원 단위 정수), weddingDate(YYYY-MM-DD), styleTags(배열), priorityTag(가격|품질|위치|기타)
- 비슷한 신혼들 비교는 "비슷한 신혼들은 평균 ○○만 원 정도예요" 같이 일반 범위로만, 정확한 시세는 "함께 확인해 봐요"로 덧붙여요.
- category 포함 4개 이상의 슬롯이 채워졌고 사용자가 추천을 원한다고 판단되면, 답변 마지막에 정확히 다음 두 줄을 추가해요(사용자 화면에서는 자동 제거됨):
[LEAD_CTA:<category>]
[SLOTS:<유효한 JSON 한 줄>]
- 슬롯이 부족하면 절대 LEAD_CTA를 출력하지 말고 다음 슬롯을 자연스럽게 물어요.`;

const isValidUuid = (s: unknown): s is string =>
  typeof s === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const LEAD_CATEGORIES = ["sdm", "venue", "interior", "goods", "honeymoon"] as const;
type LeadCategory = (typeof LEAD_CATEGORIES)[number];

type SlotsHint = {
  category?: LeadCategory;
  region?: string | null;
  budgetManwon?: number | null;
  weddingDate?: string | null;
  styleTags?: string[];
  priorityTag?: string | null;
};

type ChatCta = { type: "decision_lead"; category: LeadCategory; slotsHint: SlotsHint };

/** 모델 응답에서 [LEAD_CTA:<cat>] + [SLOTS:{...}] 토큰을 떼어내고 정제된 텍스트·cta 반환 */
function extractCta(raw: string): { text: string; cta: ChatCta | null } {
  const ctaRe = /\[LEAD_CTA:(sdm|venue|interior|goods|honeymoon)\]/i;
  const slotsRe = /\[SLOTS:(\{[\s\S]*?\})\]/i;

  const ctaMatch = raw.match(ctaRe);
  if (!ctaMatch) return { text: raw, cta: null };

  const category = ctaMatch[1].toLowerCase() as LeadCategory;

  let slotsHint: SlotsHint = { category };
  const slotsMatch = raw.match(slotsRe);
  if (slotsMatch) {
    try {
      const parsed = JSON.parse(slotsMatch[1]) as Partial<SlotsHint>;
      slotsHint = {
        category,
        region: typeof parsed.region === "string" ? parsed.region : null,
        budgetManwon:
          typeof parsed.budgetManwon === "number" && Number.isFinite(parsed.budgetManwon)
            ? Math.round(parsed.budgetManwon)
            : null,
        weddingDate:
          typeof parsed.weddingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.weddingDate)
            ? parsed.weddingDate
            : null,
        styleTags: Array.isArray(parsed.styleTags)
          ? parsed.styleTags.filter((t): t is string => typeof t === "string").slice(0, 8)
          : [],
        priorityTag: typeof parsed.priorityTag === "string" ? parsed.priorityTag : null,
      };
    } catch {
      /* JSON 파싱 실패 — category 만 사용 */
    }
  }

  const text = raw.replace(ctaRe, "").replace(slotsRe, "").trim();
  return { text, cta: { type: "decision_lead", category, slotsHint } };
}

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
  let rawReply: string;
  let degraded = false;
  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.6,
      max_tokens: 600,
    });
    rawReply =
      completion.choices?.[0]?.message?.content?.trim() ??
      "죄송해요, 답변을 만들지 못했어요. 다시 한 번 보내주실래요?";
  } catch (e) {
    console.error("/api/chat openai error:", e);
    rawReply = "지금은 답변이 어려워요. 잠시 후 다시 시도해 주세요.";
    degraded = true;
  }
  const latencyMs = Date.now() - startedAt;

  const { text: reply, cta } = degraded ? { text: rawReply, cta: null } : extractCta(rawReply);

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
    cta,
  });
}
