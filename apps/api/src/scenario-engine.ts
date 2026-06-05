import type { ScenarioItemInput } from "@sinhon-os/schemas";

export const SCENARIO_CALCULATION_VERSION = "scenario-engine-v1";

export type ScenarioBudgetBasis = {
  availableBudgetAmount?: number;
  cashOnHandRange?: string | null;
  totalBudgetRange?: string | null;
};

export type ScenarioOnboardingContext = {
  childrenPlanStatus?: string | null;
  housingType?: string | null;
  loanConsiderationStatus?: string | null;
  moveInPlanAt?: string | null;
  preferredResidenceRegion?: string | null;
  preferredWeddingStyle?: string | null;
  weddingDate?: string | null;
  weddingRegion?: string | null;
};

export type ScenarioRiskFlagCode =
  | "budget_range_only"
  | "loan_considered_needs_review"
  | "missing_required_item"
  | "monthly_amount_present"
  | "partner_price_snapshot_used"
  | "sample_value_used"
  | "shortfall_present";

export type ScenarioRiskFlag = {
  code: ScenarioRiskFlagCode;
  message: string;
  severity: "info" | "warning";
};

export type ScenarioInputSnapshot = {
  budgetBasis: {
    availableBudgetAmount?: number;
    cashOnHandRange?: string | null;
    totalBudgetRange?: string | null;
    type: "amount" | "none" | "range_only";
  };
  calculationVersion: typeof SCENARIO_CALCULATION_VERSION;
  items: ScenarioItemInput[];
  onboardingContext: ScenarioOnboardingContext;
};

export type ScenarioCalculation = {
  containsSampleValue: boolean;
  inputSnapshot: ScenarioInputSnapshot;
  monthlyAmount: number;
  riskFlags: ScenarioRiskFlag[];
  shortfallAmount: number | null;
  totalAmount: number;
  warnings: ScenarioRiskFlagCode[];
};

type CalculateScenarioInput = {
  budgetBasis?: ScenarioBudgetBasis;
  items: ScenarioItemInput[];
  onboardingContext?: ScenarioOnboardingContext;
};

function hasRange(value: string | null | undefined) {
  return Boolean(value && value !== "not_set" && value !== "private");
}

function hasSource(item: ScenarioItemInput) {
  return Boolean(item.sourceUrl || item.sourceType);
}

function uniqueRiskFlags(flags: ScenarioRiskFlag[]) {
  const seen = new Set<ScenarioRiskFlagCode>();
  return flags.filter((flag) => {
    if (seen.has(flag.code)) {
      return false;
    }

    seen.add(flag.code);
    return true;
  });
}

function normalizeItems(items: ScenarioItemInput[]) {
  return items
    .map((item, index) => ({
      ...item,
      sortOrder: item.sortOrder ?? index * 10
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function buildBudgetSnapshot(budgetBasis: ScenarioBudgetBasis | undefined) {
  const hasAvailableBudget = typeof budgetBasis?.availableBudgetAmount === "number";
  const hasRangeBudget =
    hasRange(budgetBasis?.totalBudgetRange) || hasRange(budgetBasis?.cashOnHandRange);

  return {
    availableBudgetAmount: budgetBasis?.availableBudgetAmount,
    cashOnHandRange: budgetBasis?.cashOnHandRange,
    totalBudgetRange: budgetBasis?.totalBudgetRange,
    type: hasAvailableBudget ? "amount" : hasRangeBudget ? "range_only" : "none"
  } satisfies ScenarioInputSnapshot["budgetBasis"];
}

export function calculateScenario({
  budgetBasis,
  items,
  onboardingContext = {}
}: CalculateScenarioInput): ScenarioCalculation {
  const normalizedItems = normalizeItems(items);
  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + (item.frequency === "one_time" ? item.amount : 0),
    0
  );
  const monthlyAmount = normalizedItems.reduce(
    (sum, item) => sum + (item.frequency === "monthly" ? item.amount : 0),
    0
  );
  const budgetSnapshot = buildBudgetSnapshot(budgetBasis);
  const shortfallAmount =
    budgetSnapshot.type === "amount"
      ? Math.max(totalAmount - (budgetSnapshot.availableBudgetAmount ?? 0), 0)
      : null;
  const containsSampleValue = normalizedItems.some(
    (item) =>
      item.amountType === "sample" || (item.amountType === "admin_default" && !hasSource(item))
  );
  const flags: ScenarioRiskFlag[] = [];

  if (containsSampleValue) {
    flags.push({
      code: "sample_value_used",
      message: "샘플 항목이 포함되어 있어 실제 견적으로 바꿔야 합니다.",
      severity: "info"
    });
  }

  if (budgetSnapshot.type === "range_only") {
    flags.push({
      code: "budget_range_only",
      message: "예산 또는 보유 현금이 구간값뿐이라 정확한 부족 금액은 아직 계산하지 않습니다.",
      severity: "info"
    });
  }

  if (shortfallAmount !== null && shortfallAmount > 0) {
    flags.push({
      code: "shortfall_present",
      message: "예상 총액이 입력한 예산 기준보다 큽니다.",
      severity: "warning"
    });
  }

  if (normalizedItems.some((item) => item.isRequired && item.amount === 0)) {
    flags.push({
      code: "missing_required_item",
      message: "필수 항목 중 금액이 비어 있는 항목이 있습니다.",
      severity: "warning"
    });
  }

  if (monthlyAmount > 0) {
    flags.push({
      code: "monthly_amount_present",
      message: "월 고정 지출 항목은 별도로 확인해야 합니다.",
      severity: "info"
    });
  }

  if (
    onboardingContext.loanConsiderationStatus === "considering" ||
    onboardingContext.loanConsiderationStatus === "already_using"
  ) {
    flags.push({
      code: "loan_considered_needs_review",
      message: "대출을 고려 중인 경우 공식 조건이나 상담 자료 확인이 필요합니다.",
      severity: "info"
    });
  }

  if (normalizedItems.some((item) => item.amountType === "partner_price_snapshot")) {
    flags.push({
      code: "partner_price_snapshot_used",
      message: "파트너 가격 스냅샷은 유효기간 확인이 필요합니다.",
      severity: "info"
    });
  }

  const riskFlags = uniqueRiskFlags(flags);

  return {
    containsSampleValue,
    inputSnapshot: {
      budgetBasis: budgetSnapshot,
      calculationVersion: SCENARIO_CALCULATION_VERSION,
      items: normalizedItems,
      onboardingContext
    },
    monthlyAmount,
    riskFlags,
    shortfallAmount,
    totalAmount,
    warnings: riskFlags.map((flag) => flag.code)
  };
}
