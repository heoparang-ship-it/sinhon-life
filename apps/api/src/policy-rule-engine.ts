import {
  policyEligibilityCriteriaSchema,
  type PolicyEligibilityCriteria,
  type PolicyRequiredDocument,
  type PolicyRequiredInput,
  type PolicyResultStatus
} from "@sinhon-os/schemas";

export const POLICY_DISCLAIMER =
  "이 결과는 입력값과 저장된 정책 룰에 따른 가능성 안내입니다. 실제 접수 가능 여부와 지원 내용은 반드시 공식 공고와 담당 기관에서 다시 확인해 주세요.";

export type EligibilityInput = {
  assetRange?: string | null;
  cashOnHandRange?: string | null;
  childrenPlanStatus?: string | null;
  familySupportType?: string | null;
  housingType?: string | null;
  incomeRange?: string | null;
  loanConsiderationStatus?: string | null;
  moveInPlanAt?: string | null;
  preferredResidenceRegion?: string | null;
  preferredWeddingStyle?: string | null;
  totalBudgetRange?: string | null;
  weddingDate?: string | null;
  weddingRegion?: string | null;
  workRegion?: string | null;
} & Record<string, unknown>;

export type PolicyProgramForEvaluation = {
  applicationEndAt?: Date | null;
  applicationStartAt?: Date | null;
  category: string;
  cautionText?: string | null;
  id: string;
  name: string;
  providerName: string;
  region?: string | null;
  sourceUpdatedAt?: Date | null;
  sourceUrl: string;
  status: string;
  summary: string;
  verifiedAt?: Date | null;
};

export type PolicyRuleVersionForEvaluation = {
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  eligibilityCriteria: unknown;
  id: string;
  policyProgramId: string;
  requiredDocuments?: unknown;
  requiredInputs?: unknown;
  resultReasonTemplate?: unknown;
  ruleSummary: string;
  sourceUpdatedAt?: Date | null;
  sourceUrl: string;
  status: string;
  verifiedAt?: Date | null;
  version: number;
};

export type ConditionEvaluation = {
  inputKey: string;
  label?: string;
  matched: boolean;
  operator: string;
  reason: string;
};

export type PolicyEvaluation = {
  disclaimer: string;
  expiresAt: Date | null;
  inputSnapshot: EligibilityInput;
  missingInputs: PolicyRequiredInput[];
  resultReason: string;
  resultStatus: PolicyResultStatus;
  ruleVersionId: string;
  requiredDocuments: PolicyRequiredDocument[];
  sourceUrl: string;
  sourceUpdatedAt: Date | null;
  verifiedAt: Date | null;
  version: number;
};

const unknownReason =
  "정책 룰이나 출처 정보가 충분하지 않아 가능성을 판단하지 않았습니다. 공식 공고를 먼저 확인해 주세요.";
const definitivePhrasePattern =
  /확정|승인|보장|대출\s*가능|선정|approved|confirmed|guaranteed|loan_available|selected/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFilled(value: unknown) {
  return value !== undefined && value !== null && value !== "" && value !== "not_set";
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toRequiredInputs(value: unknown): PolicyRequiredInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return {
          key: item,
          label: item
        };
      }

      if (!isObject(item) || typeof item.key !== "string" || typeof item.label !== "string") {
        return null;
      }

      return {
        description: typeof item.description === "string" ? item.description : undefined,
        key: item.key,
        label: item.label
      };
    })
    .filter((item): item is PolicyRequiredInput => Boolean(item));
}

function toRequiredDocuments(value: unknown): PolicyRequiredDocument[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return {
          key: item,
          label: item,
          required: true
        };
      }

      if (!isObject(item) || typeof item.key !== "string" || typeof item.label !== "string") {
        return null;
      }

      return {
        description: typeof item.description === "string" ? item.description : undefined,
        key: item.key,
        label: item.label,
        required: typeof item.required === "boolean" ? item.required : true
      };
    })
    .filter((item): item is PolicyRequiredDocument => Boolean(item));
}

function getReasonTemplate(value: unknown, status: PolicyResultStatus) {
  if (!isObject(value)) {
    return undefined;
  }

  const template = value[status];
  if (typeof template !== "string" || definitivePhrasePattern.test(template)) {
    return undefined;
  }

  return template;
}

function dateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function normalizeDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string" || !value) {
    return null;
  }

  const parsed = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getBetweenBounds(value: unknown) {
  if (!isObject(value)) {
    return {
      end: null,
      start: null
    };
  }

  const startValue = value.start ?? value.from ?? value.min;
  const endValue = value.end ?? value.to ?? value.max;

  return {
    end: normalizeDate(endValue),
    start: normalizeDate(startValue)
  };
}

function matchesEquals(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    return expected.some((item) => matchesEquals(actual, item));
  }

  return actual === expected;
}

function evaluateCondition(
  condition: PolicyEligibilityCriteria["conditions"][number],
  input: EligibilityInput
): ConditionEvaluation {
  const actual = input[condition.inputKey];
  const expected = condition.value;
  let matched = false;

  if (condition.operator === "exists") {
    matched = isFilled(actual);
  }

  if (condition.operator === "equals") {
    matched = matchesEquals(actual, expected);
  }

  if (condition.operator === "in" || condition.operator === "range_in") {
    matched = toStringArray(expected).some((item) => item === actual);
  }

  if (condition.operator === "not_in") {
    const expectedItems = toStringArray(expected);
    matched = expectedItems.length > 0 && !expectedItems.some((item) => item === actual);
  }

  if (condition.operator === "date_between") {
    const actualDate = normalizeDate(actual);
    const { end, start } = getBetweenBounds(expected);
    matched =
      Boolean(actualDate) &&
      (!start || actualDate!.getTime() >= start.getTime()) &&
      (!end || actualDate!.getTime() <= end.getTime());
  }

  return {
    inputKey: condition.inputKey,
    label: condition.label,
    matched,
    operator: condition.operator,
    reason:
      condition.reason ??
      `${condition.label ?? condition.inputKey} 조건이 ${matched ? "맞습니다" : "맞지 않습니다"}.`
  };
}

function statusReason(status: PolicyResultStatus, program: PolicyProgramForEvaluation) {
  const sourcePrefix = `${program.providerName}의 ${program.name}`;
  const messages: Record<PolicyResultStatus, string> = {
    expired: `${sourcePrefix}은 현재 신청 기간 또는 룰 유효기간을 벗어난 것으로 표시됩니다.`,
    likely_eligible: `${sourcePrefix}은 입력한 조건과 대체로 맞습니다. 공식 공고로 세부 요건을 다시 확인해 주세요.`,
    maybe_eligible: `${sourcePrefix}은 일부 조건 확인이 필요합니다. 공식 공고와 담당 기관 안내를 함께 확인해 주세요.`,
    need_more_info: `${sourcePrefix}은 판단에 필요한 입력이 더 필요합니다.`,
    not_eligible: `${sourcePrefix}은 현재 입력값 기준으로 주요 조건과 맞지 않습니다.`,
    unknown: unknownReason
  };

  return messages[status];
}

function isOutsideWindow(options: { end?: Date | null; now: Date; start?: Date | null }) {
  return Boolean(
    (options.start && options.now.getTime() < options.start.getTime()) ||
    (options.end && options.now.getTime() > options.end.getTime())
  );
}

function buildResultReason(options: {
  conditionResults: ConditionEvaluation[];
  missingInputs: PolicyRequiredInput[];
  program: PolicyProgramForEvaluation;
  resultStatus: PolicyResultStatus;
  ruleVersion: PolicyRuleVersionForEvaluation;
}) {
  const template = getReasonTemplate(
    options.ruleVersion.resultReasonTemplate,
    options.resultStatus
  );

  if (template) {
    return template;
  }

  if (options.resultStatus === "need_more_info") {
    const labels = options.missingInputs.map((input) => input.label).join(", ");
    return `${statusReason(options.resultStatus, options.program)} 필요한 입력: ${labels}`;
  }

  if (options.resultStatus === "not_eligible") {
    const failed = options.conditionResults
      .filter((condition) => !condition.matched)
      .map((condition) => condition.reason)
      .slice(0, 3)
      .join(" ");

    return failed || statusReason(options.resultStatus, options.program);
  }

  return statusReason(options.resultStatus, options.program);
}

export function evaluatePolicyRule(options: {
  input: EligibilityInput;
  now?: Date;
  policyProgram: PolicyProgramForEvaluation;
  ruleVersion: PolicyRuleVersionForEvaluation;
}): PolicyEvaluation {
  const now = options.now ?? new Date();
  const { policyProgram, ruleVersion } = options;
  const requiredInputs = toRequiredInputs(ruleVersion.requiredInputs);
  const requiredDocuments = toRequiredDocuments(ruleVersion.requiredDocuments);
  const missingInputs = requiredInputs.filter((input) => !isFilled(options.input[input.key]));
  const sourceUpdatedAt = ruleVersion.sourceUpdatedAt ?? policyProgram.sourceUpdatedAt ?? null;
  const verifiedAt = ruleVersion.verifiedAt ?? policyProgram.verifiedAt ?? null;

  let resultStatus: PolicyResultStatus;
  let conditionResults: ConditionEvaluation[] = [];

  if (
    policyProgram.status === "expired" ||
    isOutsideWindow({
      end: policyProgram.applicationEndAt,
      now,
      start: policyProgram.applicationStartAt
    }) ||
    isOutsideWindow({
      end: ruleVersion.effectiveTo,
      now,
      start: ruleVersion.effectiveFrom
    })
  ) {
    resultStatus = "expired";
  } else if (
    policyProgram.status !== "active" ||
    ruleVersion.status !== "active" ||
    !policyProgram.sourceUrl ||
    !ruleVersion.sourceUrl
  ) {
    resultStatus = "unknown";
  } else if (missingInputs.length > 0) {
    resultStatus = "need_more_info";
  } else {
    const parsedCriteria = policyEligibilityCriteriaSchema.safeParse(
      ruleVersion.eligibilityCriteria
    );

    if (!parsedCriteria.success) {
      resultStatus = "unknown";
    } else {
      conditionResults = parsedCriteria.data.conditions.map((condition) =>
        evaluateCondition(condition, options.input)
      );

      const matchedCount = conditionResults.filter((condition) => condition.matched).length;
      const criteriaMatched =
        parsedCriteria.data.mode === "all"
          ? matchedCount === conditionResults.length
          : matchedCount > 0;

      if (!criteriaMatched) {
        resultStatus = "not_eligible";
      } else if (parsedCriteria.data.sample || !sourceUpdatedAt || !verifiedAt) {
        resultStatus = "maybe_eligible";
      } else {
        resultStatus = "likely_eligible";
      }
    }
  }

  return {
    disclaimer: POLICY_DISCLAIMER,
    expiresAt: ruleVersion.effectiveTo ?? policyProgram.applicationEndAt ?? null,
    inputSnapshot: {
      ...options.input
    },
    missingInputs,
    resultReason: buildResultReason({
      conditionResults,
      missingInputs,
      program: policyProgram,
      resultStatus,
      ruleVersion
    }),
    resultStatus,
    requiredDocuments,
    ruleVersionId: ruleVersion.id,
    sourceUrl: ruleVersion.sourceUrl || policyProgram.sourceUrl,
    sourceUpdatedAt,
    verifiedAt,
    version: ruleVersion.version
  };
}

export function buildPolicySourceLabel(
  evaluation: Pick<PolicyEvaluation, "sourceUpdatedAt" | "verifiedAt">
) {
  return {
    sourceUpdatedAt: dateOnly(evaluation.sourceUpdatedAt),
    verifiedAt: dateOnly(evaluation.verifiedAt)
  };
}
