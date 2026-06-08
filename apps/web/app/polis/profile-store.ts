"use client";

import { useEffect, useState } from "react";

export type Profile = {
  region: string;
  stage: string;
  interests: string[];
  name: string;
  onboardedAt: string;
};

const PROFILE_KEY = "sinhon.polis_profile.v1";
const BOOKMARK_KEY = "sinhon.polis_bookmarks.v1";
const APPLIED_KEY = "sinhon.polis_applied.v1";

export const REGIONS = [
  "서울 마포구",
  "서울 강남구",
  "서울 관악구",
  "경기 성남시",
  "인천 연수구",
  "부산 해운대구",
  "대구 수성구",
  "광주 북구",
  "대전 유성구"
];

export const STAGES = [
  { v: "결혼 준비 중", emoji: "💍" },
  { v: "신혼 1년 이내", emoji: "🎉" },
  { v: "신혼 1~3년차", emoji: "🏠" },
  { v: "신혼 3~5년차", emoji: "👶" },
  { v: "신혼 5~7년차", emoji: "🌷" }
];

export const INTERESTS = [
  { v: "주거·청약", emoji: "🏠" },
  { v: "전세·대출", emoji: "💳" },
  { v: "출산", emoji: "🍼" },
  { v: "육아", emoji: "🧸" },
  { v: "혼인·세제", emoji: "💍" },
  { v: "건강·난임", emoji: "🩺" }
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

export function loadProfile(): Profile | null {
  return readJSON<Profile | null>(PROFILE_KEY, null);
}

export function saveProfile(p: Profile) {
  writeJSON(PROFILE_KEY, p);
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}

export function useProfile(): [Profile | null, (p: Profile | null) => void] {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    setProfile(loadProfile());
  }, []);
  const update = (next: Profile | null) => {
    setProfile(next);
    if (next) saveProfile(next);
    else clearProfile();
  };
  return [profile, update];
}

export function useBookmarks(): {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
} {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(readJSON<string[]>(BOOKMARK_KEY, []));
  }, []);
  return {
    ids,
    has: (id) => ids.includes(id),
    toggle: (id) => {
      setIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
        writeJSON(BOOKMARK_KEY, next);
        return next;
      });
    }
  };
}

export function useApplied(): {
  ids: string[];
  has: (id: string) => boolean;
  apply: (id: string) => void;
} {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(readJSON<string[]>(APPLIED_KEY, []));
  }, []);
  return {
    ids,
    has: (id) => ids.includes(id),
    apply: (id) => {
      setIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [id, ...prev];
        writeJSON(APPLIED_KEY, next);
        return next;
      });
    }
  };
}
