import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POLICIES } from "@/lib/policy/data";
import { searchGov24Services, dedupeAgainst, type Gov24Service } from "@/lib/policy/gov24";

/** 정책/지원금 의도 감지 — 보조금24 보조 컨텍스트 주입 트리거 */
const POLICY_INTENT_RE =
  /(지원금|혜택|보조금|지원\s*제도|정책|대출|버팀목|디딤돌|특례|전세|월세|보증금|이자\s*지원|출산|육아\s*수당|첫\s*만남|국민\s*행복|매입\s*임대|임대\s*주택|공공\s*임대|청년)/;

function looksLikePolicyQuery(text: string): boolean {
  return POLICY_INTENT_RE.test(text);
}

/** 보조금24 결과 → 시스템 컨텍스트 문자열 (top N) */
function gov24Context(items: Gov24Service[], limit = 8): string | null {
  if (items.length === 0) return null;
  const lines = items.slice(0, limit).map((it) => {
    const levelTag =
      it.level === "district" ? "군구" : it.level === "city" ? "지자체" : it.level === "central" ? "중앙" : "기관";
    const summary = it.summary ? ` — ${it.summary.slice(0, 80)}` : "";
    const org = it.org ? ` (${it.org})` : "";
    return `- ${it.name} [${levelTag}]${org}${summary}`;
  });
  return [
    "★보조금24에서 방금 조회한 추가 후보(인천·신혼부부 키워드 매칭, 큐레이트 11종 외):",
    ...lines,
    "안내 원칙: 위 후보는 정부 등록 메타데이터라 자격 세부조건은 별도 확인이 필요해요. 답변 시 \"방금 보조금24에서 찾아본 후보예요. 자세한 자격은 보조금24/소관기관에서 확인해요\" 톤으로 안내.",
  ].join("\n");
}

export const runtime = "nodejs";

type Turn = { role: "user" | "assistant"; content: string };

// 검증된 인천 정책 11종을 시스템 컨텍스트로 주입(이름·한줄·금액만 — 상세는 /policy로 유도)
const POLICY_CONTEXT = POLICIES.map(
  (p) => `- ${p.name} (${p.level === "central" ? "중앙" : p.level === "city" ? "인천시" : "군구"}): ${p.oneLiner} [${p.amountOrRate}]`,
).join("\n");

const SYSTEM_PROMPT = `당신은 한국 신혼생활 서비스 'sinhon.life'의 의사결정 도우미입니다. **인천 신혼부부 특화**예요.
신혼부부의 결혼 준비를 5대 결정점에서 도와요: ①스드메(sdm) ②예식장(venue) ③신혼집 인테리어(interior) ④혼수 가전·가구(goods) ⑤신혼여행(honeymoon).
여기에 더해, 인천 신혼부부가 받을 수 있는 **정책·지원금**을 가장 잘 아는 도우미예요.

지역 기본: **인천광역시 전역**. 인천 외 지역을 물으면 "지금은 인천 중심이라 다른 지역은 곧 오픈 예정이에요"라고 솔직히 안내해요.

★검증된 인천 신혼·청년 정책(이 목록 안에서만 안내하고, 더 궁금하면 앱의 '정책' 탭(/policy)을 권해요):
${POLICY_CONTEXT}

정책 안내 원칙:
- 사용자의 상황(혼인 여부·자녀·전월세/구입·소득대)을 1~2개 물어 맞는 정책을 골라줘요.
- 생애주기 조합을 제안해요. 예: "출산 후 전세 거주면 신생아 특례 버팀목 + 전세보증료 지원을 같이 보세요."
- 금액·조건은 위 목록 범위로만. 정확한 자격·최신 공고는 "정책 탭에서 공식 링크로 확인해요"로 안내.
- 정책으로 절약한 뒤 자연스럽게 5대 결정(스드메·집·혼수 등)으로 이어줘요.

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

type ProfileHint = {
  weddingDate?: string | null;
  region?: string | null;
};

const REGION_KOR: Record<string, string> = {
  "incheon-bupyeong": "인천 부평",
  "incheon-songdo": "인천 송도",
  "incheon-etc": "인천(기타)",
  etc: "기타 지역",
};

function profileContext(p: ProfileHint | undefined): string | null {
  if (!p) return null;
  const parts: string[] = [];
  if (p.region && REGION_KOR[p.region]) parts.push(`거주(예정) 지역: ${REGION_KOR[p.region]}`);
  if (p.weddingDate && /^\d{4}-\d{2}-\d{2}$/.test(p.weddingDate))
    parts.push(`예식 예정일: ${p.weddingDate}`);
  if (parts.length === 0) return null;
  return `사용자 컨텍스트: ${parts.join(" · ")}. 이 정보를 답변·슬롯 추출에 반영해요.`;
}

export async function POST(request: Request) {
  let body: { message?: string; history?: Turn[]; sessionId?: string; profile?: ProfileHint };
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
  const ctx = profileContext(body.profile);

  // 정책 의도 감지 시 보조금24 호출 — 큐레이트 11종 중복 제외 후 상위 8건 컨텍스트로 주입
  let gov24Ctx: string | null = null;
  if (looksLikePolicyQuery(message)) {
    const fresh = await searchGov24Services({ keyword: "신혼부부", region: "인천광역시", perPage: 30 });
    const filtered = dedupeAgainst(fresh, POLICIES.map((p) => p.name));
    gov24Ctx = gov24Context(filtered, 8);
  }

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...(ctx ? [{ role: "system" as const, content: ctx }] : []),
    ...(gov24Ctx ? [{ role: "system" as const, content: gov24Ctx }] : []),
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
