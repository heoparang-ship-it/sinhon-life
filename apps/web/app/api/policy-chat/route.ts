import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { NormalizedPolicy } from "../policies/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SEED_BRIEF = `- 신혼부부 버팀목 전세자금대출 (주택도시기금): 혼인 7년 이내 무주택 부부 대상, 수도권 최대 3억, 연 1.5~2.7%. 출처: https://nhuf.molit.go.kr
- 신생아 특례 디딤돌 대출 (주택도시기금): 2년 내 출산 가구, 최대 5억, 연 1.6~3.3%. 출처: https://nhuf.molit.go.kr
- 신혼부부 특별공급 (국토교통부): 무주택 신혼부부 우선 공급, 공공 30%/민영 18%. 출처: https://www.applyhome.co.kr
- 첫만남이용권 (보건복지부): 출생아 1인당 200만원(둘째 300만원) 바우처. 출처: https://www.bokjiro.go.kr
- 난임부부 시술비 지원 (보건복지부): 체외수정 회당 최대 110만원. 출처: https://www.bokjiro.go.kr`;

async function fetchLivePolicies(origin: string): Promise<NormalizedPolicy[]> {
  try {
    const res = await fetch(`${origin}/api/policies`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { policies?: NormalizedPolicy[] };
    return json.policies ?? [];
  } catch {
    return [];
  }
}

function buildBrief(policies: NormalizedPolicy[]): string {
  if (policies.length === 0) return SEED_BRIEF;
  return policies
    .slice(0, 25)
    .map(
      (p) =>
        `- ${p.title} (${p.dept}, ${p.cat}): ${p.summary || p.support}. 대상: ${p.target || "-"} · 신청: ${p.howTo || "-"} · 기한: ${p.deadline}. 출처: ${p.sourceUrl}`
    )
    .join("\n");
}

function buildSystemPrompt(brief: string): string {
  return `너는 "신혼생활" 웹사이트의 AI 정책 톡 도우미 "두리AI"야. 신혼·예비 신혼·출산을 앞둔 사람들에게 한국 정부·지자체 정책을 안내해.

말투: 친근하고 따뜻한 톡 스타일. 2-4문장으로 짧게. 카톡 버블에 들어갈 길이.
이모지: 가끔 1개 (🏠 💍 👶 💸 ✨ 정도). 남발 금지.

답할 때:
- 거주지·결혼 시기·소득 같은 핵심 조건을 모르면 먼저 1개만 물어봐 (한꺼번에 다 묻지 마)
- 정책을 추천할 땐 이름 + 한 줄 요약 + 신청처 URL
- 아래 정책 리스트에 없는 정책은 추측하지 말고 "공식 출처(보조금24 등) 확인이 필요해요"라고 말해
- 정책 외 잡담은 가볍게 받되 정책 주제로 돌려놔

[참고할 수 있는 실시간 정책 리스트 — 보조금24 OpenAPI 기준]

${brief}`;
}

function fallbackReply(message: string, policies: NormalizedPolicy[]): string {
  const m = message.toLowerCase();
  const pool = policies.length > 0 ? policies : [];
  const matched = pool
    .filter((p) => {
      const t = `${p.title} ${p.cat} ${p.target} ${p.support}`.toLowerCase();
      if (/전세|대출/.test(m)) return /전세|대출|디딤돌|버팀목/.test(t);
      if (/청약|특공|특별공급/.test(m)) return /청약|특별공급/.test(t);
      if (/출산|신생아/.test(m)) return /출산|신생아|첫만남/.test(t);
      if (/육아|돌봄/.test(m)) return /육아|돌봄|보육/.test(t);
      if (/난임|시술/.test(m)) return /난임|시술/.test(t);
      return true;
    })
    .slice(0, 3);

  if (matched.length === 0) {
    return "거주지나 상황(전세/청약/출산 등) 하나만 알려주실래요? 그 기준으로 정책을 추려드릴게요 ✨";
  }
  const lines = matched.map((p) => `· ${p.title} — ${p.summary || p.support} (${p.sourceUrl})`);
  return `이 정책부터 확인해보세요:\n${lines.join("\n")}\n정확한 자격은 거주지·소득 기준을 한 번 더 봐주세요.`;
}

export async function POST(req: Request) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return NextResponse.json({ error: "마지막은 user 메시지여야 해요" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const policies = await fetchLivePolicies(origin);
  const trimmed = messages.slice(-20);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: fallbackReply(last.content, policies) });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: buildSystemPrompt(buildBrief(policies)),
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: trimmed.map((m) => ({ role: m.role, content: m.content }))
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ reply: text });
  } catch {
    return NextResponse.json({ reply: fallbackReply(last.content, policies) });
  }
}
