import { describe, expect, it } from "vitest";
import { evaluatePolicyRule, POLICY_DISCLAIMER } from "./policy-rule-engine.js";

const now = new Date("2026-06-05T00:00:00.000Z");

const policyProgram = {
  applicationEndAt: new Date("2026-12-31T00:00:00.000Z"),
  applicationStartAt: new Date("2026-01-01T00:00:00.000Z"),
  category: "housing",
  cautionText: "샘플 정책입니다.",
  id: "policy-1",
  name: "신혼 주거 준비 지원",
  providerName: "샘플시",
  region: "서울",
  sourceUpdatedAt: new Date("2026-06-01T00:00:00.000Z"),
  sourceUrl: "https://example.com/policies/housing",
  status: "active",
  summary: "신혼 주거 준비 조건을 확인합니다.",
  verifiedAt: new Date("2026-06-02T00:00:00.000Z")
};

const ruleVersion = {
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: new Date("2026-12-31T00:00:00.000Z"),
  eligibilityCriteria: {
    conditions: [
      {
        inputKey: "preferredResidenceRegion",
        label: "희망 거주 지역",
        operator: "in",
        reason: "희망 거주 지역이 서울이어야 합니다.",
        value: ["서울"]
      },
      {
        inputKey: "housingType",
        label: "주거 형태",
        operator: "equals",
        reason: "전세 준비 가구를 대상으로 합니다.",
        value: "rental_jeonse"
      }
    ],
    mode: "all",
    sample: false
  },
  id: "rule-1",
  policyProgramId: "policy-1",
  requiredDocuments: [
    {
      key: "lease_contract",
      label: "임대차계약서",
      required: true
    }
  ],
  requiredInputs: [
    {
      key: "preferredResidenceRegion",
      label: "희망 거주 지역"
    },
    {
      key: "housingType",
      label: "주거 형태"
    }
  ],
  resultReasonTemplate: {},
  ruleSummary: "서울 전세 준비 가구를 확인합니다.",
  sourceUpdatedAt: new Date("2026-06-01T00:00:00.000Z"),
  sourceUrl: "https://example.com/policies/housing/rules",
  status: "active",
  verifiedAt: new Date("2026-06-02T00:00:00.000Z"),
  version: 1
};

describe("evaluatePolicyRule", () => {
  it("returns likely_eligible when all active verified conditions match", () => {
    const result = evaluatePolicyRule({
      input: {
        housingType: "rental_jeonse",
        preferredResidenceRegion: "서울"
      },
      now,
      policyProgram,
      ruleVersion
    });

    expect(result.resultStatus).toBe("likely_eligible");
    expect(result.requiredDocuments).toEqual([
      {
        key: "lease_contract",
        label: "임대차계약서",
        required: true
      }
    ]);
    expect(result.disclaimer).toBe(POLICY_DISCLAIMER);
    expect(result.resultReason).not.toMatch(/확정|승인|보장|대출 가능/);
  });

  it("returns need_more_info with missing input labels", () => {
    const result = evaluatePolicyRule({
      input: {
        preferredResidenceRegion: "서울"
      },
      now,
      policyProgram,
      ruleVersion
    });

    expect(result.resultStatus).toBe("need_more_info");
    expect(result.missingInputs).toEqual([
      {
        key: "housingType",
        label: "주거 형태"
      }
    ]);
    expect(result.resultReason).toContain("주거 형태");
  });

  it("returns not_eligible when a required condition fails", () => {
    const result = evaluatePolicyRule({
      input: {
        housingType: "purchase",
        preferredResidenceRegion: "서울"
      },
      now,
      policyProgram,
      ruleVersion
    });

    expect(result.resultStatus).toBe("not_eligible");
    expect(result.resultReason).toContain("전세 준비 가구");
  });

  it("returns maybe_eligible for sample criteria even when the conditions match", () => {
    const result = evaluatePolicyRule({
      input: {
        housingType: "rental_jeonse",
        preferredResidenceRegion: "서울"
      },
      now,
      policyProgram,
      ruleVersion: {
        ...ruleVersion,
        eligibilityCriteria: {
          ...ruleVersion.eligibilityCriteria,
          sample: true
        }
      }
    });

    expect(result.resultStatus).toBe("maybe_eligible");
  });

  it("returns expired when the policy window is past", () => {
    const result = evaluatePolicyRule({
      input: {
        housingType: "rental_jeonse",
        preferredResidenceRegion: "서울"
      },
      now: new Date("2027-01-01T00:00:00.000Z"),
      policyProgram,
      ruleVersion
    });

    expect(result.resultStatus).toBe("expired");
  });
});
