// V3.2 S1 minimum-viable analytics wrapper.
// Event schema is defined in docs/2026-04-21_V3.2_S0_KPIs.md §3.
// S1: localStorage buffer + opportunistic POST to /api/events (no-op if route absent).
// S3: GA4 script injection is appended in layout.tsx; this wrapper stays the
// single call-site so swapping the transport later touches one file only.

type EventName =
  // Home · Hero
  | "home_view"
  | "hero_slide_view"
  | "hero_slide_click"
  | "hero_dot_click"
  | "hero_pause"
  | "hero_slide_2_empty"
  // Chat
  | "chat_message_sent"
  | "chat_response_received"
  | "suggested_checklist_cta_shown"
  | "checklist_group_merge"
  | "checklist_group_merge_cancel"
  // Checklist
  | "checklist_view"
  | "pill_tap"
  | "reason_sheet_view_duration"
  | "item_hidden"
  | "item_unhidden"
  | "checklist_search_input"
  | "item_added_from_search"
  // Activation
  | "activation_5plus";

type EventPayload = Record<string, unknown>;

const BUFFER_KEY = "sinhon.analytics.buffer.v1";
const BUFFER_MAX = 50; // drop oldest beyond this to cap localStorage bloat
const ACTIVATION_KEY = "sinhon.activation.fired.v1";

interface BufferedEvent {
  name: EventName;
  payload: EventPayload;
  ts: number; // epoch ms
}

function readBuffer(): BufferedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BUFFER_KEY);
    return raw ? (JSON.parse(raw) as BufferedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeBuffer(events: BufferedEvent[]) {
  try {
    window.localStorage.setItem(BUFFER_KEY, JSON.stringify(events.slice(-BUFFER_MAX)));
  } catch {
    /* ignore quota errors */
  }
}

function flush(events: BufferedEvent[]) {
  // Best-effort relay. API route can be added in S3; until then we just
  // localStorage-buffer and skip the network call.
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      keepalive: true,
    }).catch(() => {
      /* offline or route absent — keep in buffer */
    });
  } catch {
    /* ignore */
  }
}

export function track(name: EventName, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;
  const ev: BufferedEvent = { name, payload, ts: Date.now() };
  const buffer = readBuffer();
  buffer.push(ev);
  writeBuffer(buffer);
  // Try to ship immediately but don't block; the buffer keeps it if offline.
  flush([ev]);
}

/**
 * Fire activation_5plus exactly once per user. Safe to call after every
 * checklist mutation — the dedupe is handled here.
 */
export function maybeFireActivation(
  currentCount: number,
  source: "chat" | "search" | "manual",
  firstSeenAt?: number,
) {
  if (typeof window === "undefined") return;
  if (currentCount < 5) return;
  try {
    if (window.localStorage.getItem(ACTIVATION_KEY)) return;
    window.localStorage.setItem(ACTIVATION_KEY, String(Date.now()));
  } catch {
    return;
  }
  const minutesFromOnboarding = firstSeenAt
    ? Math.max(0, Math.round((Date.now() - firstSeenAt) / 60000))
    : undefined;
  track("activation_5plus", { source, minutesFromOnboarding });
}

/**
 * Read-only helper for a future /admin debug surface.
 * Intentionally not exported from the default import surface.
 */
export function __peekBuffer(): BufferedEvent[] {
  return readBuffer();
}
