import { describe, expect, it } from "vitest";
import {
  calculateEstimatedTotalPrice,
  getOfferPriceValidity,
  isPriceVersionVisibleByDefault
} from "./offer-price-engine.js";

describe("offer price engine", () => {
  it("calculates estimated total with required options", () => {
    expect(
      calculateEstimatedTotalPrice({
        basePrice: 1_500_000,
        requiredOptions: [
          {
            amount: 300_000,
            includedInEstimatedTotal: true,
            key: "weekend_fee",
            label: "주말 추가 비용",
            pricingType: "fixed"
          },
          {
            includedInEstimatedTotal: true,
            key: "assistant_fee",
            label: "헬퍼비",
            maxAmount: 150_000,
            minAmount: 100_000,
            pricingType: "range"
          },
          {
            amount: 250_000,
            includedInEstimatedTotal: false,
            key: "optional_upgrade",
            label: "선택 업그레이드",
            pricingType: "fixed"
          }
        ]
      })
    ).toBe(1_950_000);
  });

  it("marks expired prices as hidden from default offer lists", () => {
    const now = new Date("2026-06-05T00:00:00.000Z");

    expect(
      isPriceVersionVisibleByDefault({
        now,
        validUntil: new Date("2026-06-04T00:00:00.000Z"),
        verificationStatus: "verified"
      })
    ).toBe(false);
    expect(
      isPriceVersionVisibleByDefault({
        now,
        validUntil: new Date("2026-06-06T00:00:00.000Z"),
        verificationStatus: "verified"
      })
    ).toBe(true);
    expect(
      isPriceVersionVisibleByDefault({
        now,
        validUntil: new Date("2026-06-06T00:00:00.000Z"),
        verificationStatus: "unverified"
      })
    ).toBe(false);
  });

  it("keeps prices without validity as visible but explicit", () => {
    expect(
      getOfferPriceValidity({
        now: new Date("2026-06-05T00:00:00.000Z"),
        validUntil: null
      })
    ).toBe("validity_not_recorded");
  });
});
