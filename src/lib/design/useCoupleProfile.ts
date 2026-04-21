"use client";

import { useEffect, useState } from "react";

// V3.1 couple profile — stored separately from onboarding `sinhon-profile-v1`
// because the onboarding profile doesn't carry names/marriageDate yet. If
// onboarding gains those fields later, migrate this hook to read from the
// shared profile key.
//
// Schema v2 (2026-04-21): split monolithic `names: "A·B"` string into
// `partnerA` / `partnerB` so the rest of the app can rename both parties
// independently. A legacy-migration path (readStorage) converts the old
// single-field shape in-place without losing data.
export interface CoupleProfile {
  partnerA: string; // default "신랑"
  partnerB: string; // default "신부"
  marriageDate: string; // ISO date or ""
}

export const DEFAULT_PROFILE: CoupleProfile = {
  partnerA: "신랑",
  partnerB: "신부",
  marriageDate: "",
};

const STORAGE_KEY = "sinhon.couple.profile";
const CHANGE_EVENT = "sinhon:profile:changed";

// Older builds sometimes saved the couple's names joined by a period, a comma,
// or whitespace instead of the canonical middle dot. Treat all four as
// separators so a value like "신랑.신부" or "신랑 신부" still migrates into two
// fields instead of leaking into partnerA as a single "신랑.신부" string.
const LEGACY_NAME_SEPARATORS = /[·.,\s]+/;

function splitLegacyNames(raw: string): { partnerA: string; partnerB: string } {
  const parts = raw
    .split(LEGACY_NAME_SEPARATORS)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    partnerA: parts[0] || DEFAULT_PROFILE.partnerA,
    partnerB: parts[1] || DEFAULT_PROFILE.partnerB,
  };
}

// A partner string is considered "dirty" if it contains any of the separator
// characters — that means it came from a monolithic legacy value that the
// previous migration failed to split (only the middle-dot was handled pre-v9).
// We re-split it in readStorage so the home Headline stops rendering
// "신랑.신부·신부 부부" artefacts.
function containsSeparator(s: string): boolean {
  return /[·.,]/.test(s) || /\s/.test(s);
}

function readStorage(): CoupleProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);

    // Legacy v1: `{ names: "지훈·서연", marriageDate }`
    // Convert once, rewrite storage so future reads hit the fast path.
    if (typeof parsed?.names === "string" && !parsed?.partnerA) {
      const { partnerA, partnerB } = splitLegacyNames(parsed.names);
      const migrated: CoupleProfile = {
        partnerA,
        partnerB,
        marriageDate: parsed.marriageDate || "",
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } catch {
        /* ignore */
      }
      return migrated;
    }

    let partnerA = parsed.partnerA || DEFAULT_PROFILE.partnerA;
    let partnerB = parsed.partnerB || DEFAULT_PROFILE.partnerB;
    // Self-heal: if a pre-v9 migration parked a joined string into partnerA
    // (e.g. "신랑.신부") re-split it and persist the clean pair.
    if (containsSeparator(partnerA)) {
      const split = splitLegacyNames(partnerA);
      partnerA = split.partnerA;
      if (partnerB === DEFAULT_PROFILE.partnerB) {
        partnerB = split.partnerB;
      }
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            partnerA,
            partnerB,
            marriageDate: parsed.marriageDate || "",
          }),
        );
      } catch {
        /* ignore */
      }
    }

    return {
      partnerA,
      partnerB,
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

  // Back-compat derived getter — some components/tests may still read
  // `names` as "A·B". Keep it readable but never use it as the source of
  // truth on write paths.
  const names = `${profile.partnerA}·${profile.partnerB}`;

  return { ...profile, names, ready, update };
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
