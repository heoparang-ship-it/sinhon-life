"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const STORAGE_KEY = "sinhon.policy_chat.v1";
const INITIAL_GREETING: ChatMessage = {
  id: "greet-1",
  role: "assistant",
  content:
    "안녕하세요 신혼생활입니다 💍\n결혼·신혼·출산 관련 정부·지자체 정책을 안내해드려요.\n어떤 게 궁금하세요? (예: 신혼부부 전세대출, 신생아 특례)",
};

const QUICK_PROMPTS = [
  "신혼부부 전세대출 알려줘",
  "신생아 특례 디딤돌 자격 뭐야?",
  "인천 신혼 정책 뭐 있어?",
  "결혼 3개월 남았어 — 뭐부터 봐야 해?",
];

function newId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadStored(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as ChatMessage[];
  } catch {
    // ignore
  }
  return null;
}

export function PolicyChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setMessages(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // quota exceeded etc — ignore
    }
  }, [messages, hydrated]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/policy-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.role !== "assistant" || m.id !== INITIAL_GREETING.id)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "응답 실패");
      const reply = (data.reply as string | undefined)?.trim() || "응답이 비어있어요. 다시 한 번 물어봐 주실래요?";
      setMessages((curr) => [...curr, { id: newId(), role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      setError(msg);
      setMessages((curr) => [
        ...curr,
        { id: newId(), role: "assistant", content: `(잠깐, 답을 못 가져왔어요 — ${msg})` },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(input);
  }

  function reset() {
    setMessages([INITIAL_GREETING]);
    setError(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <div className="chat-frame">
      <div className="chat-frame-head">
        <div className="chat-frame-mark">
          <span>신혼생활</span>
          <strong>AI 정책 톡</strong>
        </div>
        <button type="button" className="chat-reset" onClick={reset} aria-label="대화 초기화">
          새로 시작
        </button>
      </div>

      <div className="chat-thread" ref={threadRef} aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.role}`}>
            {m.content.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ))}
        {pending && (
          <div className="chat-bubble assistant">
            <p className="chat-typing">
              <span /> <span /> <span />
            </p>
          </div>
        )}
      </div>

      {messages.length <= 1 && !pending && (
        <div className="chat-quick">
          {QUICK_PROMPTS.map((q) => (
            <button key={q} type="button" onClick={() => void send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input-row" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="조건이나 궁금한 정책을 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
          aria-label="메시지 입력"
        />
        <button type="submit" disabled={pending || !input.trim()}>
          {pending ? "…" : "전송"}
        </button>
      </form>

      {error && <p className="chat-error">{error}</p>}
      <p className="chat-note">대화는 이 기기에만 저장돼요. 정확한 신청 조건은 공식 출처에서 확인하세요.</p>
    </div>
  );
}
