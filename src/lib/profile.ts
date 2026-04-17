// 신혼생활 개인화 프로필 — localStorage 기반 경량 프로필
// 온보딩 3스텝에서 수집 → 홈 피드 정렬 가중치로 사용

const PROFILE_KEY = "sinhon-profile-v1";

export type MaritalStage =
  | "planning" // 결혼 준비 중
  | "newly" // 신혼 (7년 이내)
  | "parenting"; // 임신/출산/육아

export type Region =
  | "seoul"
  | "incheon"
  | "gyeonggi"
  | "busan"
  | "daegu"
  | "etc";

export type InterestTopic =
  | "housing"
  | "finance"
  | "tax"
  | "baby"
  | "wedding"
  | "honeymoon";

export interface Profile {
  stage?: MaritalStage;
  region?: Region;
  interests: InterestTopic[];
  completedAt?: number;
  version: 1;
}

const EMPTY: Profile = { interests: [], version: 1 };

export function getProfile(): Profile {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed, version: 1 };
  } catch {
    return EMPTY;
  }
}

export function saveProfile(profile: Partial<Profile>) {
  if (typeof window === "undefined") return;
  const merged: Profile = {
    ...getProfile(),
    ...profile,
    version: 1,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
}

export function completeOnboarding(profile: Omit<Profile, "version" | "completedAt">) {
  saveProfile({ ...profile, completedAt: Date.now() });
}

export function hasCompletedOnboarding(): boolean {
  return !!getProfile().completedAt;
}

export function resetProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
}

// 관심사 → 정책 카테고리 매핑
const INTEREST_TO_CATEGORY: Record<InterestTopic, string[]> = {
  housing: ["housing"],
  finance: ["finance"],
  tax: ["tax"],
  baby: ["baby"],
  wedding: ["housing"], // 결혼식 준비 → 주거와 연관
  honeymoon: ["finance"],
};

// 단계 → 우선순위 카테고리
const STAGE_PRIORITY: Record<MaritalStage, string[]> = {
  planning: ["housing", "finance", "tax"],
  newly: ["housing", "finance", "tax", "baby"],
  parenting: ["baby", "housing", "finance"],
};

export interface ScoredItem<T> {
  item: T;
  score: number;
  reason: string;
}

// 정책을 프로필 기반으로 스코어링해 정렬
export function scorePolicies<T extends { category: string; tags: string[] }>(
  policies: T[],
  profile: Profile
): ScoredItem<T>[] {
  return policies
    .map((p) => {
      let score = 0;
      const reasons: string[] = [];

      // 1) 관심사 매칭 (+3)
      const interestCats = profile.interests.flatMap(
        (i) => INTEREST_TO_CATEGORY[i] || []
      );
      if (interestCats.includes(p.category)) {
        score += 3;
        reasons.push("내 관심사");
      }

      // 2) 단계 우선순위 매칭 (+2)
      if (profile.stage) {
        const priority = STAGE_PRIORITY[profile.stage];
        const idx = priority.indexOf(p.category);
        if (idx === 0) {
          score += 2;
          reasons.push("지금 단계에 딱");
        } else if (idx > 0) score += 1;
      }

      // 3) 혼인 초기용 인기 태그 보너스
      if (profile.stage === "newly" && p.tags.some((t) => t.includes("신혼"))) {
        score += 1;
      }
      if (profile.stage === "parenting" && p.tags.some((t) => t.includes("출산") || t.includes("신생아"))) {
        score += 2;
        reasons.push("출산 관련");
      }

      return { item: p, score, reason: reasons[0] || "" };
    })
    .sort((a, b) => b.score - a.score);
}

// 사용자 친근 닉네임 (프로필 기반)
export function getGreetingName(profile: Profile): string {
  if (profile.stage === "planning") return "예비 신부·신랑";
  if (profile.stage === "newly") return "신혼부부";
  if (profile.stage === "parenting") return "엄마·아빠";
  return "";
}
