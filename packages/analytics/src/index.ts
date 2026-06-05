export const analyticsEventNames = [
  "account_created",
  "couple_created",
  "partner_invited",
  "partner_joined",
  "onboarding_started",
  "onboarding_completed",
  "scenario_created",
  "scenario_evaluated",
  "policy_check_started",
  "policy_check_completed",
  "offer_viewed",
  "offer_compared",
  "compare_room_created",
  "approval_submitted",
  "both_approved",
  "lead_submitted",
  "content_viewed",
  "calculator_started",
  "task_completed"
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsPayloadValue =
  | AnalyticsPayloadValue[]
  | boolean
  | null
  | number
  | string
  | { [key: string]: AnalyticsPayloadValue };

export type AnalyticsPayload = Record<string, AnalyticsPayloadValue>;

export const analyticsFunnelSteps: AnalyticsEventName[] = [
  "account_created",
  "couple_created",
  "partner_invited",
  "partner_joined",
  "onboarding_completed",
  "scenario_created",
  "scenario_evaluated",
  "policy_check_completed",
  "compare_room_created",
  "approval_submitted",
  "both_approved",
  "lead_submitted"
];

const blockedPayloadKeys = new Set([
  "name",
  "displayname",
  "contactname",
  "phone",
  "contactphone",
  "email",
  "account",
  "bankaccount",
  "filename",
  "file",
  "incomeamount",
  "assetamount"
]);

function normalizeKey(key: string) {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSensitiveValueReason(value: string) {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) {
    return "email_value";
  }

  if (/\b01[016789]-?\d{3,4}-?\d{4}\b/.test(value)) {
    return "phone_value";
  }

  return null;
}

function inspectValue(
  value: unknown,
  path: string,
  blockedKeys: string[],
  blockedValues: string[]
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectValue(item, `${path}[${index}]`, blockedKeys, blockedValues)
    );
    return;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, item]) => {
      const nextPath = path ? `${path}.${key}` : key;

      if (blockedPayloadKeys.has(normalizeKey(key))) {
        blockedKeys.push(nextPath);
      }

      inspectValue(item, nextPath, blockedKeys, blockedValues);
    });
    return;
  }

  if (typeof value === "string") {
    const reason = getSensitiveValueReason(value);

    if (reason) {
      blockedValues.push(`${path || "value"}:${reason}`);
    }
  }
}

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return analyticsEventNames.includes(value as AnalyticsEventName);
}

export function inspectAnalyticsPayload(payload: Record<string, unknown>) {
  const blockedKeys: string[] = [];
  const blockedValues: string[] = [];

  inspectValue(payload, "", blockedKeys, blockedValues);

  return {
    blockedKeys,
    blockedValues,
    ok: blockedKeys.length === 0 && blockedValues.length === 0
  };
}
