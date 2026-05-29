"use client";

import { useCallback, useEffect, useState } from "react";

export type Region = "incheon-bupyeong" | "incheon-songdo" | "incheon-etc" | "etc";
export type DecisionCategory = "sdm" | "venue" | "interior" | "goods" | "honeymoon";

export type UserProfile = {
  weddingDate: string | null;        // YYYY-MM-DD
  region: Region | null;
  completedDecisions: DecisionCategory[]; // 5대 결정점 중 완료 표시한 것
  onboardedAt: string | null;        // ISO
};

const STORAGE_KEY = "sinhon.user.profile.v1";

const EMPTY: UserProfile = {
  weddingDate: null,
  region: null,
  completedDecisions: [],
  onboardedAt: null,
};

function read(): UserProfile {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      weddingDate: typeof parsed.weddingDate === "string" ? parsed.weddingDate : null,
      region: (parsed.region as Region) ?? null,
      completedDecisions: Array.isArray(parsed.completedDecisions)
        ? (parsed.completedDecisions.filter((c) =>
            ["sdm", "venue", "interior", "goods", "honeymoon"].includes(c as string),
          ) as DecisionCategory[])
        : [],
      onboardedAt: typeof parsed.onboardedAt === "string" ? parsed.onboardedAt : null,
    };
  } catch {
    return EMPTY;
  }
}

function write(p: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("sinhon:profile"));
  } catch {
    /* 저장 실패 무시 */
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(read());
    setHydrated(true);
    const onChange = () => setProfile(read());
    window.addEventListener("sinhon:profile", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("sinhon:profile", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((patch: Partial<UserProfile>) => {
    const next = { ...read(), ...patch };
    write(next);
    setProfile(next);
  }, []);

  const completeOnboarding = useCallback(
    (weddingDate: string | null, region: Region) => {
      update({ weddingDate, region, onboardedAt: new Date().toISOString() });
    },
    [update],
  );

  const toggleDecision = useCallback(
    (category: DecisionCategory) => {
      const current = read();
      const exists = current.completedDecisions.includes(category);
      update({
        completedDecisions: exists
          ? current.completedDecisions.filter((c) => c !== category)
          : [...current.completedDecisions, category],
      });
    },
    [update],
  );

  return { profile, hydrated, update, completeOnboarding, toggleDecision };
}
