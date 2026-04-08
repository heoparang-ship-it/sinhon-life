import { NextRequest, NextResponse } from "next/server";
import { RAG_SYSTEM_PROMPT_TEMPLATE } from "@/lib/constants";
import { retrieveContext, buildContextString } from "@/lib/rag";
import { checkRateLimit } from "@/lib/rateLimit";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "너무 많은 요청이 발생했어요. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "서비스 설정 중입니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages: Message[] = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "메시지가 없습니다." }, { status: 400 });
    }

    // 입력 검증
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.content.length > 500) {
      return NextResponse.json({ error: "메시지가 너무 길어요. 500자 이내로 입력해주세요." }, { status: 400 });
    }

    // 연속 동일 role 메시지 병합
    const mergedMessages: Message[] = [];
    for (const msg of messages) {
      const last = mergedMessages[mergedMessages.length - 1];
      if (last && last.role === msg.role) {
        last.content += "\n" + msg.content;
      } else {
        mergedMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // RAG: Pinecone에서 관련 문서 검색
    let contextString = "관련 참고 자료가 없습니다.";
    try {
      if (process.env.PINECONE_API_KEY) {
        const contexts = await retrieveContext(lastMsg.content, 5);
        contextString = buildContextString(contexts);
      }
    } catch (ragError) {
      console.error("RAG 검색 실패 (폴백으로 진행):", ragError);
    }

    // 동적 시스템 프롬프트 생성
    const systemPrompt = RAG_SYSTEM_PROMPT_TEMPLATE.replace("{CONTEXT}", contextString);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: mergedMessages,
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.status);
      if (response.status === 429) {
        return NextResponse.json({ error: "지금 상담 요청이 많아요. 잠시 후 다시 시도해주세요." }, { status: 429 });
      }
      return NextResponse.json({ error: "상담사가 일시적으로 응답할 수 없어요. 잠시 후 다시 시도해주세요." }, { status: 502 });
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text ?? "죄송해요, 응답을 받지 못했어요.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
