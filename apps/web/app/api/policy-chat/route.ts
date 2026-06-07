import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { POLICIES } from "../../lib/policies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

function pickPolicies(message: string) {
  const normalized = message.toLowerCase();
  const matches = POLICIES.filter((policy) => {
    const text = [
      policy.name,
      policy.oneLiner,
      policy.supportSummary,
      policy.target,
      policy.category,
      policy.level,
      policy.note ?? "",
      ...policy.stages
    ].join(" ");

    if (/(인천|천원|계양|산후|보증료|1\.0|이자지원)/.test(normalized)) {
      return policy.level === "city" || policy.level === "district" || /인천|계양|천원/.test(text);
    }
    if (/(신생아|출산|아이|아기|육아|산후)/.test(normalized)) {
      return (
        policy.category === "birth" ||
        policy.stages.includes("newborn") ||
        /신생아|출산|육아|산후/.test(text)
      );
    }
    if (/(전세|월세|임대|보증)/.test(normalized)) {
      return policy.category === "housing-rent" || /전세|임대|보증/.test(text);
    }
    if (/(구입|매매|디딤돌|보금자리|주담대|주택담보)/.test(normalized)) {
      return policy.category === "housing-loan" || /구입|디딤돌|보금자리|주택담보/.test(text);
    }
    if (/청년/.test(normalized)) {
      return policy.category === "youth" || policy.stages.includes("youth") || /청년/.test(text);
    }
    if (/(예정|결혼|신혼)/.test(normalized)) {
      return policy.stages.includes("engaged") || policy.stages.includes("married");
    }

    return false;
  });

  return matches.slice(0, 3);
}

function buildFallbackReply(messages: ChatMessage[]) {
  const last = messages[messages.length - 1]?.content ?? "";
  const picked = pickPolicies(last);

  if (picked.length === 0) {
    return "먼저 거주지가 인천인지, 전세/구입/출산 중 어떤 상황인지 하나만 알려주세요. 지금 등록된 정책 기준으로 맞는 항목만 추려드릴게요.";
  }

  const lines = picked.map((policy) => {
    return `${policy.name}: ${policy.oneLiner}. 신청/확인: ${policy.sourceUrl}`;
  });

  return `지금 조건이면 먼저 이 정책부터 확인해보세요.\n${lines.join("\n")}\n정확한 가능 여부는 혼인 시기, 거주지, 소득 조건을 한 번 더 확인해야 해요.`;
}

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: buildFallbackReply(trimmed) });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: trimmed.map((m) => ({ role: m.role, content: m.content }))
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ reply: text });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json({ reply: buildFallbackReply(trimmed) });
    }
    return NextResponse.json({ reply: buildFallbackReply(trimmed) });
  }
}
