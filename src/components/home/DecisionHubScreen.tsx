"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Camera,
  Church,
  Home as HomeIcon,
  Plane,
  Sofa,
  Sparkles,
  Film,
  Wallet,
} from "lucide-react";
import {
  useUserProfile,
  type DecisionCategory,
  type Region,
} from "@/lib/profile/useUserProfile";
import { track } from "@/lib/analytics/track";

type DecisionCard = {
  category: DecisionCategory;
  label: string;
  icon: typeof Camera;
  hint: string;        // 짧은 안내 + Choice Share 시드 (Mock)
  cta: string;
  to: string;          // AI톡으로 이동 + 카테고리 의도 프리필
};

const CARDS: DecisionCard[] = [
  {
    category: "sdm",
    label: "스드메",
    icon: Camera,
    hint: "부평 신혼 100쌍 중 약 58%가 1,200~1,800만원 사이",
    cta: "AI에게 추천 받기",
    to: "/ai?seed=sdm",
  },
  {
    category: "venue",
    label: "예식장",
    icon: Church,
    hint: "송도 인기 예식장은 식대 7~9만원·홀 대관 별도",
    cta: "예식장 비교 시작",
    to: "/ai?seed=venue",
  },
  {
    category: "interior",
    label: "신혼집 인테리어",
    icon: HomeIcon,
    hint: "20평대 셀프 인테리어 평균 700~1,200만원",
    cta: "스타일·예산 정리",
    to: "/ai?seed=interior",
  },
  {
    category: "goods",
    label: "혼수 가전·가구",
    icon: Sofa,
    hint: "가전 패키지 평균 600~1,400만원 (혼수 등급별)",
    cta: "내 예산에 맞춰보기",
    to: "/ai?seed=goods",
  },
  {
    category: "honeymoon",
    label: "신혼여행",
    icon: Plane,
    hint: "5~7일 동남아 평균 400~700만원 (2인)",
    cta: "동선·예산 짜기",
    to: "/ai?seed=honeymoon",
  },
];

const REGION_LABEL: Record<Region, string> = {
  "incheon-bupyeong": "부평",
  "incheon-songdo": "송도",
  "incheon-etc": "인천",
  etc: "전국",
};

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function DecisionHubScreen() {
  const { profile, hydrated, toggleDecision } = useUserProfile();
  const completed = profile.completedDecisions.length;
  const total = CARDS.length;
  const ratio = total === 0 ? 0 : Math.round((completed / total) * 100);

  const dday = useMemo(() => daysUntil(profile.weddingDate), [profile.weddingDate]);
  const regionShort = profile.region ? REGION_LABEL[profile.region] : null;

  return (
    <div className="min-h-[100dvh] bg-white pb-[120px]">
      {/* 헤더 */}
      <header
        className="px-4 pb-5 pt-6"
        style={{
          background:
            "linear-gradient(180deg,#EAF3FB 0%,rgba(234,243,251,0.4) 70%,rgba(255,255,255,1) 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-[0_4px_10px_-3px_rgba(43,123,197,0.5)]"
            style={{ background: "linear-gradient(135deg,#5AA3DC,#3B8BCF)" }}
          >
            <Sparkles size={16} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-bold tracking-wide text-blue-deepest">
              THE NEWLYWED DECISION HUB
            </div>
            <h1 className="text-[22px] font-extrabold leading-tight text-ink">
              {hydrated && regionShort ? `${regionShort} 신혼의 결정` : "신혼생활"}
            </h1>
          </div>
        </div>

        <p className="mt-3 text-[13.5px] font-medium leading-relaxed text-ink-soft">
          {hydrated && dday !== null && dday >= 0
            ? `예식까지 D-${dday}. 함께 하나씩 결정해봐요.`
            : "결혼 준비, 망설이지 말고 같이 결정해봐요."}
        </p>

        {/* 진행률 */}
        <div className="mt-4 rounded-[16px] bg-white p-3.5 shadow-[0_4px_14px_-8px_rgba(20,50,90,0.25)]">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] font-bold tracking-wide text-mute">내 결정 진행률</div>
              <div className="mt-0.5 text-[22px] font-extrabold leading-none text-ink">
                {completed}
                <span className="text-[14px] font-bold text-mute"> / {total}</span>
              </div>
            </div>
            <div className="text-[12px] font-bold text-blue-deepest">{ratio}%</div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EAF3FB]">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${ratio}%`,
                background: "linear-gradient(90deg,#3B8BCF,#4F9CDB)",
              }}
            />
          </div>
        </div>
      </header>

      {/* 5대 결정점 카드 */}
      <section className="px-4 pt-1">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold text-ink">5대 결정점</h2>
          <span className="text-[11px] font-semibold text-mute">탭하면 AI가 도와드려요</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {CARDS.map(({ category, label, icon: Icon, hint, cta, to }) => {
            const done = profile.completedDecisions.includes(category);
            return (
              <div
                key={category}
                className={`relative rounded-[16px] border bg-white p-3.5 shadow-[0_3px_12px_-8px_rgba(20,50,90,0.2)] ${
                  done ? "border-[#9CC7EA]" : "border-[#E8EFF6]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-blue-deepest"
                    style={{ background: "#EAF3FB" }}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="text-[15px] font-extrabold text-ink">{label}</div>
                      {done && (
                        <span className="rounded-full bg-blue-accent px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                          결정 완료
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11.5px] font-medium leading-snug text-mute">
                      {hint}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Link
                        href={to}
                        onClick={() => track("decision_card_click", { category })}
                        className="rounded-full px-3 py-1.5 text-[11.5px] font-bold text-white shadow-[0_4px_10px_-4px_rgba(43,123,197,0.5)]"
                        style={{
                          background:
                            "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
                        }}
                      >
                        {cta}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          toggleDecision(category);
                          track("decision_toggle", { category, completed: !done });
                        }}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition active:scale-[0.97] ${
                          done
                            ? "border-[#D8E5F0] bg-white text-mute"
                            : "border-[#D8E5F0] bg-white text-ink-soft"
                        }`}
                      >
                        {done ? "결정 해제" : "결정 완료 표시"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 부평 인덱스 한 줄 */}
      <section className="mt-5 px-4">
        <div className="rounded-[16px] border border-[#E8EFF6] bg-white p-3.5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold tracking-wide text-blue-deepest">
              {regionShort ?? "부평"} 이번주 인덱스
            </div>
            <span className="text-[10px] font-bold text-mute">데모 데이터</span>
          </div>
          <p className="mt-1.5 text-[13px] font-semibold leading-snug text-ink-soft">
            스드메 평균 <b className="text-ink">1,420만원</b> · 예식장 식대 <b className="text-ink">7.8만원</b> · 셀프인테리어 <b className="text-ink">920만원</b>
          </p>
          <p className="mt-0.5 text-[10.5px] font-medium text-mute">
            * 사용자 가계부·리드 데이터가 쌓이면 실제 인덱스로 교체돼요
          </p>
        </div>
      </section>

      {/* 보조 진입점 */}
      <section className="mt-4 grid grid-cols-2 gap-2.5 px-4">
        <Link
          href="/archive"
          className="rounded-[16px] border border-[#E8EFF6] bg-white p-3.5"
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-blue-deepest"
              style={{ background: "#EAF3FB" }}
            >
              <Film size={15} strokeWidth={2.2} />
            </span>
            <div className="text-[13.5px] font-extrabold text-ink">영상 아카이브</div>
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-mute">
            #신혼집 #스드메 영상을 해시태그로 검색
          </p>
        </Link>
        <Link
          href="/budget"
          className="rounded-[16px] border border-[#E8EFF6] bg-white p-3.5"
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-blue-deepest"
              style={{ background: "#EAF3FB" }}
            >
              <Wallet size={15} strokeWidth={2.2} />
            </span>
            <div className="text-[13.5px] font-extrabold text-ink">공동 가계부</div>
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-mute">
            결혼 준비 실지출을 부부가 같이 기록
          </p>
        </Link>
      </section>
    </div>
  );
}
