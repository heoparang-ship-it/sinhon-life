"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { type DecisionCategory } from "@/lib/profile/useUserProfile";
import { track } from "@/lib/analytics/track";
import { useArchiveList } from "@/lib/instagram/client";

/* ───────────────────────────── 데이터 ───────────────────────────── */

type HeroSlide = {
  kicker: string;
  title1: string;
  title2: string;
  desc: string;
  bg: string;
  emoji: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    kicker: "신혼의 시작,",
    title1: "더 가볍게",
    title2: "준비해요",
    desc: "예산·취향 맞춤 추천까지\n신혼생활의 모든 것",
    bg: "linear-gradient(135deg,#EDF5FC 0%,#D6E9FA 100%)",
    emoji: "💍",
  },
  {
    kicker: "데이터로 결정,",
    title1: "깜깜이 가격",
    title2: "이젠 끝",
    desc: "부평·송도 신혼 시세를\n한눈에 비교해요",
    bg: "linear-gradient(135deg,#EAF2FB 0%,#CFE2F6 100%)",
    emoji: "📊",
  },
  {
    kicker: "비슷한 신혼들이,",
    title1: "무엇을",
    title2: "얼마에?",
    desc: "187쌍의 선택을\nAI가 알려드려요",
    bg: "linear-gradient(135deg,#E9F1FA 0%,#D9E7F6 100%)",
    emoji: "✨",
  },
];

type QuickItem = {
  label: string;
  href: string;
  badge?: string;
  category?: DecisionCategory | "ai";
  icon: string; // /icons/*.png
};

const QUICK_ITEMS: QuickItem[] = [
  { label: "혼수·가전·가구", href: "/ai?seed=goods", category: "goods", icon: "/icons/01_honsu_appliances_furniture.png" },
  { label: "신혼여행", href: "/ai?seed=honeymoon", category: "honeymoon", icon: "/icons/02_honeymoon_travel.png" },
  { label: "AI톡", href: "/ai", badge: "AI", category: "ai", icon: "/icons/03_ai_talk.png" },
];

type InfoCard = {
  title: string;
  sub: string;
  href: string;
  bg: string;
  icon: string; // /icons/*.png
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
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const el = heroTrackRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / (el.clientWidth - 28));
      setHeroIndex(Math.min(i, HERO_SLIDES.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // 자동 슬라이드 (4초). 사용자가 직접 스와이프하면 잠시 멈췄다 재개.
  useEffect(() => {
    const el = heroTrackRef.current;
    if (!el) return;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    const pause = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => (paused = false), 6000);
    };
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("pointerdown", pause, { passive: true });
    const id = setInterval(() => {
      if (paused) return;
      const step = el.clientWidth - 28;
      if (step <= 0) return;
      const cur = Math.round(el.scrollLeft / step);
      const next = cur + 1 >= HERO_SLIDES.length ? 0 : cur + 1;
      el.scrollTo({ left: next * step, behavior: "smooth" });
    }, 4000);
    return () => {
      clearInterval(id);
      if (resumeTimer) clearTimeout(resumeTimer);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("pointerdown", pause);
    };
  }, []);

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
        {/* Hero carousel */}
        <div className="mt-1">
          <div
            ref={heroTrackRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] [scroll-padding:0_20px] [&::-webkit-scrollbar]:hidden"
          >
            {HERO_SLIDES.map((slide, i) => (
              <article
                key={i}
                className="relative h-[212px] shrink-0 snap-center overflow-hidden rounded-[20px] shadow-[0_1px_2px_rgba(26,36,51,0.05)]"
                style={{ flexBasis: "calc(100% - 40px)", background: slide.bg }}
              >
                <div className="absolute left-[22px] right-[46%] top-6 z-[2]">
                  <span className="text-[13px] font-extrabold tracking-tight text-blue-accent">
                    {slide.kicker}
                  </span>
                  <h2 className="mt-1.5 mb-3 text-[30px] font-extrabold leading-[1.12] tracking-[-1px] text-ink">
                    {slide.title1}
                    <br />
                    <b className="font-extrabold text-blue-accent">{slide.title2}</b>
                  </h2>
                  <p
                    className="m-0 text-[12.5px] font-semibold leading-[1.45] text-[#56657A]"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {slide.desc}
                  </p>
                </div>
                <div
                  className="absolute right-0 top-0 bottom-0 flex w-[56%] items-center justify-center"
                  aria-hidden
                >
                  <span className="text-[88px] drop-shadow-[0_8px_20px_rgba(31,94,158,0.25)]">
                    {slide.emoji}
                  </span>
                </div>
                {/* 페이지 카운터 1 / 3 */}
                <div className="absolute right-[14px] top-[14px] z-[3] rounded-full bg-white/70 px-2.5 py-[3px] text-[11.5px] font-bold tabular-nums text-ink backdrop-blur-[2px]">
                  <span className="text-blue-accent">{heroIndex + 1}</span>
                  <span className="text-mute"> / {HERO_SLIDES.length}</span>
                </div>
                <div className="absolute bottom-[18px] left-6 z-[3] flex gap-1.5">
                  {HERO_SLIDES.map((_, di) => (
                    <i
                      key={di}
                      className={`block h-[7px] rounded-full transition-[width,background] ${
                        di === heroIndex
                          ? "w-[18px] rounded-[4px] bg-blue-accent"
                          : "w-[7px] bg-blue-accent/30"
                      }`}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Quick row */}
        <div className="mx-5 mt-[22px] grid grid-cols-3 rounded-[18px] border border-[#EEF2F6] bg-white py-5 shadow-[0_1px_2px_rgba(26,36,51,0.04),0_10px_24px_rgba(26,36,51,0.045)]">
          {QUICK_ITEMS.map((q, i) => (
            <Link
              key={q.label}
              href={q.href}
              onClick={() => track("decision_card_click", { category: q.category ?? null, from: "home_quick" })}
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
                <Image
                  src={q.icon}
                  alt={q.label}
                  width={40}
                  height={40}
                  className="block h-[40px] w-[40px] object-contain"
                />
              </span>
              <span className="text-[12.5px] font-bold tracking-tight text-ink">{q.label}</span>
            </Link>
          ))}
        </div>

        {/* ★ 정책 매칭 배너 — 인천 신혼 유입 관문 */}
        <Link
          href="/policy"
          onClick={() => track("decision_card_click", { from: "home_policy_banner" })}
          className="mx-5 mt-[18px] flex items-center gap-3 rounded-[20px] p-[18px] text-white shadow-[0_12px_28px_-12px_rgba(43,123,207,0.6)] transition active:scale-[0.99]"
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
        <section className="mt-[30px]">
          <div className="mb-3.5 flex items-center justify-between px-5">
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
                className="flex flex-col items-start rounded-[16px] border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_2px_rgba(26,36,51,0.05)]"
              >
                <h3
                  className="m-0 text-[14px] font-extrabold leading-[1.3] tracking-tight text-ink"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {c.title}
                </h3>
                <span className="mt-1 block text-[11px] font-semibold text-mute">{c.sub}</span>
                <div className="mt-3 flex w-full justify-center">
                  <Image
                    src={c.icon}
                    alt=""
                    width={64}
                    height={64}
                    className="h-[64px] w-[64px] object-contain drop-shadow-[0_6px_10px_rgba(31,94,158,0.18)]"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 지금 찾는 꿀팁 (기존 매거진 더미) */}
        <section className="mt-[30px]">
          <div className="mb-3.5 flex items-center justify-between px-5">
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
                className="w-[300px] shrink-0 snap-start"
              >
                <div className="relative h-[172px] w-full overflow-hidden rounded-[16px] shadow-[0_1px_2px_rgba(26,36,51,0.05)]">
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
                    <span className="text-[64px]">{m.emoji}</span>
                  </div>
                </div>
                <div className="mt-3 text-[15.5px] font-bold tracking-tight text-ink">{m.title}</div>
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
          sinhon.life · 부평·송도 신혼 결정 데이터
        </div>
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
    <section className="mt-[34px]">
      <div className="mb-3.5 flex items-center justify-between px-5">
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
              return (
                <Link key={it.id} href={`/archive/${it.id}`} className="w-[150px] shrink-0">
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
                </Link>
              );
            })
          : ARCHIVE_FEED.map((a) => (
              <Link key={a.title} href="/archive" className="w-[150px] shrink-0">
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
              className="w-[150px] shrink-0 animate-pulse rounded-[14px] bg-[#EEF2F6]"
              style={{ aspectRatio: "9 / 16" }}
            />
          ))}
      </div>
    </section>
  );
}
