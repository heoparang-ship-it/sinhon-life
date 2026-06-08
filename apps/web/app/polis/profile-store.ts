"use client";

import { useCallback, useEffect, useState } from "react";

export type Partner = {
  name: string;
  /** invited: 코드 발급·대기, joined: 연결 완료 */
  status: "invited" | "joined";
  code: string;
};

export type Profile = {
  name: string;
  region: string;
  stage: string;
  interests: string[];
  onboardedAt: string;
  partner: Partner | null;
};

/* v2: 솔로 시작 + partner 필드 도입 (구 커플 프로필과 분리) */
const PROFILE_KEY = "sinhon.polis_profile.v2";
const BOOKMARK_KEY = "sinhon.polis_bookmarks.v1";
const APPLIED_KEY = "sinhon.polis_applied.v1";
const VIEWS_KEY = "sinhon.polis_views.v1";
const READ_NOTIF_KEY = "sinhon.polis_readnotif.v1";

export const REGIONS = [
  "서울 마포구",
  "서울 강남구",
  "서울 관악구",
  "서울 성동구",
  "경기 성남시",
  "경기 고양시",
  "인천 연수구",
  "부산 해운대구",
  "대구 수성구",
  "광주 북구",
  "대전 유성구",
  "세종특별자치시"
];

export const STAGES = [
  { v: "결혼 준비 중", emoji: "💍" },
  { v: "신혼 1년 이내", emoji: "🎉" },
  { v: "신혼 1~3년차", emoji: "🏠" },
  { v: "신혼 3~5년차", emoji: "👶" },
  { v: "신혼 5~7년차", emoji: "🌷" }
];

/* 카테고리: "·" 미사용 (요청), 정책 cat 값과 정확히 일치해야 매칭됨 */
export const INTERESTS = [
  { v: "주거/청약", emoji: "🏠" },
  { v: "전세/대출", emoji: "💳" },
  { v: "출산", emoji: "🍼" },
  { v: "육아", emoji: "🧸" },
  { v: "혼인/세제", emoji: "💍" },
  { v: "건강/난임", emoji: "🩺" }
];

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function removeKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function makeInviteCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function useProfile(): [Profile | null, (p: Profile | null) => void] {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    setProfile(readJSON<Profile | null>(PROFILE_KEY, null));
  }, []);
  const update = useCallback((next: Profile | null) => {
    setProfile(next);
    if (next) writeJSON(PROFILE_KEY, next);
    else removeKey(PROFILE_KEY);
  }, []);
  return [profile, update];
}

function useIdList(key: string) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(readJSON<string[]>(key, []));
  }, [key]);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, setIds, has };
}

export function useBookmarks() {
  const { ids, setIds, has } = useIdList(BOOKMARK_KEY);
  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
        writeJSON(BOOKMARK_KEY, next);
        return next;
      });
    },
    [setIds]
  );
  return { ids, has, toggle };
}

export function useApplied() {
  const { ids, setIds, has } = useIdList(APPLIED_KEY);
  const apply = useCallback(
    (id: string) => {
      setIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [id, ...prev];
        writeJSON(APPLIED_KEY, next);
        return next;
      });
    },
    [setIds]
  );
  return { ids, has, apply };
}

/** 클릭/조회 추적 — 정책 id → 조회 횟수. 실제 사용자 관심 신호. */
export function useViews() {
  const [map, setMap] = useState<Record<string, number>>({});
  useEffect(() => {
    setMap(readJSON<Record<string, number>>(VIEWS_KEY, {}));
  }, []);
  const record = useCallback((id: string) => {
    setMap((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      writeJSON(VIEWS_KEY, next);
      return next;
    });
  }, []);
  return { map, record };
}

export function useReadNotifications() {
  const { ids, setIds, has } = useIdList(READ_NOTIF_KEY);
  const markAll = useCallback(
    (allIds: string[]) => {
      setIds(() => {
        writeJSON(READ_NOTIF_KEY, allIds);
        return allIds;
      });
    },
    [setIds]
  );
  return { readIds: ids, has, markAll };
}
