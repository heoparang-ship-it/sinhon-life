"use client";

import { useEffect, useState } from "react";

// V3.1 couple profile — stored separately from onboarding `sinhon-profile-v1`
// because the onboarding profile doesn't carry names/marriageDate yet. If
// onboarding gains those fields later, migrate this hook to read from the
// shared profile key.
export interface CoupleProfile {
  names: string; // "지훈·서연"
  marriageDate: string; // ISO date or ""
}

const DEFAULT_PROFILE: CoupleProfile = {
  names: "지훈·서연",
  marriageDate: "",
};

const STORAGE_KEY = "sinhon.couple.profile";
const CHANGE_EVENT = "sinhon:profile:changed";

function readStorage(): CoupleProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      names: parsed.names || DEFAULT_PROFILE.names,
      marriageDate: parsed.marriageDate || "",
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function useCoupleProfile() {
  const [profile, setProfile] = useState<CoupleProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(readStorage());
    setReady(true);
    const handler = () => setProfile(readStorage());
    window.addEventListener("storage", handler);
    window.addEventListener(CHANGE_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(CHANGE_EVENT, handler);
    };
  }, []);

  const update = (patch: Partial<CoupleProfile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      /* ignore */
    }
  };

  return { ...profile, ready, update };
}

export function daysUntilAnniversary(marriageDate: string): number | null {
  if (!marriageDate) return null;
  const d = new Date(marriageDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  const target =
    thisYear.getTime() < now.setHours(0, 0, 0, 0)
      ? new Date(now.getFullYear() + 1, d.getMonth(), d.getDate())
      : thisYear;
  const diff = Math.ceil((target.getTime() - Date.now()) / 86400000);
  return diff;
}
