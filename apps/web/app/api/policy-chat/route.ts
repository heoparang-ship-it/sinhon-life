import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { POLICIES } from "../../lib/policies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const POLICY_BRIEF = POLICIES.map((p) => {
  const elig = Object.entries(p.eligibility)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  return `- [${p.id}] ${p.name} (${p.level}, ${p.category})
  대상: ${p.target}
  지원: ${p.amountOrRate} · ${p.duration}
  자격: ${elig}
  운영: ${p.applicationOrg}
  출처: ${p.sourceUrl}`;
}).join("\n\n");

const SYSTEM_PROMPT = `너는 "신혼생활" 웹사이트의 AI 정책 톡 도우미야. 신혼·예비 신혼·출산을 앞둔 사람들에게 한국 정부·지자체 정책을 안내해.

말투: 친근하고 따뜻한 반말+존댓말 섞인 톡 스타일. 2-4문장으로 짧게. 카톡 버블에 들어갈 길이.
이모지: 가끔 1개 (🏠 💍 👶 💸 ✨ 정도). 남발 금지.

답할 때:
- 거주지·결혼 시기·소득 같은 핵심 조건을 모르면 먼저 1개만 물어봐 (한꺼번에 다 묻지 마)
- 정책을 추천할 땐 이름 + 한 줄 요약 + 신청처 URL
- 아래 정책 리스트에 없는 정책은 추측하지 말고 "공식 출처 확인이 필요해요"라고 말해
- 정책 외 잡담은 가볍게 받되 정책 주제로 돌려놔

아래는 너가 안내할 수 있는 정책 목록이야 (이 외의 정책은 모른다고 답해):

${POLICY_BRIEF}`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

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

  const trimmed = messages.slice(-20);

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }
      ],
      messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ reply: text });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API ${e.status}: ${e.message}` },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "응답 실패" }, { status: 500 });
  }
}
