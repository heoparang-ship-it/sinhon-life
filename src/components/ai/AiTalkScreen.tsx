"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Church,
  Home,
  Mic,
  Plane,
  Send,
  Sofa,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

type LeadCategory = "sdm" | "venue" | "interior" | "goods" | "honeymoon";

type SlotsHint = {
  category?: LeadCategory;
  region?: string | null;
  budgetManwon?: number | null;
  weddingDate?: string | null;
  styleTags?: string[];
  priorityTag?: string | null;
};

type ChatCta = { type: "decision_lead"; category: LeadCategory; slotsHint: SlotsHint };

type Turn = {
  role: "user" | "assistant" | "system";
  content: string;
  messageId?: string | null;
  feedback?: 1 | 0 | -1;
  cta?: ChatCta | null;
  leadSubmitted?: boolean;
};

const SUGGESTIONS = [
  { icon: Camera, label: "부평 스드메 추천받기" },
  { icon: Church, label: "송도 예식장 비교" },
  { icon: Home, label: "신혼집 인테리어 상담" },
  { icon: Sofa, label: "혼수 가전·가구 추천" },
  { icon: Plane, label: "신혼여행 어디로 갈까?" },
] as const;

const CATEGORY_LABEL: Record<LeadCategory, string> = {
  sdm: "스드메",
  venue: "예식장",
  interior: "신혼집 인테리어",
  goods: "혼수 가전·가구",
  honeymoon: "신혼여행",
};

const REGION_LABEL: Record<string, string> = {
  "incheon-bupyeong": "인천 부평",
  "incheon-songdo": "인천 송도",
  "incheon-etc": "인천(기타)",
  etc: "기타 지역",
};

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
        cta?: ChatCta | null;
      };
      const reply = data.reply || data.error || "답변을 받지 못했어요.";
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: reply,
          messageId: data.messageId ?? null,
          feedback: 0,
          cta: data.cta ?? null,
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

  const markLeadSubmitted = (index: number) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === index ? { ...m, leadSubmitted: true } : m)),
    );
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
        {messages.map((m, i) => {
          if (m.role === "user") {
            return (
              <div key={i} className="mt-3 flex justify-end">
                <div
                  className="max-w-[78%] rounded-[18px] rounded-br-[6px] px-3.5 py-2.5 text-[14px] font-medium leading-relaxed text-white shadow-[0_4px_12px_-6px_rgba(43,123,197,0.4)]"
                  style={{
                    background: "linear-gradient(135deg,#3B8BCF 0%,#4F9CDB 100%)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            );
          }
          if (m.role === "system") {
            return (
              <div key={i} className="mt-3 flex justify-center">
                <div className="rounded-full bg-[#EAF3FB] px-3 py-1 text-[12px] font-semibold text-blue-deepest">
                  {m.content}
                </div>
              </div>
            );
          }
          return (
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
                {m.cta?.type === "decision_lead" && !m.leadSubmitted && sessionId && (
                  <DecisionLeadCard
                    sessionId={sessionId}
                    sourceMessageId={m.messageId ?? null}
                    category={m.cta.category}
                    prefilled={m.cta.slotsHint}
                    onSubmitted={() => {
                      markLeadSubmitted(i);
                      setMessages((prev) => [
                        ...prev,
                        {
                          role: "system",
                          content: "신청 받았어요. 영업일 기준 1~2일 안에 연락드릴게요 📞",
                        },
                      ]);
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

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
            placeholder="결혼 준비 뭐든 물어보세요 (예: 부평 스드메 1500)"
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

function DecisionLeadCard({
  sessionId,
  sourceMessageId,
  category,
  prefilled,
  onSubmitted,
}: {
  sessionId: string;
  sourceMessageId: string | null;
  category: LeadCategory;
  prefilled: SlotsHint;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [kakao, setKakao] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regionText = prefilled.region ? REGION_LABEL[prefilled.region] ?? prefilled.region : null;
  const summaryParts: string[] = [];
  if (regionText) summaryParts.push(regionText);
  if (typeof prefilled.budgetManwon === "number")
    summaryParts.push(`예산 ${prefilled.budgetManwon.toLocaleString()}만원`);
  if (prefilled.weddingDate) summaryParts.push(`예식 ${prefilled.weddingDate}`);
  if (prefilled.styleTags && prefilled.styleTags.length > 0)
    summaryParts.push(prefilled.styleTags.slice(0, 3).join("·"));
  if (prefilled.priorityTag) summaryParts.push(`우선: ${prefilled.priorityTag}`);

  const canSubmit = name.trim().length > 0 && /^[0-9+\-\s()]{9,20}$/.test(phone.trim()) && consent && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          category,
          sourceMessageId,
          slots: {
            budgetManwon: prefilled.budgetManwon ?? null,
            region: prefilled.region ?? null,
            weddingDate: prefilled.weddingDate ?? null,
            styleTags: prefilled.styleTags ?? [],
            priorityTag: prefilled.priorityTag ?? null,
          },
          contact: { name: name.trim(), phone: phone.trim(), kakao: kakao.trim() || undefined },
          consent: true,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "접수에 실패했어요.");
        setSubmitting(false);
        return;
      }
      onSubmitted();
    } catch {
      setError("네트워크 오류가 났어요. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-1 rounded-[16px] border border-[#CFDDEB] bg-white p-3 shadow-[0_4px_14px_-8px_rgba(20,50,90,0.25)]">
      <div className="flex items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#3B8BCF,#4F9CDB)" }}
        >
          {CATEGORY_LABEL[category]} 상담
        </span>
        <span className="text-[11px] font-semibold text-mute">맞춤 추천 받기</span>
      </div>
      {summaryParts.length > 0 && (
        <p className="mt-1.5 text-[12px] font-medium leading-snug text-ink-soft">
          {summaryParts.join(" · ")}
        </p>
      )}
      <div className="mt-2 flex flex-col gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          maxLength={30}
          className="rounded-[10px] border border-[#D8E5F0] bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#9CC7EA]"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="연락처 (010-0000-0000)"
          inputMode="tel"
          maxLength={20}
          className="rounded-[10px] border border-[#D8E5F0] bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#9CC7EA]"
        />
        <input
          value={kakao}
          onChange={(e) => setKakao(e.target.value)}
          placeholder="카카오톡 ID (선택)"
          maxLength={50}
          className="rounded-[10px] border border-[#D8E5F0] bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-[#9CC7EA]"
        />
      </div>
      <label className="mt-2 flex items-start gap-1.5 text-[10.5px] font-medium leading-snug text-mute">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-3 w-3 shrink-0 accent-blue-accent"
        />
        <span>
          개인정보 수집·이용 동의 (필수). 목적: 파트너 업체 견적·상담 연결 / 항목: 이름·연락처·카카오ID·상담 슬롯
          / 보유기간: 상담 완료 후 6개월 / 제3자 제공: 매칭된 파트너 업체에 한해 제공.
        </span>
      </label>
      {error && (
        <p className="mt-1.5 text-[11px] font-semibold text-[#D24A4A]">{error}</p>
      )}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className="mt-2 w-full rounded-full py-2 text-[13px] font-bold text-white shadow-[0_6px_14px_-6px_rgba(43,123,197,0.55)] transition disabled:opacity-40"
        style={{
          background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
        }}
      >
        {submitting ? "보내는 중…" : "맞춤 추천 신청"}
      </button>
    </div>
  );
}
