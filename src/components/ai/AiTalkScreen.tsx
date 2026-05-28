"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Building2,
  Gift,
  Home,
  MapPin,
  Mic,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

type Turn = {
  role: "user" | "assistant";
  content: string;
  messageId?: string | null;
  feedback?: 1 | 0 | -1;
};

const SUGGESTIONS = [
  { icon: Home, label: "신혼부부 전세대출" },
  { icon: Gift, label: "출산지원금" },
  { icon: Building2, label: "신혼희망타운" },
  { icon: MapPin, label: "우리 동네 혜택" },
] as const;

const SESSION_KEY = "sinhon.ai.sessionId";

function ensureSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function AiTalkScreen() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(ensureSessionId());
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const nextHistory: Turn[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextHistory);
    setDraft("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history, sessionId }),
      });
      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        messageId?: string | null;
      };
      const reply = data.reply || data.error || "답변을 받지 못했어요.";
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: reply,
          messageId: data.messageId ?? null,
          feedback: 0,
        },
      ]);
    } catch {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: "지금은 답변이 어려워요. 잠시 후 다시 시도해 주세요.",
          feedback: 0,
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const submitFeedback = async (index: number, value: 1 | -1) => {
    const target = messages[index];
    if (!target || target.role !== "assistant") return;
    const next: 1 | 0 | -1 = target.feedback === value ? 0 : value;
    // 낙관적 업데이트
    setMessages((prev) =>
      prev.map((m, i) => (i === index ? { ...m, feedback: next } : m)),
    );
    if (!target.messageId) return; // 서버 저장 안 된 메시지(로깅 실패 등)
    try {
      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: target.messageId, feedback: next }),
      });
    } catch {
      /* 무시 — UI는 이미 반영됨 */
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white lg:h-full">
      {/* 채팅방 헤더 */}
      <header className="flex shrink-0 items-center gap-2.5 border-b border-[#EAF0F7] bg-white px-4 py-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_10px_-3px_rgba(43,123,197,0.5)]"
          style={{ background: "linear-gradient(135deg,#5AA3DC,#3B8BCF)" }}
        >
          <Sparkles size={16} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15.5px] font-bold leading-tight text-ink">정책 챗봇</div>
          <div className="mt-0.5 text-[12px] font-medium leading-none text-mute">
            AI 정책 도우미
          </div>
        </div>
      </header>

      {/* 채팅 영역 */}
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto bg-[#F4F8FC] px-4 py-4"
      >
        {/* AI 첫 메시지 */}
        <div className="flex items-end gap-2">
          <AiAvatar />
          <div className="max-w-[78%] rounded-[18px] rounded-bl-[6px] border border-[#D8E5F0] bg-white p-2 shadow-[0_2px_10px_-5px_rgba(20,50,90,0.18)]">
            <div className="relative aspect-[1.9/1] w-full overflow-hidden rounded-[12px] bg-[#E3EEF8]">
              <Image
                src="/ai/couple.png"
                alt="신혼부부 캐릭터"
                width={836}
                height={440}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="px-1.5 pb-1 pt-2">
              <p className="text-[15px] font-bold leading-tight text-ink">
                무엇이든 편하게 물어보세요
              </p>
              <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-soft">
                전세대출부터 출산지원금까지,
                <br />
                우리 부부에게 딱 맞는 혜택을 함께 찾아드릴게요
              </p>
            </div>
          </div>
        </div>

        {/* 추천 칩 */}
        {!hasMessages && (
          <div className="ml-10 mt-3 grid grid-cols-2 gap-2">
            {SUGGESTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => send(label)}
                disabled={pending}
                className="flex items-center gap-2 rounded-full border border-[#CFDDEB] bg-white px-3 py-2 text-left shadow-[0_2px_8px_-5px_rgba(20,50,90,0.2)] transition active:scale-[0.97] disabled:opacity-60"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCEBF9] text-blue-deepest">
                  <Icon size={12} strokeWidth={2.2} />
                </span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-bold text-ink">
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 대화 메시지들 */}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="mt-3 flex justify-end">
              <div
                className="max-w-[78%] rounded-[18px] rounded-br-[6px] px-3.5 py-2.5 text-[14px] font-medium leading-relaxed text-white shadow-[0_4px_12px_-6px_rgba(43,123,197,0.4)]"
                style={{
                  background:
                    "linear-gradient(135deg,#3B8BCF 0%,#4F9CDB 100%)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="mt-3 flex items-end gap-2">
              <AiAvatar />
              <div className="flex max-w-[78%] flex-col gap-1.5">
                <div
                  className="rounded-[18px] rounded-bl-[6px] border border-[#D8E5F0] bg-white px-3.5 py-2.5 text-[14px] font-medium leading-relaxed text-ink-soft shadow-[0_2px_10px_-5px_rgba(20,50,90,0.18)]"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {m.content}
                </div>
                <div className="flex items-center gap-1 pl-1">
                  <FeedbackButton
                    active={m.feedback === 1}
                    aria-label="도움이 됐어요"
                    onClick={() => submitFeedback(i, 1)}
                  >
                    <ThumbsUp size={12} strokeWidth={2.2} />
                  </FeedbackButton>
                  <FeedbackButton
                    active={m.feedback === -1}
                    aria-label="아쉬워요"
                    onClick={() => submitFeedback(i, -1)}
                  >
                    <ThumbsDown size={12} strokeWidth={2.2} />
                  </FeedbackButton>
                </div>
              </div>
            </div>
          ),
        )}

        {/* 타이핑 인디케이터 */}
        {pending && (
          <div className="mt-3 flex items-end gap-2">
            <AiAvatar />
            <div className="rounded-[18px] rounded-bl-[6px] border border-[#D8E5F0] bg-white px-3.5 py-3 shadow-[0_2px_10px_-5px_rgba(20,50,90,0.18)]">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* 입력바 + 동의 고지 */}
      <div
        className="shrink-0 bg-white px-3.5 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 108px)" }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="flex items-center gap-1 rounded-full border border-[#CFDDEB] bg-white py-2 pl-4 pr-2 shadow-[0_8px_22px_-10px_rgba(20,50,90,0.3)]"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="궁금한 정책을 입력해보세요"
            disabled={pending}
            className="min-w-0 flex-1 bg-transparent text-[14.5px] font-medium text-ink placeholder:text-mute focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            aria-label="음성 입력"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft"
          >
            <Mic size={18} strokeWidth={2} />
          </button>
          <button
            type="submit"
            aria-label="전송"
            disabled={pending || !draft.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_14px_-4px_rgba(43,123,197,0.55)] transition disabled:opacity-40"
            style={{
              background:
                "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
            }}
          >
            <Send size={17} strokeWidth={2.2} />
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10.5px] font-medium leading-tight text-mute">
          대화 내용은 서비스 개선 목적으로 저장될 수 있어요
        </p>
      </div>
    </div>
  );
}

function AiAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-[0_3px_8px_-3px_rgba(43,123,197,0.45)]"
      style={{ background: "linear-gradient(135deg,#5AA3DC,#3B8BCF)" }}
    >
      <Sparkles size={13} strokeWidth={2.2} />
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-[#9EB6CC] [animation-delay:-0.3s]" />
      <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-[#9EB6CC] [animation-delay:-0.15s]" />
      <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-[#9EB6CC]" />
    </span>
  );
}

function FeedbackButton({
  active,
  onClick,
  children,
  ...rest
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-6 w-6 items-center justify-center rounded-full border transition active:scale-90 ${
        active
          ? "border-blue-accent bg-blue-accent text-white"
          : "border-[#D8E5F0] bg-white text-ink-soft hover:bg-[#F4F8FC]"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}
