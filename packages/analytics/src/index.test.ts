import { describe, expect, it } from "vitest";
import { inspectAnalyticsPayload, isAnalyticsEventName } from "./index.js";

describe("analytics helpers", () => {
  it("recognizes approved event names", () => {
    expect(isAnalyticsEventName("lead_submitted")).toBe(true);
    expect(isAnalyticsEventName("unknown_event")).toBe(false);
  });

  it("flags direct personal payload keys", () => {
    expect(inspectAnalyticsPayload({ phone: "010-0000-0000" })).toEqual({
      blockedKeys: ["phone"],
      blockedValues: ["phone:phone_value"],
      ok: false
    });
  });

  it("flags nested personal payload keys and values", () => {
    expect(
      inspectAnalyticsPayload({
        lead: {
          contactName: "홍길동"
        },
        note: "연락처는 test@example.com"
      })
    ).toEqual({
      blockedKeys: ["lead.contactName"],
      blockedValues: ["note:email_value"],
      ok: false
    });
  });
});
