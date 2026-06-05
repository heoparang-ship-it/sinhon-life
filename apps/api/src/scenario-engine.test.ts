import { describe, expect, it } from "vitest";
import { calculateScenario } from "./scenario-engine.js";

describe("scenario engine", () => {
  it("calculates one-time total, monthly amount, and shortfall with explicit budget", () => {
    const result = calculateScenario({
      budgetBasis: {
        availableBudgetAmount: 20_000_000
      },
      items: [
        {
          amount: 16_000_000,
          amountType: "user_input",
          category: "wedding",
          frequency: "one_time",
          isRequired: true,
          label: "예식장",
          sortOrder: 10
        },
        {
          amount: 1_200_000,
          amountType: "user_input",
          category: "housing_monthly",
          frequency: "monthly",
          isRequired: false,
          label: "월 주거비",
          sortOrder: 20
        },
        {
          amount: 8_000_000,
          amountType: "user_input",
          category: "appliance",
          frequency: "one_time",
          isRequired: false,
          label: "가전",
          sortOrder: 30
        }
      ]
    });

    expect(result.totalAmount).toBe(24_000_000);
    expect(result.monthlyAmount).toBe(1_200_000);
    expect(result.shortfallAmount).toBe(4_000_000);
    expect(result.warnings).toContain("shortfall_present");
    expect(result.warnings).toContain("monthly_amount_present");
  });

  it("does not calculate shortfall from onboarding ranges only", () => {
    const result = calculateScenario({
      budgetBasis: {
        cashOnHandRange: "50m_100m",
        totalBudgetRange: "100m_200m"
      },
      items: [
        {
          amount: 12_000_000,
          amountType: "sample",
          category: "wedding",
          frequency: "one_time",
          isRequired: true,
          label: "예식 샘플",
          sortOrder: 10
        }
      ],
      onboardingContext: {
        loanConsiderationStatus: "considering"
      }
    });

    expect(result.shortfallAmount).toBeNull();
    expect(result.containsSampleValue).toBe(true);
    expect(result.inputSnapshot.budgetBasis.type).toBe("range_only");
    expect(result.warnings).toEqual([
      "sample_value_used",
      "budget_range_only",
      "loan_considered_needs_review"
    ]);
  });
});
