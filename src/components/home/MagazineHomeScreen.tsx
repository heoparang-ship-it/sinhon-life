"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { type DecisionCategory } from "@/lib/profile/useUserProfile";
import { track } from "@/lib/analytics/track";
import { useArchiveList } from "@/lib/instagram/client";
import { CompactLegalRow } from "@/components/CompactLegalRow";

/* ───────────────────────────── 데이터 ───────────────────────────── */

type QuickItem = {
  label: string;
  href: string;
  badge?: string;
  category?: DecisionCategory | "ai" | "support";
  icon?: string; // /icons/*.png
  emoji?: string; // 아이콘 없이 큰 이모지로 대체
  emphasis?: boolean; // 가운데 AI톡처럼 강조
};

const QUICK_ITEMS: QuickItem[] = [
  // ★ 지원금: 가장 좌측·NEW 배지. 라이브 사이트의 '혼수·가전·가구' 자리 대체
  { label: "내 지원금", href: "/support", category: "support", emoji: "💰", badge: "NEW" },
  { label: "신혼여행", href: "/ai?seed=honeymoon", category: "honeymoon", icon: "/icons/02_honeymoon_travel.png" },
  { label: "AI톡", href: "/ai", badge: "AI", category: "ai", icon: "/icons/03_ai_talk.png", emphasis: true },
];

type InfoCard = {
  title: string;
  sub: string;
  href: string;
  bg: string;
  icon?: string; // /icons/*.png
  /** 강조 — 카드 우상단 배지 */
  badge?: string;
  /** 강조 — 큰 이모지(아이콘 이미지 대체) */
  emoji?: string;
  /** 분석용 라벨 */
  trackId?: string;
};

const INFO_CARDS: InfoCard[] = [
  {
    title: "예산별\n신혼집 추천",
    sub: "3천~5천만원대",
    href: "/ai?seed=interior",
    bg: "linear-gradient(135deg,#EAF2FB 0%,#CFE2F6 100%)",
    icon: "/icons/09_budget_recommendation.png",
  },
  {
    title: "스드메·예물\n추천",
    sub: "187쌍이 고른 옵션",
    href: "/ai?seed=sdm",
    bg: "linear-gradient(135deg,#EEF1FB 0%,#D7DEF4 100%)",
    icon: "/icons/04_studio_dress_makeup.png",
  },
  {
    title: "혼수 가전\n체크리스트",
    sub: "빠짐없이 한 번에",
    href: "/checklist",
    bg: "linear-gradient(135deg,#E5EEFD 0%,#C2D6F4 100%)",
    icon: "/icons/10_checklist.png",
  },
];

type Magazine = {
  time: string;
  title: string;
  tags: string;
  bg: string;
  emoji: string;
};

const MAGAZINES: Magazine[] = [
  {
    time: "0:23",
    title: "웨딩 스냅 촬영 꿀팁 5가지",
    tags: "#웨딩촬영 #스냅 #준비팁",
    bg: "linear-gradient(135deg,#E3EDF7 0%,#C9DDF0 100%)",
    emoji: "📸",
  },
  {
    time: "0:41",
    title: "몰디브 신혼여행 리얼 후기",
    tags: "#몰디브 #신혼여행 #후기",
    bg: "linear-gradient(135deg,#D9ECF7 0%,#B5D6EC 100%)",
    emoji: "🏝️",
  },
  {
    time: "0:36",
    title: "우리집 인테리어 아이디어",
    tags: "#인테리어 #신혼집 #홈스타일링",
    bg: "linear-gradient(135deg,#EBE5F7 0%,#D2C7EE 100%)",
    emoji: "🛋️",
  },
  {
    time: "0:28",
    title: "부평 예식장 발품 정리",
    tags: "#예식장 #부평 #실측",
    bg: "linear-gradient(135deg,#F3E5DC 0%,#E6CFBF 100%)",
    emoji: "⛪",
  },
];

/* 홈 하단 상시 노출 세로 아카이브 그리드 (인스타 영상 피드) */
type ArchiveItem = {
  time: string;
  title: string;
  tag: string;
  bg: string;
  emoji: string;
};

const ARCHIVE_FEED: ArchiveItem[] = [
  { time: "0:31", title: "20평 신혼집 셀프 인테리어", tag: "#신혼집", bg: "linear-gradient(135deg,#E8EEF8,#CBD9EE)", emoji: "🏠" },
  { time: "0:45", title: "스드메 200만원 후기", tag: "#스드메", bg: "linear-gradient(135deg,#F6E7EC,#ECCAD6)", emoji: "💐" },
  { time: "0:22", title: "예단·예물 요즘 트렌드", tag: "#예단", bg: "linear-gradient(135deg,#EAF1F7,#CFE0F0)", emoji: "💍" },
  { time: "0:38", title: "혼수 가전 리스트 공유", tag: "#혼수", bg: "linear-gradient(135deg,#E9F3EC,#CBE6D4)", emoji: "🧺" },
  { time: "0:50", title: "다낭 5박 6일 허니문", tag: "#신혼여행", bg: "linear-gradient(135deg,#E5F0F7,#C2DCEF)", emoji: "✈️" },
  { time: "0:27", title: "송도 예식장 실내 투어", tag: "#예식장", bg: "linear-gradient(135deg,#F3ECE2,#E2D0BC)", emoji: "⛪" },
  { time: "0:34", title: "부평 신혼집 발품 브이로그", tag: "#부평신혼", bg: "linear-gradient(135deg,#ECE8F7,#D3C9EE)", emoji: "🔑" },
  { time: "0:19", title: "본식 스냅 vs DVD 비교", tag: "#웨딩촬영", bg: "linear-gradient(135deg,#E8EEF8,#C9D9EE)", emoji: "📷" },
];

/* ───────────────────────────── 컴포넌트 ───────────────────────────── */

export function MagazineHomeScreen() {
  return (
    <div className="flex h-[100dvh] flex-col bg-white text-ink lg:h-full">
      {/* App bar */}
      <header className="flex h-[58px] shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <svg width="34" height="30" viewBox="0 0 34 30" fill="none" aria-hidden>
            <defs>
              <linearGradient id="sinhonRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5AA0DE" />
                <stop offset="1" stopColor="#2F77BE" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="15" r="9" fill="none" stroke="url(#sinhonRing)" strokeWidth="5" />
            <circle cx="22" cy="15" r="9" fill="none" stroke="#ACCCEC" strokeWidth="5" opacity=".8" />
          </svg>
          <span className="text-[20px] font-extrabold tracking-tight">신혼생활</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="알림"
            className="relative grid h-[30px] w-[30px] place-items-center"
          >
            <span className="absolute right-0 top-0 z-[2] block h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[#FF6B6B]" />
            <Image src="/icons/12_notification_bell.png" alt="알림" width={26} height={26} className="h-[26px] w-[26px] object-contain" />
          </button>
          <button
            type="button"
            aria-label="메뉴"
            className="grid h-[30px] w-[30px] place-items-center"
          >
            <Image src="/icons/13_menu.png" alt="메뉴" width={24} height={24} className="h-[24px] w-[24px] object-contain" />
          </button>
        </div>
      </header>

      {/* Scroll */}
      <div className="flex-1 overflow-y-auto pb-[120px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Quick row */}
        <div className="mx-5 mt-3 grid grid-cols-3 rounded-[18px] border border-[#EEF2F6] bg-white py-3.5 shadow-[0_1px_2px_rgba(26,36,51,0.04),0_10px_24px_rgba(26,36,51,0.045)]">
          {QUICK_ITEMS.map((q, i) => (
            <Link
              key={q.label}
              href={q.href}
              onClick={() =>
                q.category === "support"
                  ? track("support_entry_click", { from: "home_quick" })
                  : track("decision_card_click", { category: q.category ?? null, from: "home_quick" })
              }
              className={`relative flex flex-col items-center gap-2.5 ${
                i > 0 ? "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-px before:bg-[#EEF2F6] before:content-['']" : ""
              }`}
            >
              <span className="relative drop-shadow-[0_5px_8px_rgba(31,94,158,0.18)] transition-transform active:translate-y-[1px] active:scale-95">
                {q.badge && (
                  <span
                    className="absolute -right-[8px] -top-[6px] rounded-full px-[6px] py-[2px] text-[9px] font-extrabold text-white shadow-[0_3px_7px_rgba(59,139,207,0.4)]"
                    style={{ background: "linear-gradient(135deg,#3B8BCF,#4F9CDB)" }}
                  >
                    {q.badge}
                  </span>
                )}
                {q.emoji ? (
                  <span
                    aria-hidden
                    className="grid h-9 w-9 place-items-center rounded-xl text-[22px]"
                    style={{ background: "linear-gradient(135deg,#E0EDFB 0%,#B7D3F1 100%)" }}
                  >
                    {q.emoji}
                  </span>
                ) : q.icon ? (
                  <Image
                    src={q.icon}
                    alt={q.label}
                    width={36}
                    height={36}
                    className="block h-9 w-9 object-contain"
                  />
                ) : null}
              </span>
              <span className="text-[12.5px] font-bold tracking-tight text-ink">{q.label}</span>
            </Link>
          ))}
        </div>

        {/* ★ 정책 매칭 배너 — 인천 신혼 유입 관문 */}
        <Link
          href="/policy"
          onClick={() => track("decision_card_click", { from: "home_policy_banner" })}
          className="mx-5 mt-3.5 flex items-center gap-3 rounded-[20px] p-[18px] text-white shadow-[0_12px_28px_-12px_rgba(43,123,207,0.6)] transition active:scale-[0.99]"
          style={{ background: "linear-gradient(120deg,#2566A8 0%,#3B8BCF 55%,#4F9CDB 100%)" }}
        >
          <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-2xl bg-white/18 text-[24px] backdrop-blur">
            🏠
          </span>
          <span className="flex-1">
            <span className="block text-[15.5px] font-extrabold leading-tight">
              인천 신혼이 받을 수 있는 정책 찾기
            </span>
            <span className="mt-0.5 block text-[12.5px] font-medium text-on-blue-mute">
              천원주택·신생아 대출·전세보증료 — 1분 자가진단
            </span>
          </span>
          <span className="text-[20px] font-bold">→</span>
        </Link>

        {/* 지금 많이 찾는 정보 */}
        <section className="mt-6">
          <div className="mb-2.5 flex items-center justify-between px-5">
            <h2 className="text-[20px] font-extrabold tracking-tight">지금 많이 찾는 정보</h2>
            <Link
              href="/index/bupyeong"
              className="flex items-center gap-1 whitespace-nowrap text-[13.5px] font-bold text-blue-accent"
            >
              전체보기 ›
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5 px-5">
            {INFO_CARDS.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                onClick={() =>
                  c.trackId === "support"
                    ? track("support_entry_click", { from: "home_info_grid" })
                    : track("decision_card_click", { from: "home_info_grid", to: c.trackId ?? c.title })
                }
                className="relative flex flex-col items-start rounded-[16px] border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_2px_rgba(26,36,51,0.05)]"
              >
                {c.badge && (
                  <span
                    className="absolute right-2 top-2 rounded-full px-1.5 py-[2px] text-[9px] font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg,#3B8BCF,#4F9CDB)" }}
                  >
                    {c.badge}
                  </span>
                )}
                <h3
                  className="m-0 text-[14px] font-extrabold leading-[1.3] tracking-tight text-ink"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {c.title}
                </h3>
                <span className="mt-1 block text-[11px] font-semibold text-mute">{c.sub}</span>
                <div className="mt-2 flex w-full justify-center">
                  {c.emoji ? (
                    <span className="grid h-10 w-10 place-items-center text-[24px] drop-shadow-[0_4px_8px_rgba(31,94,158,0.18)]">
                      {c.emoji}
                    </span>
                  ) : c.icon ? (
                    <Image
                      src={c.icon}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(31,94,158,0.18)]"
                    />
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 지금 찾는 꿀팁 (기존 매거진 더미) */}
        <section className="mt-6">
          <div className="mb-2.5 flex items-center justify-between px-5">
            <h2 className="text-[20px] font-extrabold tracking-tight">지금 찾는 꿀팁</h2>
            <Link
              href="/archive"
              className="flex items-center gap-1 whitespace-nowrap text-[13.5px] font-bold text-blue-accent"
            >
              전체보기 ›
            </Link>
          </div>
          <div className="flex snap-x snap-proximity gap-[13px] overflow-x-auto px-5 pt-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MAGAZINES.map((m) => (
              <Link
                key={m.title}
                href="/archive"
                className="w-[240px] shrink-0 snap-start"
              >
                <div className="relative h-[136px] w-full overflow-hidden rounded-[16px] shadow-[0_1px_2px_rgba(26,36,51,0.05)]">
                  <span className="absolute left-[11px] top-[11px] z-[2] rounded-full bg-black/60 px-[9px] py-[4px] text-[12px] font-bold text-white backdrop-blur-[2px]">
                    {m.time}
                  </span>
                  <span className="absolute right-[10px] top-[10px] z-[2] grid h-[34px] w-[34px] place-items-center rounded-full bg-black/50 backdrop-blur-[2px]">
                    <Play size={13} fill="#fff" stroke="none" />
                  </span>
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: m.bg }}
                    aria-hidden
                  >
                    <span className="text-[44px]">{m.emoji}</span>
                  </div>
                </div>
                <div className="mt-3 text-[14px] font-bold tracking-tight text-ink">{m.title}</div>
                <div className="mt-1.5 text-[12.5px] font-semibold tracking-tight text-blue-soft">
                  {m.tags}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 신혼생활 매거진 — 최신 인스타 자동 연결 (1줄 가로) */}
        <MagazineRow />

        <div className="mx-5 mt-8 text-center text-[10.5px] font-semibold text-mute">
          sinhon.life · 인천 신혼 결정 데이터
        </div>

        {/* 법적 푸터 — 내부 스크롤 마지막에 인라인. AppFooter 를 풀스크린 페이지 밖에
            두면 body 스크롤이 따라오는 현상이 있어 내부로 옮김 */}
        <CompactLegalRow />
      </div>
    </div>
  );
}

/* ── 신혼생활 매거진: 최신 인스타 자동 연결 1줄 가로 ── */

function captionTitle(caption: string | null): string {
  if (!caption) return "신혼생활 영상";
  const firstLine = caption.split("\n").find((l) => l.trim().length > 0) ?? caption;
  const clean = firstLine.replace(/#[^\s#]+/g, "").trim();
  const base = clean.length > 0 ? clean : firstLine.trim();
  return base.length > 24 ? base.slice(0, 24) + "…" : base;
}

function MagazineRow() {
  const { data, loading } = useArchiveList({ limit: 12 });
  const live = data?.items ?? [];
  const useLive = live.length > 0;

  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-center justify-between px-5">
        <h2 className="text-[20px] font-extrabold tracking-tight">신혼생활 매거진</h2>
        <Link
          href="/archive"
          className="flex items-center gap-1 whitespace-nowrap text-[13.5px] font-bold text-blue-accent"
        >
          전체보기 ›
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {useLive
          ? live.map((it) => {
              const isVideo = it.media_type === "VIDEO" || it.media_type === "REELS";
              const thumb = it.thumbnail_url ?? it.media_url;
              // 라이브 인스타 게시물은 인스타 permalink로 새창 직행.
              // (사내 /archive/[id] 상세 페이지로 가지 않음 — 사장님 피드백)
              return (
                <a
                  key={it.id}
                  href={it.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[132px] shrink-0"
                >
                  <div
                    className="relative w-full overflow-hidden rounded-[14px] bg-[#E3EDF7] shadow-[0_1px_2px_rgba(26,36,51,0.05)]"
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#E3EDF7] to-[#C9DDF0]" />
                    )}
                    {isVideo && (
                      <span className="absolute right-2 top-2 z-[2] grid h-[28px] w-[28px] place-items-center rounded-full bg-black/50 backdrop-blur-[2px]">
                        <Play size={11} fill="#fff" stroke="none" />
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                      <div className="line-clamp-2 text-[11.5px] font-bold leading-snug text-white">
                        {captionTitle(it.caption)}
                      </div>
                      {it.tags?.[0] && (
                        <div className="mt-0.5 text-[10.5px] font-semibold text-white/85">
                          #{it.tags[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })
          : ARCHIVE_FEED.map((a) => (
              <Link key={a.title} href="/archive" className="w-[132px] shrink-0">
                <div
                  className="relative w-full overflow-hidden rounded-[14px] shadow-[0_1px_2px_rgba(26,36,51,0.05)]"
                  style={{ aspectRatio: "9 / 16" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: a.bg }} aria-hidden>
                    <span className="text-[48px]">{a.emoji}</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/55 to-transparent p-2 pt-6">
                    <div className="text-[11.5px] font-bold leading-snug text-white">{a.title}</div>
                    <div className="mt-0.5 text-[10.5px] font-semibold text-white/85">{a.tag}</div>
                  </div>
                </div>
              </Link>
            ))}
        {loading && !useLive &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="w-[132px] shrink-0 animate-pulse rounded-[14px] bg-[#EEF2F6]"
              style={{ aspectRatio: "9 / 16" }}
            />
          ))}
      </div>
    </section>
  );
}
