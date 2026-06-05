import { describe, expect, it } from "vitest";
import { deriveCompareRoomStatus, getCompareRoomReadiness } from "./compare-room-engine.js";

describe("compare room engine", () => {
  it("marks a room with one card and no partner as waiting for partner", () => {
    expect(
      deriveCompareRoomStatus({
        activeCardCount: 1,
        activeMemberCount: 1,
        approvalStatuses: []
      })
    ).toBe("waiting_partner");
  });

  it("requires two cards and two approvals for both_approved", () => {
    expect(
      deriveCompareRoomStatus({
        activeCardCount: 2,
        activeMemberCount: 2,
        approvalStatuses: ["approved", "approved"]
      })
    ).toBe("both_approved");
    expect(
      deriveCompareRoomStatus({
        activeCardCount: 1,
        activeMemberCount: 2,
        approvalStatuses: ["approved", "approved"]
      })
    ).toBe("shared");
  });

  it("turns any rejected approval into rejected room status", () => {
    expect(
      deriveCompareRoomStatus({
        activeCardCount: 2,
        activeMemberCount: 2,
        approvalStatuses: ["approved", "rejected"]
      })
    ).toBe("rejected");
  });

  it("exposes readiness flags for UI copy", () => {
    expect(
      getCompareRoomReadiness({
        activeCardCount: 2,
        activeMemberCount: 1
      })
    ).toEqual({
      hasEnoughCards: true,
      hasPartner: false
    });
  });
});
