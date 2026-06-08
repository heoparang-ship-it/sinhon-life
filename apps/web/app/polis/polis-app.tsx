"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { POLIS_POLICIES, type PolisPolicy } from "./polis-data";
import { Onboarding } from "./onboarding";
import {
  INTERESTS,
  REGIONS,
  makeInviteCode,
  useApplied,
  useBookmarks,
  useProfile,
  useReadNotifications,
  useViews,
  type Profile
} from "./profile-store";
import { formatCount, sparkPath, track, trendFor, useLiveTick } from "./trend";
import { TrendScreen } from "./trend-screen";

const GOV24_PORTAL = "https://www.gov.kr/portal/onestopSvc/maritalSupport";

type LivePolicy = {
  id: string;
  title: string;
  dept: string;
  cat: string;
  icon: PolisPolicy["icon"];
  summary: string;
  target: string;
  support: string;
  howTo: string;
  deadline: string;
  sourceUrl: string;
};

function liveToPolis(p: LivePolicy, idx: number): PolisPolicy {
  return {
    id: p.id,
    cat: p.cat,
    dept: p.dept,
    icon: p.icon,
    title: p.title,
    short: p.title.slice(0, 12),
    amount: p.support ? p.support.slice(0, 12) : "지원",
    amountSub: p.support ? p.support.slice(0, 28) : p.target.slice(0, 28),
    match: 88 - (idx % 10),
    deadline: p.deadline,
    deadlineTag: p.deadline.length > 6 ? p.deadline.slice(0, 6) : p.deadline,
    cash: 0,
    dday: null,
    summary: p.summary || p.support,
    benefits: [
      ["지원 내용", p.support || "-"],
      ["대상", p.target || "-"],
      ["신청 방법", p.howTo || "-"],
      ["신청 기한", p.deadline]
    ],
    eligibility: p.target ? [p.target] : ["공식 출처 참조"],
    sourceUrl: p.sourceUrl
  };
}

function useLivePolicies(): PolisPolicy[] {
  const [live, setLive] = useState<PolisPolicy[]>(POLIS_POLICIES);
  useEffect(() => {
    let cancel = false;
    fetch("/api/policies")
      .then((r) => r.json())
      .then((j: { policies?: LivePolicy[] }) => {
        if (cancel) return;
        const arr = j.policies ?? [];
        if (arr.length === 0) return;
        const mapped = arr.map(liveToPolis);
        const merged = [
          ...POLIS_POLICIES,
          ...mapped.filter((p) => !POLIS_POLICIES.some((s) => s.id === p.id))
        ];
        setLive(merged);
      })
      .catch(() => {
        /* keep seed */
      });
    return () => {
      cancel = true;
    };
  }, []);
  return live;
}

type Tab = "home" | "chat" | "geo" | "archive";
type Overlay = "notif" | "mypage" | "calendar" | "trends" | null;
type ChatRole = "user" | "assistant";
type ChatMsg = { id: string; role: ChatRole; content: string };

const CHAT_KEY = "sinhon.polis_chat.v1";
const QUICK_PROMPTS = [
  "신혼부부 전세대출 얼마까지?",
  "신생아 특례 디딤돌 자격?",
  "결혼축하금 받을 수 있어?",
  "특별공급 청약 가점?"
];
const ALL_CATS = ["전체", "주거/청약", "전세/대출", "출산", "육아", "혼인/세제", "건강/난임"];
const TOPICS: { cat: string; label: string; icon: PolisPolicy["icon"]; svg: ReactNode }[] = [
  {
    cat: "주거/청약",
    label: "주거/청약",
    icon: "b1",
    svg: (
      <>
        <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )
  },
  {
    cat: "전세/대출",
    label: "전세/대출",
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
    cat: "혼인/세제",
    label: "혼인/세제",
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
    cat: "건강/난임",
    label: "건강/난임",
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

function Sep() {
  return <span className="sep" aria-hidden="true" />;
}

export default function PolisApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [regionSheet, setRegionSheet] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState("전체");

  const policies = useLivePolicies();
  const [profile, setProfile] = useProfile();
  const bookmarks = useBookmarks();
  const applied = useApplied();
  const views = useViews();
  const readNotif = useReadNotifications();

  const scored = useMemo(() => scorePolicies(policies, profile), [policies, profile]);

  const notifications = useMemo(
    () => buildNotifications(scored, bookmarks.ids.length),
    [scored, bookmarks.ids.length]
  );
  const unread = notifications.some((n) => !readNotif.has(n.id));

  function openSheet(id: string) {
    views.record(id);
    track("view", id, profile?.region);
    setSheetId(id);
  }
  function pickCategory(cat: string) {
    setArchiveFilter(cat);
    setOverlay(null);
    setTab("archive");
  }
  function openNotif() {
    setOverlay("notif");
    readNotif.markAll(notifications.map((n) => n.id));
  }

  if (!profile) {
    return (
      <div className="stage">
        <div className="phone">
          <div className="notch" />
          <StatusBar />
          <div className="viewport">
            <Onboarding onDone={(p) => setProfile(p)} />
          </div>
          <div className="home-ind" />
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="phone">
        <div className="notch" />
        <StatusBar />

        <div className="viewport">
          <HomeScreen
            active={tab === "home"}
            policies={scored}
            profile={profile}
            hasUnread={unread}
            onOpenChat={() => setTab("chat")}
            onOpenSheet={openSheet}
            onOpenNotif={openNotif}
            onOpenMypage={() => setOverlay("mypage")}
            onPickCategory={pickCategory}
            onGoArchive={() => setTab("archive")}
            onOpenTrends={() => setOverlay("trends")}
          />
          <ChatScreen active={tab === "chat"} profile={profile} />
          <GeoScreen
            active={tab === "geo"}
            policies={scored}
            profile={profile}
            onOpenSheet={openSheet}
            onOpenCalendar={() => setOverlay("calendar")}
            onOpenRegion={() => setRegionSheet(true)}
          />
          <ArchiveScreen
            active={tab === "archive"}
            policies={scored}
            filter={archiveFilter}
            onFilter={setArchiveFilter}
            onOpenSheet={openSheet}
          />

          {overlay === "calendar" && (
            <CalendarScreen
              policies={scored}
              onBack={() => setOverlay(null)}
              onOpenSheet={openSheet}
            />
          )}
          {overlay === "trends" && (
            <TrendScreen
              policies={scored}
              onBack={() => setOverlay(null)}
              onOpenSheet={openSheet}
            />
          )}
          {overlay === "notif" && (
            <NotificationScreen
              items={notifications}
              onBack={() => setOverlay(null)}
              onOpenSheet={openSheet}
            />
          )}
          {overlay === "mypage" && (
            <MyPageScreen
              profile={profile}
              setProfile={setProfile}
              policies={scored}
              bookmarks={bookmarks}
              applied={applied}
              views={views}
              onBack={() => setOverlay(null)}
              onOpenSheet={openSheet}
              onOpenRegion={() => setRegionSheet(true)}
            />
          )}

          <RegionSheet
            open={regionSheet}
            current={profile.region}
            onClose={() => setRegionSheet(false)}
            onPick={(r) => {
              setProfile({ ...profile, region: r });
              setRegionSheet(false);
            }}
          />

          <PolicySheet
            policies={scored}
            policyId={sheetId}
            bookmarks={bookmarks}
            applied={applied}
            views={views}
            onClose={() => setSheetId(null)}
          />
        </div>

        <TabBar tab={tab} onChange={setTab} />
        <div className="home-ind" />
      </div>
    </div>
  );
}

function scorePolicies(list: PolisPolicy[], profile: Profile | null): PolisPolicy[] {
  if (!profile) return list;
  const interests = new Set(profile.interests);
  const region = profile.region;
  const gu = region.split(" ").pop() ?? "";
  return list
    .map((p) => {
      let m = 78;
      if (interests.has(p.cat)) m += 14;
      if (gu && p.dept.includes(gu)) m += 5;
      m = Math.max(60, Math.min(99, m));
      return { ...p, match: m };
    })
    .sort((a, b) => b.match - a.match);
}

/* ---------------- notifications ---------------- */
type Notif = {
  id: string;
  kind: "deadline" | "hot" | "bookmark";
  title: string;
  sub: string;
  policyId?: string;
};

function buildNotifications(policies: PolisPolicy[], bookmarkCount: number): Notif[] {
  const out: Notif[] = [];
  policies
    .filter((p) => p.dday !== null && (p.dday ?? 999) <= 30)
    .sort((a, b) => (a.dday ?? 999) - (b.dday ?? 999))
    .slice(0, 5)
    .forEach((p) =>
      out.push({
        id: `dl-${p.id}`,
        kind: "deadline",
        title: `마감 D-${p.dday} — ${p.title}`,
        sub: p.deadline,
        policyId: p.id
      })
    );
  policies
    .map((p) => ({ p, t: trendFor(p.id) }))
    .sort((a, b) => b.t.delta - a.t.delta)
    .slice(0, 3)
    .forEach(({ p, t }) =>
      out.push({
        id: `hot-${p.id}`,
        kind: "hot",
        title: `지금 뜨는 정책 — ${p.title}`,
        sub: `지원자 ▲${t.delta}% 급상승`,
        policyId: p.id
      })
    );
  if (bookmarkCount > 0) {
    out.push({
      id: "bm-reminder",
      kind: "bookmark",
      title: `북마크한 정책 ${bookmarkCount}개`,
      sub: "신청 기한을 놓치지 마세요"
    });
  }
  return out;
}

/* ---------------- shared bits ---------------- */
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

/* 실시간 스파크라인 (주식 차트 느낌) */
function Sparkline({ series, up }: { series: number[]; up: boolean }) {
  const path = sparkPath(series, 100, 28);
  const color = up ? "var(--red)" : "var(--blue)";
  return (
    <svg className="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------- HOME ---------------- */
function HomeScreen({
  active,
  policies,
  profile,
  hasUnread,
  onOpenChat,
  onOpenSheet,
  onOpenNotif,
  onOpenMypage,
  onPickCategory,
  onGoArchive,
  onOpenTrends
}: {
  active: boolean;
  policies: PolisPolicy[];
  profile: Profile;
  hasUnread: boolean;
  onOpenChat: () => void;
  onOpenSheet: (id: string) => void;
  onOpenNotif: () => void;
  onOpenMypage: () => void;
  onPickCategory: (cat: string) => void;
  onGoArchive: () => void;
  onOpenTrends: () => void;
}) {
  const tick = useLiveTick(2500);
  const matches = useMemo(() => policies.slice(0, 3), [policies]);
  const cashSum = useMemo(() => policies.reduce((s, p) => s + (p.cash || 0), 0), [policies]);
  const matchCount = useMemo(() => policies.filter((p) => p.match >= 80).length, [policies]);
  const nearest = useMemo(() => {
    return policies
      .filter((p) => p.dday !== null)
      .sort((a, b) => (a.dday ?? 999) - (b.dday ?? 999))[0];
  }, [policies]);
  const trending = useMemo(() => {
    return policies
      .map((p) => ({ p, t: trendFor(p.id, tick) }))
      .sort((a, b) => b.t.delta - a.t.delta)
      .slice(0, 6);
  }, [policies, tick]);

  return (
    <section className={`screen${active ? " active" : ""}`}>
      <div className="appbar">
        <div className="brand">
          <span className="mk" />
          신혼생활
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            className={`iconbtn${hasUnread ? " badge-dot" : ""}`}
            aria-label="알림"
            type="button"
            onClick={onOpenNotif}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path
                d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
            </svg>
          </button>
          <button className="av-btn" aria-label="마이페이지" type="button" onClick={onOpenMypage}>
            {profile.name.slice(0, 1)}
          </button>
        </div>
      </div>

      <div className="h-greet">
        <p className="hi">
          {profile.region}
          <Sep />
          {profile.stage}
        </p>
        <h1>
          <b>{profile.name}</b>님이
          <br />
          받을 수 있는 정책이에요
        </h1>
      </div>

      <div className="pad block" style={{ marginTop: 20 }}>
        <button
          className="benefit card-tap"
          type="button"
          onClick={() => onOpenSheet(matches[0]?.id ?? "p1")}
        >
          <div className="lbl">현금성 지원 합계</div>
          <div className="amt mono">
            {cashSum.toLocaleString()}
            <small>만원</small>
          </div>
          <div className="benefit-meta">
            <span className="bdot" />
            맞춤 정책 {matchCount}개<Sep />
            전세대출 한도 별도
          </div>
          <div className="cta">
            내 맞춤 정책 보기
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

      {nearest && (
        <div className="pad block" style={{ marginTop: 14 }}>
          <button className="dday-widget" type="button" onClick={() => onOpenSheet(nearest.id)}>
            <span className="dday-badge">D-{nearest.dday}</span>
            <span className="dday-tx">
              <b>{nearest.title}</b>
              <span>
                {nearest.deadline}
                <Sep />
                마감이 가까워요
              </span>
            </span>
            <span className="dday-chev">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      )}

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

      {/* 실시간 트렌드 — 주식 차트 느낌 */}
      <div className="pad block">
        <div className="sec-head">
          <h2 className="sec-title">지금 뜨는 정책</h2>
          <button className="more" type="button" onClick={onOpenTrends}>
            트렌드 전체
          </button>
        </div>
        <div className="trend-row">
          {trending.map(({ p, t }) => (
            <button
              key={p.id}
              type="button"
              className="trend-card"
              onClick={() => onOpenSheet(p.id)}
            >
              <div className="trend-top">
                <span className={`trend-cat ${p.icon}`}>{p.cat}</span>
                <span className={`trend-delta ${t.delta >= 0 ? "up" : "down"}`}>
                  {t.delta >= 0 ? "▲" : "▼"}
                  {Math.abs(t.delta)}%
                </span>
              </div>
              <b className="trend-title">{p.title}</b>
              <Sparkline series={t.series} up={t.delta >= 0} />
              <div className="trend-foot">
                <span className="trend-appl mono">{formatCount(t.applicants)}</span>
                <span className="trend-unit">명 지원중</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pad block">
        <div className="sec-head">
          <h2 className="sec-title">나에게 딱 맞는</h2>
          <button className="more" type="button" onClick={onGoArchive}>
            전체
          </button>
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
                  {p.dept}
                  <Sep />
                  {p.amountSub}
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
            <button
              key={t.cat}
              type="button"
              className="topic"
              onClick={() => onPickCategory(t.cat)}
            >
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

/* ---------------- CHAT ---------------- */
function ChatScreen({ active, profile }: { active: boolean; profile: Profile }) {
  const INITIAL: ChatMsg = {
    id: "greet",
    role: "assistant",
    content: `안녕하세요 ${profile.name}님 💍\n${profile.region}에 사시는 ${profile.stage} 시군요.\n어떤 정책이 궁금하세요?`
  };
  const profileContext = `[사용자 프로필] 이름: ${profile.name} / 거주지: ${profile.region} / 혼인단계: ${profile.stage} / 관심사: ${profile.interests.join(", ") || "(미지정)"}`;
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
      const apiMessages = next
        .filter((m) => m.id !== "greet")
        .map((m) => ({ role: m.role, content: m.content }));
      const first = apiMessages[0];
      if (first && first.role === "user") {
        first.content = `${profileContext}\n\n${first.content}`;
      }
      const res = await fetch("/api/policy-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
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
            신혼 정책을 찾아드려요
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

/* ---------------- GEO ---------------- */
function GeoScreen({
  active,
  policies,
  profile,
  onOpenSheet,
  onOpenCalendar,
  onOpenRegion
}: {
  active: boolean;
  policies: PolisPolicy[];
  profile: Profile;
  onOpenSheet: (id: string) => void;
  onOpenCalendar: () => void;
  onOpenRegion: () => void;
}) {
  const tick = useLiveTick(2500);
  const gu = profile.region.split(" ").pop() ?? profile.region;
  const localCount = policies.length;
  const liveApplicants = useMemo(
    () => policies.reduce((s, p) => s + trendFor(p.id, tick).applicants, 0),
    [policies, tick]
  );
  const budgets = useMemo(() => {
    return policies
      .map((p) => ({ p, t: trendFor(p.id, tick) }))
      .sort((a, b) => b.t.capacityPct - a.t.capacityPct)
      .slice(0, 3);
  }, [policies, tick]);
  const top2 = policies.slice(0, 2);

  return (
    <section className={`screen${active ? " active" : ""}`}>
      <div className="appbar">
        <div className="brand" style={{ fontSize: 19 }}>
          내 동네
        </div>
      </div>

      <div className="pad block" style={{ marginTop: 8 }}>
        <button type="button" className="region-pick" onClick={onOpenRegion}>
          <span className="l">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" strokeLinejoin="round" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            {profile.region}
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
        <button className="cal-entry" type="button" onClick={onOpenCalendar}>
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
            <div className="k">내 동네 정책</div>
            <div className="v mono">
              {localCount}
              <small>건</small>
            </div>
            <div className="d">실시간 보조금24 기준</div>
          </div>
          <div className="statcard">
            <div className="k">지금 지원 중</div>
            <div className="v mono">{formatCount(liveApplicants)}</div>
            <div className="d live-up">실시간 집계 ▲</div>
          </div>
        </div>
      </div>

      <div className="pad block">
        <div className="sec-head">
          <h2 className="sec-title">예산 소진 현황</h2>
          <span className="more-tag">실시간</span>
        </div>
        <div className="list">
          {budgets.map(({ p, t }) => {
            const tone = t.capacityPct >= 80 ? "hot" : t.capacityPct >= 60 ? "warn" : "";
            const col =
              t.capacityPct >= 80
                ? "var(--red)"
                : t.capacityPct >= 60
                  ? "var(--amber)"
                  : "var(--blue)";
            return (
              <button key={p.id} type="button" className="budget" onClick={() => onOpenSheet(p.id)}>
                <div className="top">
                  <b>{p.title}</b>
                  <span className="pct" style={{ color: col }}>
                    {t.capacityPct}%
                  </span>
                </div>
                <div className={`prog ${tone}`}>
                  <i style={{ width: `${t.capacityPct}%` }} />
                </div>
                <div className="budget-sub">
                  지원자 {formatCount(t.applicants)}명
                  <Sep />
                  {t.capacityPct >= 80 ? "마감 임박" : "신청 가능"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pad block">
        <h2 className="sec-title">{gu} 추천 정책</h2>
        <div className="list">
          {top2.map((p, i) => (
            <button key={p.id} className="row" type="button" onClick={() => onOpenSheet(p.id)}>
              <span className={`ic ${p.icon}`}>
                <PolicyIcon icon={p.icon} />
              </span>
              <span className="tx">
                <b>{p.title}</b>
                <span>
                  매칭 {p.match}%<Sep />
                  {p.dept}
                </span>
              </span>
              <span className="rt">
                <span className="rank">{i + 1}위</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ARCHIVE ---------------- */
function ArchiveScreen({
  active,
  policies,
  filter,
  onFilter,
  onOpenSheet
}: {
  active: boolean;
  policies: PolisPolicy[];
  filter: string;
  onFilter: (f: string) => void;
  onOpenSheet: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    return policies
      .filter((p) => filter === "전체" || p.cat === filter)
      .filter((p) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          p.title.toLowerCase().includes(s) ||
          p.cat.toLowerCase().includes(s) ||
          p.summary.toLowerCase().includes(s)
        );
      });
  }, [filter, q, policies]);
  const hero = policies.find((p) => p.cat === "주거/청약") ?? policies[0];

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
          placeholder="정책 키워드 검색 (예: 전세, 출산)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="arc-filter">
        {ALL_CATS.map((c) => (
          <button
            key={c}
            type="button"
            className={`afc${filter === c ? " on" : ""}`}
            onClick={() => onFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {hero && (
        <div className="pad" style={{ marginTop: 6 }}>
          <button type="button" className="arc-hero card-tap" onClick={() => onOpenSheet(hero.id)}>
            <span className="arc-hero-grad" />
            <span className="arc-hero-tx">
              <span className="badge">이주의 정책</span>
              <b>{hero.title}</b>
              <span className="meta">{hero.summary.slice(0, 40)}…</span>
            </span>
          </button>
        </div>
      )}

      <div className="pad block" style={{ marginTop: 24 }}>
        <h2 className="sec-title">{filter === "전체" ? "신혼 정책 전체" : filter}</h2>
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
                    {p.dept}
                    <Sep />
                    {p.amount}
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

/* ---------------- POLICY SHEET ---------------- */
function PolicySheet({
  policies,
  policyId,
  bookmarks,
  applied,
  views,
  onClose
}: {
  policies: PolisPolicy[];
  policyId: string | null;
  bookmarks: { ids: string[]; has: (id: string) => boolean; toggle: (id: string) => void };
  applied: { ids: string[]; has: (id: string) => boolean; apply: (id: string) => void };
  views: { map: Record<string, number>; record: (id: string) => void };
  onClose: () => void;
}) {
  const tick = useLiveTick(2500);
  const p = policyId ? (policies.find((x) => x.id === policyId) ?? null) : null;
  const open = !!p;
  const url = p?.sourceUrl ?? GOV24_PORTAL;
  const isMarked = p ? bookmarks.has(p.id) : false;
  const isApplied = p ? applied.has(p.id) : false;
  const t = p ? trendFor(p.id, tick) : null;
  const myViews = p ? (views.map[p.id] ?? 0) : 0;

  return (
    <>
      <div className={`sheet-scrim${open ? " open" : ""}`} onClick={onClose} />
      <div className={`sheet${open ? " open" : ""}`}>
        <div className="grab" />
        {p && t && (
          <>
            <span className="tag">
              {p.cat}
              <Sep />
              {p.dept}
            </span>
            <h3>{p.title}</h3>

            <div className="sheet-trend">
              <div className="st-item">
                <span className="st-k">지원자</span>
                <span className="st-v mono">{formatCount(t.applicants)}명</span>
              </div>
              <div className="st-item">
                <span className="st-k">전일 대비</span>
                <span className={`st-v ${t.delta >= 0 ? "up" : "down"}`}>
                  {t.delta >= 0 ? "▲" : "▼"}
                  {Math.abs(t.delta)}%
                </span>
              </div>
              <div className="st-item">
                <span className="st-k">예산 소진</span>
                <span className="st-v mono">{t.capacityPct}%</span>
              </div>
              <Sparkline series={t.series} up={t.delta >= 0} />
            </div>

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
            {myViews > 1 && <p className="sheet-views">내가 {myViews}번 본 정책이에요</p>}
            <div className="sheet-actions">
              <button
                type="button"
                className={`btn-sec${isMarked ? " on" : ""}`}
                onClick={() => {
                  if (!isMarked) track("bookmark", p.id);
                  bookmarks.toggle(p.id);
                }}
              >
                {isMarked ? "★ 북마크됨" : "☆ 북마크"}
              </button>
              <a
                className="btn-pri"
                href={url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  track("apply", p.id);
                  applied.apply(p.id);
                }}
              >
                {isApplied ? "신청 페이지 다시 보기 ↗" : "신청하기 ↗"}
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ---------------- CALENDAR ---------------- */
function CalendarScreen({
  policies,
  onBack,
  onOpenSheet
}: {
  policies: PolisPolicy[];
  onBack: () => void;
  onOpenSheet: (id: string) => void;
}) {
  const upcoming = useMemo(
    () =>
      policies
        .filter((p) => p.dday !== null && p.dday !== undefined)
        .sort((a, b) => (a.dday ?? 999) - (b.dday ?? 999)),
    [policies]
  );
  return (
    <div className="cal-screen">
      <div className="cal-head">
        <button type="button" className="cal-back" onClick={onBack} aria-label="뒤로">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>정책 마감 캘린더</h2>
      </div>
      <div className="cal-list">
        {upcoming.length === 0 ? (
          <div className="arc-empty">마감 임박 정책이 없어요. 모두 상시 신청입니다.</div>
        ) : (
          upcoming.map((p) => {
            const d = p.dday ?? 0;
            const tone = d <= 7 ? "" : d <= 30 ? "warm" : "cool";
            return (
              <button
                key={p.id}
                type="button"
                className="cal-item"
                onClick={() => onOpenSheet(p.id)}
              >
                <span className={`dd ${tone}`}>D-{d}</span>
                <span className="tx">
                  <b>{p.title}</b>
                  <span>
                    {p.deadline}
                    <Sep />
                    {p.dept}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------- NOTIFICATIONS ---------------- */
function NotificationScreen({
  items,
  onBack,
  onOpenSheet
}: {
  items: Notif[];
  onBack: () => void;
  onOpenSheet: (id: string) => void;
}) {
  return (
    <div className="cal-screen">
      <div className="cal-head">
        <button type="button" className="cal-back" onClick={onBack} aria-label="뒤로">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>알림</h2>
      </div>
      <div className="cal-list">
        {items.length === 0 ? (
          <div className="arc-empty">새 알림이 없어요.</div>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              type="button"
              className="noti-item"
              onClick={() => n.policyId && onOpenSheet(n.policyId)}
            >
              <span className={`noti-ic ${n.kind}`}>
                {n.kind === "deadline" ? "⏰" : n.kind === "hot" ? "🔥" : "🔖"}
              </span>
              <span className="tx">
                <b>{n.title}</b>
                <span>{n.sub}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------- MY PAGE ---------------- */
function MyPageScreen({
  profile,
  setProfile,
  policies,
  bookmarks,
  applied,
  views,
  onBack,
  onOpenSheet,
  onOpenRegion
}: {
  profile: Profile;
  setProfile: (p: Profile | null) => void;
  policies: PolisPolicy[];
  bookmarks: { ids: string[] };
  applied: { ids: string[] };
  views: { map: Record<string, number> };
  onBack: () => void;
  onOpenSheet: (id: string) => void;
  onOpenRegion: () => void;
}) {
  const byId = useMemo(() => {
    const m = new Map<string, PolisPolicy>();
    policies.forEach((p) => m.set(p.id, p));
    return m;
  }, [policies]);

  const bookmarked = bookmarks.ids.map((id) => byId.get(id)).filter(Boolean) as PolisPolicy[];
  const appliedList = applied.ids.map((id) => byId.get(id)).filter(Boolean) as PolisPolicy[];
  const recentViews = useMemo(() => {
    return Object.entries(views.map)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => byId.get(id))
      .filter(Boolean)
      .slice(0, 5) as PolisPolicy[];
  }, [views.map, byId]);

  function invitePartner() {
    setProfile({ ...profile, partner: { name: "", status: "invited", code: makeInviteCode() } });
  }
  function cancelInvite() {
    setProfile({ ...profile, partner: null });
  }
  function copyInvite(code: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sinhon.life";
    const link = `${origin}/?invite=${code}`;
    try {
      void navigator.clipboard?.writeText(link);
    } catch {
      /* ignore */
    }
  }
  function resetAll() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("프로필을 초기화할까요? 온보딩을 다시 합니다.")
    )
      return;
    setProfile(null);
  }

  return (
    <div className="cal-screen">
      <div className="cal-head">
        <button type="button" className="cal-back" onClick={onBack} aria-label="뒤로">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>마이페이지</h2>
      </div>

      <div className="pad" style={{ marginTop: 4 }}>
        <div className="mp-profile">
          <span className="mp-avatar">{profile.name.slice(0, 1)}</span>
          <div className="mp-id">
            <b>{profile.name}님</b>
            <span>
              {profile.region}
              <Sep />
              {profile.stage}
            </span>
          </div>
        </div>
        {profile.interests.length > 0 && (
          <div className="mp-tags">
            {profile.interests.map((i) => {
              const meta = INTERESTS.find((x) => x.v === i);
              return (
                <span key={i} className="mp-tag">
                  {meta?.emoji} {i}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 파트너 초대 */}
      <div className="pad block" style={{ marginTop: 22 }}>
        <h3 className="mp-sec">파트너</h3>
        {!profile.partner ? (
          <div className="invite-card">
            <p className="invite-lead">
              혼자 시작했어요. 파트너를 초대하면 함께 정책을 챙길 수 있어요.
            </p>
            <button type="button" className="btn-cta sm" onClick={invitePartner}>
              파트너 초대하기
            </button>
          </div>
        ) : (
          <div className="invite-card">
            <p className="invite-lead">초대 코드를 파트너에게 전달하세요.</p>
            <div className="invite-code">{profile.partner.code}</div>
            <div className="sheet-actions">
              <button
                type="button"
                className="btn-sec"
                onClick={() => copyInvite(profile.partner?.code ?? "")}
              >
                초대 링크 복사
              </button>
              <button type="button" className="btn-sec" onClick={cancelInvite}>
                초대 취소
              </button>
            </div>
            <p className="invite-note">상대가 코드를 입력하면 연결돼요. (연결 기능 준비 중)</p>
          </div>
        )}
      </div>

      <Portfolio items={bookmarked} appliedIds={applied.ids} onOpenSheet={onOpenSheet} />
      <MpList
        title={`신청한 정책 ${appliedList.length}`}
        items={appliedList}
        empty="아직 신청한 정책이 없어요."
        onOpenSheet={onOpenSheet}
      />
      <MpList
        title="최근 본 정책"
        items={recentViews}
        empty="최근 본 정책이 없어요."
        onOpenSheet={onOpenSheet}
      />

      <div className="pad block" style={{ marginTop: 22 }}>
        <h3 className="mp-sec">설정</h3>
        <button type="button" className="mp-setting" onClick={onOpenRegion}>
          <span>지역 변경</span>
          <span className="mp-setting-v">{profile.region} ›</span>
        </button>
        <button type="button" className="mp-setting danger" onClick={resetAll}>
          <span>프로필 초기화</span>
          <span className="mp-setting-v">온보딩 다시 ›</span>
        </button>
      </div>
    </div>
  );
}

function Portfolio({
  items,
  appliedIds,
  onOpenSheet
}: {
  items: PolisPolicy[];
  appliedIds: string[];
  onOpenSheet: (id: string) => void;
}) {
  const totalCash = items.reduce((s, p) => s + (p.cash || 0), 0);
  const appliedCount = items.filter((p) => appliedIds.includes(p.id)).length;
  return (
    <div className="pad block" style={{ marginTop: 22 }}>
      <h3 className="mp-sec">내 정책 포트폴리오</h3>
      {items.length === 0 ? (
        <p className="mp-empty">북마크한 정책이 여기 모여요.</p>
      ) : (
        <>
          <div className="pf-summary">
            <div>
              <span>담은 정책</span>
              <b>{items.length}개</b>
            </div>
            <div>
              <span>현금성 합계</span>
              <b className="mono">{totalCash.toLocaleString()}만원</b>
            </div>
            <div>
              <span>신청 완료</span>
              <b>{appliedCount}개</b>
            </div>
          </div>
          <div className="list">
            {items.map((p) => {
              const t = trendFor(p.id);
              const done = appliedIds.includes(p.id);
              const tone = t.capacityPct >= 80 ? "hot" : t.capacityPct >= 60 ? "warn" : "";
              return (
                <button
                  key={p.id}
                  type="button"
                  className="pf-item"
                  onClick={() => onOpenSheet(p.id)}
                >
                  <span className="pf-tx">
                    <b>{p.title}</b>
                    <span>
                      {p.amount}
                      {done && <span className="pf-done"> 신청완료</span>}
                    </span>
                  </span>
                  <span className="pf-meter">
                    <span className={`prog ${tone}`}>
                      <i style={{ width: `${t.capacityPct}%` }} />
                    </span>
                    <em>{t.capacityPct}%</em>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function MpList({
  title,
  items,
  empty,
  onOpenSheet
}: {
  title: string;
  items: PolisPolicy[];
  empty: string;
  onOpenSheet: (id: string) => void;
}) {
  return (
    <div className="pad block" style={{ marginTop: 22 }}>
      <h3 className="mp-sec">{title}</h3>
      {items.length === 0 ? (
        <p className="mp-empty">{empty}</p>
      ) : (
        <div className="list">
          {items.map((p) => (
            <button key={p.id} type="button" className="row" onClick={() => onOpenSheet(p.id)}>
              <span className={`ic ${p.icon}`}>
                <PolicyIcon icon={p.icon} />
              </span>
              <span className="tx">
                <b>{p.title}</b>
                <span>
                  {p.cat}
                  <Sep />
                  {p.dept}
                </span>
              </span>
              <span className="rt">
                <span className="s">›</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- REGION SHEET ---------------- */
function RegionSheet({
  open,
  current,
  onClose,
  onPick
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onPick: (r: string) => void;
}) {
  return (
    <>
      <div className={`sheet-scrim${open ? " open" : ""}`} onClick={onClose} />
      <div className={`sheet${open ? " open" : ""}`}>
        <div className="grab" />
        <h3>지역 선택</h3>
        <p className="desc" style={{ marginBottom: 14 }}>
          거주지를 바꾸면 맞춤 정책이 다시 정렬돼요.
        </p>
        <div className="region-grid">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`region-chip${r === current ? " on" : ""}`}
              onClick={() => onPick(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
