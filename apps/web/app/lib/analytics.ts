"use client";

import { apiRequest, AUTH_TOKEN_STORAGE_KEY } from "./api";

type TrackEventInput = {
  coupleId?: string;
  eventName:
    | "calculator_started"
    | "content_viewed"
    | "offer_compared"
    | "offer_viewed"
    | "onboarding_started";
  payload?: Record<string, unknown>;
};

const ANONYMOUS_ID_STORAGE_KEY = "sinhon_os_anonymous_id";

function createAnonymousId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getAnonymousId() {
  const storedId = localStorage.getItem(ANONYMOUS_ID_STORAGE_KEY);

  if (storedId) {
    return storedId;
  }

  const nextId = createAnonymousId();
  localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, nextId);

  return nextId;
}

export async function trackEvent({ coupleId, eventName, payload = {} }: TrackEventInput) {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? undefined;

    await apiRequest("/analytics/events", {
      body: {
        anonymousId: getAnonymousId(),
        coupleId,
        eventName,
        payload,
        source: "web"
      },
      method: "POST",
      token
    });
  } catch {
    return;
  }
}
