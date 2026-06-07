"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { POLIS_POLICIES, policyById, type PolisPolicy } from "./polis-data";

type Tab = "home" | "chat" | "geo" | "archive";
type ChatRole = "user" | "assistant";
type ChatMsg = { id: string; role: ChatRole; content: string };

const CHAT_KEY = "sinhon.polis_chat.v1";
const QUICK_PROMPTS = [
  "신혼부부 전세대출 얼마까지?",
  "신생아 특례 디딤돌 자격?",
  "결혼축하금 받을 수 있어?",
  "특별공급 청약 가점?"
];
const ARCHIVE_FILTERS = [
  { key: "전체", label: "전체" },
  { key: "주거", label: "주거·청약" },
  { key: "대출", label: "전세·대출" },
  { key: "출산", label: "출산" },
  { key: "육아", label: "육아" },
  { key: "혼인", label: "혼인·세제" }
];
const TOPICS: { cat: string; label: string; icon: PolisPolicy["icon"]; svg: ReactNode }[] = [
  {
    cat: "주거·청약",
    label: "주거·청약",
    icon: "b1",
    svg: (
      <>
        <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )
  },
  {
    cat: "전세·대출",
    label: "전세·대출",
    icon: "b2",
    svg: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18" strokeLinecap="round" />
      </>
    )
  },
  {
    cat: "출산",
    label: "출산",
    icon: "b4",
    svg: (
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
        strokeLinejoin="round"
      />
    )
  },
  {
    cat: "육아",
    label: "육아",
    icon: "b3",
    svg: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 21c0-4 3-7 7-7s7 3 7 7" strokeLinecap="round" />
      </>
    )
  },
  {
    cat: "혼인·세제",
    label: "혼인·세제",
    icon: "b5",
    svg: (
      <>
        <circle cx="8" cy="8" r="4" />
        <circle cx="16" cy="8" r="4" />
        <path d="M5 21c0-3 2-5 5-5M19 21c0-3-2-5-5-5" strokeLinecap="round" />
      </>
    )
  },
  {
    cat: "건강·난임",
    label: "건강·난임",
    icon: "b6",
    svg: (
      <>
        <path
          d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
          strokeLinejoin="round"
        />
        <path d="M9 11h6M12 8v6" strokeLinecap="round" />
      </>
    )
  }
];

function newId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function categoryFilter(p: PolisPolicy, key: string): boolean {
  if (key === "전체") return true;
  if (key === "주거") return p.cat === "주거·청약";
  if (key === "대출") return p.cat === "전세·대출";
  if (key === "출산") return p.cat === "출산";
  if (key === "혼인") return p.cat === "혼인·세제";
  return p.cat.includes(key);
}

export default function PolisApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [sheetId, setSheetId] = useState<string | null>(null);

  return (
    <div className="stage">
      <div className="phone">
        <div className="notch" />
        <StatusBar />

        <div className="viewport">
          <HomeScreen
            active={tab === "home"}
            onOpenChat={() => setTab("chat")}
            onOpenSheet={setSheetId}
            onGo={setTab}
          />
          <ChatScreen active={tab === "chat"} />
          <GeoScreen active={tab === "geo"} onOpenSheet={setSheetId} />
          <ArchiveScreen active={tab === "archive"} onOpenSheet={setSheetId} />

          <PolicySheet policyId={sheetId} onClose={() => setSheetId(null)} />
        </div>

        <TabBar tab={tab} onChange={setTab} />
        <div className="home-ind" />
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="statusbar">
      <span className="mono">9:41</span>
      <span className="icons">
        <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor">
          <rect x="0" y="8" width="3" height="5" rx="1" />
          <rect x="5" y="5" width="3" height="8" rx="1" />
          <rect x="10" y="2.5" width="3" height="10.5" rx="1" />
          <rect x="15" y="0" width="3" height="13" rx="1" />
        </svg>
        <svg width="17" height="13" viewBox="0 0 17 13" fill="currentColor">
          <path d="M8.5 2.6c2.3 0 4.4.9 6 2.4l1.2-1.3A11 11 0 0 0 8.5.6 11 11 0 0 0 1.3 3.7L2.5 5a8.4 8.4 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.4l1.2-1.3a7 7 0 0 0-9.2 0l1.2 1.3a4.8 4.8 0 0 1 3.4-1.4Zm0 3.5L10.2 11 8.5 12.7 6.8 11l1.7-1.3Z" />
        </svg>
        <svg width="25" height="13" viewBox="0 0 25 13" fill="none">
          <rect
            x="1"
            y="1"
            width="21"
            height="11"
            rx="3"
            stroke="currentColor"
            strokeOpacity=".4"
          />
          <rect x="2.5" y="2.5" width="17" height="8" rx="1.6" fill="currentColor" />
          <rect x="23" y="4.5" width="1.6" height="4" rx="1" fill="currentColor" fillOpacity=".5" />
        </svg>
      </span>
    </div>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { key: Tab; label: string; svg: ReactNode }[] = [
    {
      key: "home",
      label: "홈",
      svg: (
        <>
          <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )
    },
    {
      key: "chat",
      label: "정책챗봇",
      svg: (
        <path
          d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    },
    {
      key: "geo",
      label: "내 동네",
      svg: (
        <>
          <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" strokeLinejoin="round" />
          <circle cx="12" cy="9" r="2.4" />
        </>
      )
    },
    {
      key: "archive",
      label: "아카이브",
      svg: (
        <>
          <path
            d="M4 5a1 1 0 0 1 1-1h5a2 2 0 0 1 2 2v13a2 2 0 0 0-2-1.6H4z"
            strokeLinejoin="round"
          />
          <path
            d="M20 5a1 1 0 0 0-1-1h-5a2 2 0 0 0-2 2v13a2 2 0 0 1 2-1.6h6z"
            strokeLinejoin="round"
          />
        </>
      )
    }
  ];
  return (
    <nav className="tabbar">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          className={`tab${tab === it.key ? " on" : ""}`}
          onClick={() => onChange(it.key)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            {it.svg}
          </svg>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomeScreen({
  active,
  onOpenChat,
  onOpenSheet,
  onGo
}: {
  active: boolean;
  onOpenChat: () => void;
  onOpenSheet: (id: string) => void;
  onGo: (t: Tab) => void;
}) {
  const matches = useMemo(
    () =>
      POLIS_POLICIES.slice()
        .sort((a, b) => b.match - a.match)
        .slice(0, 3),
    []
  );
  return (
    <section className={`screen${active ? " active" : ""}`}>
      <div className="appbar">
        <div className="brand">
          <span className="mk" />
          신혼생활
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="iconbtn badge-dot" aria-label="알림">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path
                d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
            </svg>
          </button>
          <button className="av-btn" aria-label="마이페이지">
            지·현
          </button>
        </div>
      </div>

      <div className="h-greet">
        <p className="hi">서울 마포구 · 신혼 6개월차</p>
        <h1>
          <b>지민·현우</b>님 부부가
          <br />
          받을 수 있는 정책이에요
        </h1>
      </div>

      <div className="pad block" style={{ marginTop: 20 }}>
        <button className="benefit card-tap" type="button" onClick={() => onOpenSheet("p1")}>
          <div className="lbl">신혼부부 현금성 지원</div>
          <div className="amt mono">
            1,660<small>만원</small>
          </div>
          <div className="benefit-meta">
            <span className="bdot" />
            맞춤 정책 9개 · 전세대출 최대 4억 별도
          </div>
          <div className="cta">
            우리 부부 혜택 보기
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              width={16}
              height={16}
            >
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      <div className="pad block" style={{ marginTop: 14 }}>
        <button className="dday-widget" type="button" onClick={() => onOpenSheet("p8")}>
          <span className="dday-badge">D-7</span>
          <span className="dday-tx">
            <b>마포구 결혼축하금</b>
            <span>혼인신고 1년 이내 · 마감이 가까워요</span>
          </span>
          <span className="dday-chev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <div className="pad block" style={{ marginTop: 12 }}>
        <button className="ask-entry" type="button" onClick={onOpenChat}>
          <span className="av" />
          <span className="tx">
            <b>두리AI에게 물어보기</b>
            <span>“신혼부부 전세대출 얼마까지 돼요?”</span>
          </span>
          <span className="mic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1}>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <div className="pad block">
        <div className="sec-head">
          <h2 className="sec-title">우리 부부에게 딱 맞는</h2>
          <span className="more" onClick={() => onGo("archive")}>
            전체
          </span>
        </div>
        <div className="list">
          {matches.map((p) => (
            <button key={p.id} type="button" className="row" onClick={() => onOpenSheet(p.id)}>
              <span className={`ic ${p.icon}`}>
                <PolicyIcon icon={p.icon} />
              </span>
              <span className="tx">
                <b>{p.title}</b>
                <span>
                  {p.dept} · {p.amountSub}
                </span>
              </span>
              <span className="rt">
                <span className="v">{p.amount}</span>
                <span className="s">
                  <span className="match">매칭 {p.match}%</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="pad block">
        <h2 className="sec-title">관심사로 찾기</h2>
        <div className="topic-row">
          {TOPICS.map((t) => (
            <button key={t.cat} type="button" className="topic" onClick={() => onGo("archive")}>
              <span className={`ti ${t.icon}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  {t.svg}
                </svg>
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PolicyIcon({ icon }: { icon: PolisPolicy["icon"] }) {
  if (icon === "b1")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (icon === "b2")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18" strokeLinecap="round" />
      </svg>
    );
  if (icon === "b3")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 21c0-4 3-7 7-7s7 3 7 7" strokeLinecap="round" />
      </svg>
    );
  if (icon === "b4")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path
          d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (icon === "b5")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="8" cy="8" r="4" />
        <circle cx="16" cy="8" r="4" />
        <path d="M5 21c0-3 2-5 5-5M19 21c0-3-2-5-5-5" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
        strokeLinejoin="round"
      />
      <path d="M9 11h6M12 8v6" strokeLinecap="round" />
    </svg>
  );
}

function ChatScreen({ active }: { active: boolean }) {
  const INITIAL: ChatMsg = {
    id: "greet",
    role: "assistant",
    content:
      "안녕하세요, 두리AI입니다 💍\n신혼·예비 신혼부부 정책을 찾아드려요.\n어떤 게 궁금하세요?"
  };
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CHAT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      void 0;
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    } catch {
      void 0;
    }
  }, [messages, hydrated]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || pending) return;
    const userMsg: ChatMsg = { id: newId(), role: "user", content: t };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/policy-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.id !== "greet")
            .map((m) => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "응답 실패");
      const reply =
        (data.reply as string | undefined)?.trim() || "응답이 비어있어요. 다시 물어봐 주실래요?";
      setMessages((c) => [...c, { id: newId(), role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      setMessages((c) => [
        ...c,
        { id: newId(), role: "assistant", content: `(잠깐, 답을 못 가져왔어요 — ${msg})` }
      ]);
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setMessages([INITIAL]);
    try {
      window.localStorage.removeItem(CHAT_KEY);
    } catch {
      void 0;
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(input);
  }

  return (
    <section className={`chat-screen${active ? " active" : ""}`}>
      <div className="chat-head">
        <span className="av" />
        <div className="who">
          <b>두리AI</b>
          <span>
            <i className="live" />
            신혼부부 정책을 찾아드려요
          </span>
        </div>
        <button className="iconbtn" type="button" aria-label="새 대화" onClick={reset}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role === "user" ? "me" : "bot"}`}>
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="typing-b">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      {messages.length <= 1 && !pending && (
        <div className="chips">
          {QUICK_PROMPTS.map((q) => (
            <button key={q} type="button" className="chip" onClick={() => void send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
      <form className="chatbar" onSubmit={onSubmit}>
        <input
          className="field"
          type="text"
          placeholder="신혼 정책을 물어보세요…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
        />
        <button
          className="send"
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="전송"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </section>
  );
}

function GeoScreen({
  active,
  onOpenSheet
}: {
  active: boolean;
  onOpenSheet: (id: string) => void;
}) {
  return (
    <section className={`screen${active ? " active" : ""}`}>
      <div className="appbar">
        <div className="brand" style={{ fontSize: 19 }}>
          내 동네
        </div>
      </div>

      <div className="pad block" style={{ marginTop: 8 }}>
        <button type="button" className="region-pick">
          <span className="l">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" strokeLinejoin="round" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            서울 마포구
          </span>
          <span className="chev">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              width={20}
              height={20}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <div className="pad block" style={{ marginTop: 10 }}>
        <button className="cal-entry" type="button">
          <span className="cal-entry-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="cal-entry-tx">
            <b>정책 마감 캘린더</b>
            <span>마감이 가까운 정책을 한눈에</span>
          </span>
          <span className="cal-entry-chev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <div className="pad block">
        <div className="stat2">
          <div className="statcard">
            <div className="k">우리 동네 신혼 정책</div>
            <div className="v mono">
              26<small>건</small>
            </div>
            <div className="d">이번 달 +5건</div>
          </div>
          <div className="statcard">
            <div className="k">결혼·출산 축하금</div>
            <div className="v mono">
              300<small>만원</small>
            </div>
            <div className="d">마포구 최대</div>
          </div>
        </div>
      </div>

      <div className="pad block">
        <div className="sec-head">
          <h2 className="sec-title">예산 소진 현황</h2>
          <span className="more-tag">실시간</span>
        </div>
        <div className="list">
          <div className="budget">
            <div className="top">
              <b>신혼부부 전세임대주택</b>
              <span className="pct" style={{ color: "var(--red)" }}>
                88%
              </span>
            </div>
            <div className="prog hot">
              <i style={{ width: "88%" }} />
            </div>
            <div className="budget-sub">
              올해 공급 240호 중 <b style={{ color: "var(--red)" }}>잔여 29호</b>
            </div>
          </div>
          <div className="budget">
            <div className="top">
              <b>마포구 결혼축하금</b>
              <span className="pct" style={{ color: "var(--amber)" }}>
                61%
              </span>
            </div>
            <div className="prog warn">
              <i style={{ width: "61%" }} />
            </div>
            <div className="budget-sub">부부당 100만원 · 혼인신고 1년 이내</div>
          </div>
          <div className="budget">
            <div className="top">
              <b>첫째 출산장려금</b>
              <span className="pct" style={{ color: "var(--blue)" }}>
                42%
              </span>
            </div>
            <div className="prog">
              <i style={{ width: "42%" }} />
            </div>
            <div className="budget-sub">첫째 200만원 · 예산 여유 있음</div>
          </div>
        </div>
      </div>

      <div className="pad block">
        <h2 className="sec-title">마포구 신혼부부가 많이 받는</h2>
        <div className="list">
          <button className="row" type="button" onClick={() => onOpenSheet("p7")}>
            <span className="ic b1">
              <PolicyIcon icon="b1" />
            </span>
            <span className="tx">
              <b>신혼부부 전세임대주택</b>
              <span>신청 1위 · 부부 1,120쌍</span>
            </span>
            <span className="rt">
              <span className="rank">1위</span>
            </span>
          </button>
          <button className="row" type="button" onClick={() => onOpenSheet("p8")}>
            <span className="ic b5">
              <PolicyIcon icon="b5" />
            </span>
            <span className="tx">
              <b>마포구 결혼축하금</b>
              <span>신청 2위 · 부부 860쌍</span>
            </span>
            <span className="rt">
              <span className="rank">2위</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function ArchiveScreen({
  active,
  onOpenSheet
}: {
  active: boolean;
  onOpenSheet: (id: string) => void;
}) {
  const [filter, setFilter] = useState("전체");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    return POLIS_POLICIES.filter((p) => categoryFilter(p, filter)).filter((p) => {
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        p.title.toLowerCase().includes(s) ||
        p.cat.toLowerCase().includes(s) ||
        p.summary.toLowerCase().includes(s)
      );
    });
  }, [filter, q]);
  return (
    <section className={`screen${active ? " active" : ""}`}>
      <div className="appbar">
        <div className="brand" style={{ fontSize: 19 }}>
          아카이브
        </div>
      </div>
      <div className="arc-search">
        <input
          type="text"
          placeholder="정책·키워드 검색 (예: 전세, 출산)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="arc-filter">
        {ARCHIVE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`afc${filter === f.key ? " on" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="pad" style={{ marginTop: 6 }}>
        <button type="button" className="arc-hero card-tap" onClick={() => onOpenSheet("p3")}>
          <span className="arc-hero-grad" />
          <span className="arc-hero-tx">
            <span className="badge">이주의 정책 · 청약</span>
            <b>
              신혼·신생아·생애최초,
              <br />
              특별공급 완전 정복 가이드
            </b>
            <span className="meta">읽기 7분 · 06.05 발행</span>
          </span>
        </button>
      </div>

      <div className="pad block" style={{ marginTop: 24 }}>
        <h2 className="sec-title">신혼부부 최신 이슈</h2>
        <div className="arc-list">
          {list.length === 0 ? (
            <div className="arc-empty">조건에 맞는 정책이 없어요.</div>
          ) : (
            list.map((p) => (
              <button key={p.id} type="button" className="arc" onClick={() => onOpenSheet(p.id)}>
                <span className={`arc-thumb ${p.icon}`}>{p.short.slice(0, 2)}</span>
                <span className="info">
                  <span className="cat-t">{p.cat}</span>
                  <b>{p.title}</b>
                  <span className="meta">
                    {p.dept} · {p.amount}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function PolicySheet({ policyId, onClose }: { policyId: string | null; onClose: () => void }) {
  const p = policyId ? policyById(policyId) : null;
  const open = !!p;
  return (
    <>
      <div className={`sheet-scrim${open ? " open" : ""}`} onClick={onClose} />
      <div className={`sheet${open ? " open" : ""}`}>
        <div className="grab" />
        {p && (
          <>
            <span className="tag">
              {p.cat} · {p.dept}
            </span>
            <h3>{p.title}</h3>
            <p className="desc">{p.summary}</p>
            {p.benefits.map(([k, v]) => (
              <div key={k} className="kv">
                <span className="k">{k}</span>
                <span className="val blue">{v}</span>
              </div>
            ))}
            <h4
              style={{ margin: "22px 0 0", fontSize: 16, fontWeight: 800, letterSpacing: "-.03em" }}
            >
              신청 자격
            </h4>
            <ul className="elist">
              {p.eligibility.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
