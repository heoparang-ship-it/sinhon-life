"use client";

import { useMemo, useState } from "react";

type ResidenceKey = "seoul" | "gyeonggi" | "incheon" | "nationwide";
type WeddingTimingKey = "first_half_2026" | "second_half_2026" | "year_2027" | "undecided";
type IncomeRangeKey = "under_50m" | "50m_100m" | "over_100m" | "unknown";
type HousingTypeKey = "rental_jeonse" | "monthly_rent" | "owned" | "family_home" | "undecided";
type MoveInTimingKey = "before_wedding" | "within_6m" | "within_12m" | "undecided";
type WeddingStyleKey = "small" | "standard" | "family_only" | "undecided";
type ChildrenPlanKey = "planning" | "undecided" | "not_now";

type SelectionState = {
  childrenPlan: ChildrenPlanKey;
  housingType: HousingTypeKey;
  incomeRange: IncomeRangeKey;
  moveInTiming: MoveInTimingKey;
  residence: ResidenceKey;
  weddingStyle: WeddingStyleKey;
  weddingTiming: WeddingTimingKey;
};

type SelectionKey = keyof SelectionState;

type Option<T extends string> = {
  label: string;
  shortLabel: string;
  value: T;
};

type Condition = {
  id: string;
  label: string;
  matchedText: string;
  missingText: string;
  pass: (selection: SelectionState) => boolean;
  unknown?: (selection: SelectionState) => boolean;
  weight: number;
};

type PolicyRule = {
  category: string;
  documents: string[];
  id: string;
  nextActions: string[];
  name: string;
  providerName: string;
  region: string;
  sourceUrl: string;
  summary: string;
  timeline: string;
  conditions: Condition[];
};

type EvaluatedPolicy = PolicyRule & {
  missing: string[];
  matched: string[];
  score: number;
  status: MatchStatus;
  unknownCount: number;
};

type MatchStatus = "strong" | "possible" | "need_more_info" | "low";

type QuestionConfig<T extends SelectionKey> = {
  helper: string;
  key: T;
  label: string;
  options: Array<Option<SelectionState[T]>>;
};

type QuestionStep = {
  description: string;
  id: "basic" | "housing" | "wedding" | "result";
  title: string;
  questions: Array<QuestionConfig<SelectionKey>>;
};

const residenceOptions: Array<Option<ResidenceKey>> = [
  { label: "서울", shortLabel: "서울", value: "seoul" },
  { label: "경기", shortLabel: "경기", value: "gyeonggi" },
  { label: "인천", shortLabel: "인천", value: "incheon" },
  { label: "전국/아직 미정", shortLabel: "전국/미정", value: "nationwide" }
];

const timingOptions: Array<Option<WeddingTimingKey>> = [
  { label: "2026년 상반기", shortLabel: "2026 상반기", value: "first_half_2026" },
  { label: "2026년 하반기", shortLabel: "2026 하반기", value: "second_half_2026" },
  { label: "2027년", shortLabel: "2027년", value: "year_2027" },
  { label: "아직 미정", shortLabel: "미정", value: "undecided" }
];

const incomeOptions: Array<Option<IncomeRangeKey>> = [
  { label: "5천만원 미만", shortLabel: "5천 미만", value: "under_50m" },
  { label: "5천만원-1억원", shortLabel: "5천-1억", value: "50m_100m" },
  { label: "1억원 초과", shortLabel: "1억 초과", value: "over_100m" },
  { label: "아직 모르겠음", shortLabel: "미정", value: "unknown" }
];

const housingOptions: Array<Option<HousingTypeKey>> = [
  { label: "전세 준비", shortLabel: "전세", value: "rental_jeonse" },
  { label: "월세 준비", shortLabel: "월세", value: "monthly_rent" },
  { label: "자가/매매", shortLabel: "자가", value: "owned" },
  { label: "가족 집 거주", shortLabel: "가족 집", value: "family_home" },
  { label: "아직 미정", shortLabel: "미정", value: "undecided" }
];

const moveInOptions: Array<Option<MoveInTimingKey>> = [
  { label: "예식 전 입주", shortLabel: "예식 전", value: "before_wedding" },
  { label: "예식 후 6개월 안", shortLabel: "6개월 안", value: "within_6m" },
  { label: "예식 후 1년 안", shortLabel: "1년 안", value: "within_12m" },
  { label: "아직 미정", shortLabel: "미정", value: "undecided" }
];

const weddingStyleOptions: Array<Option<WeddingStyleKey>> = [
  { label: "소규모 예식", shortLabel: "소규모", value: "small" },
  { label: "일반 예식", shortLabel: "일반", value: "standard" },
  { label: "가족 예식", shortLabel: "가족", value: "family_only" },
  { label: "아직 미정", shortLabel: "미정", value: "undecided" }
];

const childrenPlanOptions: Array<Option<ChildrenPlanKey>> = [
  { label: "계획 있음", shortLabel: "계획 있음", value: "planning" },
  { label: "아직 미정", shortLabel: "미정", value: "undecided" },
  { label: "당장은 없음", shortLabel: "당장은 없음", value: "not_now" }
];

const questionSteps: QuestionStep[] = [
  {
    description: "정책에서 가장 자주 보는 기본 조건입니다.",
    id: "basic",
    title: "기본 조건",
    questions: [
      { helper: "신청 기관이 지역을 먼저 나누는 경우가 많아요.", key: "residence", label: "거주지", options: residenceOptions },
      { helper: "접수 기간과 사업연도 판단에 필요합니다.", key: "weddingTiming", label: "결혼 시기", options: timingOptions },
      { helper: "정확한 금액 대신 구간만 사용합니다.", key: "incomeRange", label: "소득 구간", options: incomeOptions }
    ]
  },
  {
    description: "주거·입주 관련 정책을 더 정확하게 가릅니다.",
    id: "housing",
    title: "주거 조건",
    questions: [
      { helper: "전월세, 자가, 가족 집 여부가 주거 지원 판단에 영향을 줍니다.", key: "housingType", label: "주거 형태", options: housingOptions },
      { helper: "이사비·입주 지원은 일정 기간 안 입주 여부를 봅니다.", key: "moveInTiming", label: "입주 시점", options: moveInOptions }
    ]
  },
  {
    description: "예식·가족 준비 정책까지 함께 살핍니다.",
    id: "wedding",
    title: "예식·가족",
    questions: [
      { helper: "바우처류 정책은 예식 형태를 조건으로 두는 경우가 있습니다.", key: "weddingStyle", label: "예식 형태", options: weddingStyleOptions },
      { helper: "가족센터 상담·출산 준비 지원과 연결될 수 있습니다.", key: "childrenPlan", label: "자녀 계획", options: childrenPlanOptions }
    ]
  },
  {
    description: "맞는 이유와 부족 조건을 정책별로 정리합니다.",
    id: "result",
    title: "결과 확인",
    questions: []
  }
];

const initialSelection: SelectionState = {
  childrenPlan: "undecided",
  housingType: "rental_jeonse",
  incomeRange: "50m_100m",
  moveInTiming: "within_12m",
  residence: "seoul",
  weddingStyle: "small",
  weddingTiming: "second_half_2026"
};

const scenarioPresets: Array<{
  label: string;
  description: string;
  selection: SelectionState;
}> = [
  {
    label: "서울 전세 준비",
    description: "주거 지원부터 가장 먼저 확인",
    selection: initialSelection
  },
  {
    label: "인천 예식 준비",
    description: "예식·입주 정책 중심",
    selection: {
      childrenPlan: "undecided",
      housingType: "undecided",
      incomeRange: "over_100m",
      moveInTiming: "within_6m",
      residence: "incheon",
      weddingStyle: "standard",
      weddingTiming: "second_half_2026"
    }
  },
  {
    label: "전국 입주 예정",
    description: "이사비·가전·상담 넓게 확인",
    selection: {
      childrenPlan: "planning",
      housingType: "monthly_rent",
      incomeRange: "unknown",
      moveInTiming: "within_12m",
      residence: "nationwide",
      weddingStyle: "undecided",
      weddingTiming: "year_2027"
    }
  }
];

const projectTimingSet = new Set<WeddingTimingKey>([
  "first_half_2026",
  "second_half_2026",
  "year_2027"
]);

const moderateIncomeSet = new Set<IncomeRangeKey>(["under_50m", "50m_100m"]);
const capitalRegionSet = new Set<ResidenceKey>(["seoul", "gyeonggi", "incheon"]);
const weddingStyleSet = new Set<WeddingStyleKey>(["small", "standard", "family_only"]);

const policyRules: PolicyRule[] = [
  {
    category: "주거",
    conditions: [
      {
        id: "housing-seoul",
        label: "거주 지역",
        matchedText: "희망 거주지가 서울입니다.",
        missingText: "서울 거주 또는 서울 전입 계획인지 확인이 필요합니다.",
        pass: (selection) => selection.residence === "seoul",
        unknown: (selection) => selection.residence === "nationwide",
        weight: 35
      },
      {
        id: "housing-rental",
        label: "주거 형태",
        matchedText: "전세 또는 월세 준비로 주거 지원 검토 대상에 가깝습니다.",
        missingText: "전세·월세 준비 여부가 맞는지 확인해야 합니다.",
        pass: (selection) => selection.housingType === "rental_jeonse" || selection.housingType === "monthly_rent",
        unknown: (selection) => selection.housingType === "undecided",
        weight: 30
      },
      {
        id: "housing-income",
        label: "소득 구간",
        matchedText: "소득 구간이 샘플 주거 지원 범위에 들어갑니다.",
        missingText: "소득 구간이 초과될 수 있어 세부 기준 확인이 필요합니다.",
        pass: (selection) => moderateIncomeSet.has(selection.incomeRange),
        unknown: (selection) => selection.incomeRange === "unknown",
        weight: 25
      },
      {
        id: "housing-timing",
        label: "결혼 시기",
        matchedText: "2026-2027년 준비 일정으로 사업 기간 확인 대상입니다.",
        missingText: "결혼 또는 입주 일정이 정해지면 더 정확해집니다.",
        pass: (selection) => projectTimingSet.has(selection.weddingTiming),
        unknown: (selection) => selection.weddingTiming === "undecided",
        weight: 10
      }
    ],
    documents: ["임대차계약서", "가족관계증명서", "소득 확인 자료"],
    id: "newlywed-housing-seoul",
    name: "서울 신혼 주거 준비 지원 샘플",
    nextActions: ["주소지 기준 공고 확인", "임대차계약서 준비 여부 확인", "부부 합산 소득 기준 확인"],
    providerName: "샘플시 주거정책과",
    region: "서울",
    sourceUrl: "https://example.com/sample-policies/newlywed-housing",
    summary: "서울 거주 또는 전입 예정 신혼 커플의 전월세 주거 준비 조건을 확인합니다.",
    timeline: "입주 전 또는 계약 직후 확인"
  },
  {
    category: "예식",
    conditions: [
      {
        id: "wedding-region",
        label: "예식·생활권",
        matchedText: "수도권 생활권으로 예식 바우처 샘플 지역과 가깝습니다.",
        missingText: "수도권 예식 또는 생활권인지 확인이 필요합니다.",
        pass: (selection) => capitalRegionSet.has(selection.residence),
        unknown: (selection) => selection.residence === "nationwide",
        weight: 30
      },
      {
        id: "wedding-window",
        label: "결혼 시기",
        matchedText: "2026-2027년 예식 일정으로 사업 기간 안에 있습니다.",
        missingText: "예식 시기가 정해지면 접수 가능 기간을 가를 수 있습니다.",
        pass: (selection) => projectTimingSet.has(selection.weddingTiming),
        unknown: (selection) => selection.weddingTiming === "undecided",
        weight: 30
      },
      {
        id: "wedding-style",
        label: "예식 형태",
        matchedText: "소규모·일반·가족 예식 중 하나로 샘플 조건과 맞습니다.",
        missingText: "예식 형태가 정해지면 바우처 조건을 더 정확히 볼 수 있습니다.",
        pass: (selection) => weddingStyleSet.has(selection.weddingStyle),
        unknown: (selection) => selection.weddingStyle === "undecided",
        weight: 25
      },
      {
        id: "wedding-income",
        label: "소득 확인",
        matchedText: "소득 구간을 입력해 우선순위 판단이 가능합니다.",
        missingText: "소득 기준이 별도로 붙을 수 있어 공고 확인이 필요합니다.",
        pass: (selection) => selection.incomeRange !== "unknown",
        unknown: (selection) => selection.incomeRange === "unknown",
        weight: 15
      }
    ],
    documents: ["예식 계약서", "견적서", "혼인 예정 확인 자료"],
    id: "capital-wedding-voucher",
    name: "수도권 예식 준비 바우처 샘플",
    nextActions: ["예식일 확정 여부 확인", "계약서·견적서 보관", "거주지 또는 예식장 소재지 기준 확인"],
    providerName: "샘플 광역지원센터",
    region: "수도권",
    sourceUrl: "https://example.com/sample-policies/wedding-voucher",
    summary: "수도권에서 예식을 준비하는 커플의 예식 비용 바우처 가능성을 확인합니다.",
    timeline: "계약 전후, 접수 시작 전 확인"
  },
  {
    category: "입주",
    conditions: [
      {
        id: "moving-window",
        label: "입주 시점",
        matchedText: "예식 전후 1년 안 입주 계획으로 이사비 샘플 기간과 맞습니다.",
        missingText: "입주 예정월을 정하면 이사비 조건을 더 정확히 볼 수 있습니다.",
        pass: (selection) => selection.moveInTiming !== "undecided",
        unknown: (selection) => selection.moveInTiming === "undecided",
        weight: 35
      },
      {
        id: "moving-wedding-window",
        label: "결혼 시기",
        matchedText: "2026-2027년 결혼 준비 흐름에 들어갑니다.",
        missingText: "결혼 또는 혼인신고 기준일 확인이 필요합니다.",
        pass: (selection) => projectTimingSet.has(selection.weddingTiming),
        unknown: (selection) => selection.weddingTiming === "undecided",
        weight: 25
      },
      {
        id: "moving-cash",
        label: "소득 구간",
        matchedText: "소득 구간이 입력되어 우선 검토가 가능합니다.",
        missingText: "소득 구간 미정이면 소득 제한 정책에서 추가 확인이 필요합니다.",
        pass: (selection) => selection.incomeRange !== "unknown",
        unknown: (selection) => selection.incomeRange === "unknown",
        weight: 20
      },
      {
        id: "moving-region",
        label: "지역",
        matchedText: "전국 단위 샘플이라 현재 지역에서도 우선 확인 가능합니다.",
        missingText: "세부 지자체 공고가 따로 있는지 확인하세요.",
        pass: () => true,
        weight: 20
      }
    ],
    documents: ["입주 예정 확인 자료", "주소 확인 서류", "이사 견적서"],
    id: "move-in-support",
    name: "입주 준비 이사비 지원 샘플",
    nextActions: ["입주 예정월 정리", "주소 이전 계획 확인", "이사 견적서 또는 계약 자료 보관"],
    providerName: "샘플 생활지원과",
    region: "전국",
    sourceUrl: "https://example.com/sample-policies/moving-support",
    summary: "입주 준비 과정에서 발생하는 이사비·주소 이전 관련 지원 가능성을 확인합니다.",
    timeline: "입주 예정 1-3개월 전 확인"
  },
  {
    category: "가전",
    conditions: [
      {
        id: "appliance-housing",
        label: "독립 주거",
        matchedText: "가족 집이 아닌 독립 주거 준비로 가전 구매 필요성이 있습니다.",
        missingText: "가족 집 거주면 가전 구매 지원 우선순위가 낮을 수 있습니다.",
        pass: (selection) => selection.housingType !== "family_home",
        unknown: (selection) => selection.housingType === "undecided",
        weight: 30
      },
      {
        id: "appliance-income",
        label: "소득 구간",
        matchedText: "소득 구간이 샘플 가전 지원 범위에 들어갑니다.",
        missingText: "소득 구간 초과 가능성이 있어 공고 기준 확인이 필요합니다.",
        pass: (selection) => moderateIncomeSet.has(selection.incomeRange),
        unknown: (selection) => selection.incomeRange === "unknown",
        weight: 35
      },
      {
        id: "appliance-move",
        label: "입주 계획",
        matchedText: "입주 계획이 있어 가전 구매 시점과 연결됩니다.",
        missingText: "입주 시점이 정해지면 구매 지원 검토가 쉬워집니다.",
        pass: (selection) => selection.moveInTiming !== "undecided",
        unknown: (selection) => selection.moveInTiming === "undecided",
        weight: 20
      },
      {
        id: "appliance-timing",
        label: "결혼 시기",
        matchedText: "결혼 준비 일정이 사업 기간 확인 대상입니다.",
        missingText: "결혼 시기 미정이면 신청 시점 산정이 어려울 수 있습니다.",
        pass: (selection) => projectTimingSet.has(selection.weddingTiming),
        unknown: (selection) => selection.weddingTiming === "undecided",
        weight: 15
      }
    ],
    documents: ["구매 견적서", "주거 확인 자료", "소득 확인 자료"],
    id: "appliance-support",
    name: "신혼 가전 구매 지원 샘플",
    nextActions: ["필수 구매 품목 정리", "견적서 보관", "입주일과 구매일 기준 확인"],
    providerName: "샘플 소비생활센터",
    region: "전국",
    sourceUrl: "https://example.com/sample-policies/appliance-support",
    summary: "입주 전 가전 구매를 준비하는 신혼 커플의 지원 가능성을 확인합니다.",
    timeline: "구매 전 견적 단계에서 확인"
  },
  {
    category: "가족",
    conditions: [
      {
        id: "family-plan",
        label: "가족 계획",
        matchedText: "자녀 계획이 있거나 아직 결정 전이라 상담 지원과 연결됩니다.",
        missingText: "당장 자녀 계획이 없다면 가족 계획 상담 우선순위는 낮을 수 있습니다.",
        pass: (selection) => selection.childrenPlan === "planning" || selection.childrenPlan === "undecided",
        weight: 35
      },
      {
        id: "family-window",
        label: "결혼 시기",
        matchedText: "신혼 초기 상담 지원을 확인하기 좋은 시기입니다.",
        missingText: "결혼 시기 미정이어도 상담형 정책은 넓게 확인할 수 있습니다.",
        pass: (selection) => selection.weddingTiming === "undecided" || projectTimingSet.has(selection.weddingTiming),
        weight: 25
      },
      {
        id: "family-region",
        label: "지역",
        matchedText: "가족센터형 지원은 지역별 창구 확인이 가능합니다.",
        missingText: "거주지 가족센터 창구를 확인하세요.",
        pass: () => true,
        weight: 20
      },
      {
        id: "family-income",
        label: "소득 기준",
        matchedText: "상담형 정책은 소득과 무관하게 열려 있는 경우가 많습니다.",
        missingText: "현금성 지원으로 이어지면 소득 기준을 다시 확인하세요.",
        pass: () => true,
        weight: 20
      }
    ],
    documents: ["혼인 또는 예식 계획 확인서", "가족 계획 체크리스트"],
    id: "family-planning",
    name: "신혼 가족 준비 상담 지원 샘플",
    nextActions: ["거주지 가족센터 운영 시간 확인", "상담 목적 정리", "혼인 또는 예식 계획 자료 준비"],
    providerName: "샘플 가족센터",
    region: "전국",
    sourceUrl: "https://example.com/sample-policies/family-planning",
    summary: "신혼 초기 가족 계획과 생활 적응 상담 지원 가능성을 확인합니다.",
    timeline: "결혼 전후 언제든 확인"
  }
];

const statusLabels: Record<MatchStatus, string> = {
  low: "낮음",
  need_more_info: "정보 필요",
  possible: "검토 가능",
  strong: "우선 확인"
};

function getLabel<T extends string>(options: Array<Option<T>>, value: T) {
  return options.find((option) => option.value === value)?.shortLabel ?? value;
}

function getSelectedSummary(selection: SelectionState) {
  return [
    getLabel(residenceOptions, selection.residence),
    getLabel(timingOptions, selection.weddingTiming),
    getLabel(incomeOptions, selection.incomeRange),
    getLabel(housingOptions, selection.housingType),
    getLabel(moveInOptions, selection.moveInTiming),
    getLabel(weddingStyleOptions, selection.weddingStyle),
    getLabel(childrenPlanOptions, selection.childrenPlan)
  ].join(" · ");
}

function evaluatePolicy(policy: PolicyRule, selection: SelectionState): EvaluatedPolicy {
  const totalWeight = policy.conditions.reduce((sum, condition) => sum + condition.weight, 0);
  let score = 0;
  let unknownCount = 0;
  const matched: string[] = [];
  const missing: string[] = [];

  for (const condition of policy.conditions) {
    if (condition.pass(selection)) {
      score += condition.weight;
      matched.push(condition.matchedText);
      continue;
    }

    if (condition.unknown?.(selection)) {
      score += Math.round(condition.weight * 0.45);
      unknownCount += 1;
    }

    missing.push(condition.missingText);
  }

  const normalizedScore = Math.round((score / totalWeight) * 100);
  const status: MatchStatus =
    unknownCount >= 2
      ? "need_more_info"
      : normalizedScore >= 82
        ? "strong"
        : normalizedScore >= 62
          ? "possible"
          : normalizedScore >= 42
            ? "need_more_info"
            : "low";

  return {
    ...policy,
    matched,
    missing,
    score: normalizedScore,
    status,
    unknownCount
  };
}

function updateSelection<T extends SelectionKey>(
  current: SelectionState,
  key: T,
  value: SelectionState[T]
): SelectionState {
  return {
    ...current,
    [key]: value
  };
}

function OptionGroup<T extends SelectionKey>({
  label,
  helper,
  onChange,
  options,
  value
}: QuestionConfig<T> & {
  onChange: (value: SelectionState[T]) => void;
  value: SelectionState[T];
}) {
  return (
    <fieldset className="talk-option-group">
      <legend>{label}</legend>
      <p>{helper}</p>
      <div className="talk-option-row">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              aria-pressed={isActive}
              className={isActive ? "talk-chip active" : "talk-chip"}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function PolicyResultCard({ policy }: { policy: EvaluatedPolicy }) {
  const firstMissingItems = policy.missing.slice(0, 3);

  return (
    <article className={`talk-result-card ${policy.status}`} key={policy.id}>
      <div className="talk-result-topline">
        <span>{policy.category}</span>
        <small>{policy.region}</small>
      </div>
      <div className="talk-score-row">
        <strong>{statusLabels[policy.status]}</strong>
        <meter max={100} min={0} value={policy.score}>
          {policy.score}점
        </meter>
        <b>{policy.score}점</b>
      </div>
      <h2>{policy.name}</h2>
      <p>{policy.summary}</p>

      <div className="talk-reason-grid">
        <section>
          <h3>맞는 이유</h3>
          <ul>
            {policy.matched.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>{firstMissingItems.length ? "더 확인할 것" : "바로 다음 단계"}</h3>
          <ul>
            {(firstMissingItems.length ? firstMissingItems : policy.nextActions.slice(0, 2)).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <dl>
        <div>
          <dt>운영처</dt>
          <dd>{policy.providerName}</dd>
        </div>
        <div>
          <dt>확인 시점</dt>
          <dd>{policy.timeline}</dd>
        </div>
        <div>
          <dt>준비 서류</dt>
          <dd>{policy.documents.join(", ")}</dd>
        </div>
      </dl>

      <div className="talk-next-actions">
        {policy.nextActions.map((action) => (
          <span key={action}>{action}</span>
        ))}
      </div>

      <a className="text-link" href={policy.sourceUrl} rel="noreferrer" target="_blank">
        출처 보기
      </a>
    </article>
  );
}

export function PolicyMatcherClient() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selection, setSelection] = useState<SelectionState>(initialSelection);

  const evaluatedPolicies = useMemo(
    () =>
      policyRules
        .map((policy) => evaluatePolicy(policy, selection))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko-KR")),
    [selection]
  );

  const priorityPolicies = evaluatedPolicies.filter((policy) => policy.status !== "low");
  const topPolicy = evaluatedPolicies[0];
  const currentStep = questionSteps[activeStepIndex] ?? questionSteps[0]!;
  const isResultStep = currentStep.id === "result";
  const selectedSummary = getSelectedSummary(selection);

  return (
    <div className="policy-talk-layout refined">
      <section className="policy-talk-phone" aria-label="정책 톡 대화">
        <div className="talk-header">
          <span>신혼생활</span>
          <strong>정책 톡</strong>
        </div>

        <div className="talk-thread refined">
          <div className="talk-bubble bot">
            질문을 조금 더 쪼개서 볼게요. 정책마다 점수를 매기고, 맞는 이유와 부족 조건을 따로
            알려드릴게요.
          </div>
          <div className="talk-bubble user">{selectedSummary}</div>
          <div className="talk-bubble bot">
            {topPolicy
              ? `가장 먼저 볼 정책은 '${topPolicy.name}'입니다. 현재 ${topPolicy.score}점, ${statusLabels[topPolicy.status]} 단계예요.`
              : "아직 판단할 정책이 없습니다. 조건을 하나씩 선택해 주세요."}
          </div>

          <section className="talk-insight-panel" aria-label="정책 요약">
            <div>
              <span>우선 확인</span>
              <strong>{evaluatedPolicies.filter((policy) => policy.status === "strong").length}개</strong>
            </div>
            <div>
              <span>검토 가능</span>
              <strong>{evaluatedPolicies.filter((policy) => policy.status === "possible").length}개</strong>
            </div>
            <div>
              <span>정보 필요</span>
              <strong>{evaluatedPolicies.filter((policy) => policy.status === "need_more_info").length}개</strong>
            </div>
          </section>

          <div className="talk-result-stack">
            {(priorityPolicies.length ? priorityPolicies : evaluatedPolicies).map((policy) => (
              <PolicyResultCard key={policy.id} policy={policy} />
            ))}
          </div>
        </div>
      </section>

      <section className="policy-selector-panel refined" aria-label="정책 조건 선택">
        <div className="talk-stepper" aria-label="정책 톡 단계">
          {questionSteps.map((step, index) => (
            <button
              aria-current={index === activeStepIndex ? "step" : undefined}
              className={index === activeStepIndex ? "active" : ""}
              key={step.id}
              onClick={() => setActiveStepIndex(index)}
              type="button"
            >
              <span>{index + 1}</span>
              {step.title}
            </button>
          ))}
        </div>

        <div className="talk-step-copy">
          <strong>{currentStep.title}</strong>
          <p>{currentStep.description}</p>
        </div>

        {currentStep.questions.length ? (
          currentStep.questions.map((question) => (
            <OptionGroup
              helper={question.helper}
              key={question.key}
              label={question.label}
              onChange={(value) =>
                setSelection((current) => updateSelection(current, question.key, value))
              }
              options={question.options}
              value={selection[question.key]}
            />
          ))
        ) : (
          <div className="talk-result-summary-panel">
            <strong>결과 요약</strong>
            <p>
              {priorityPolicies.length
                ? `${priorityPolicies.length}개 정책을 우선 확인하세요. 점수가 높을수록 입력 조건과 많이 맞습니다.`
                : "우선 확인할 정책이 적습니다. 미정 항목을 줄이면 결과가 더 선명해집니다."}
            </p>
          </div>
        )}

        <div className="talk-panel-actions">
          <button
            className="talk-nav-button secondary"
            disabled={activeStepIndex === 0}
            onClick={() => setActiveStepIndex((index) => Math.max(0, index - 1))}
            type="button"
          >
            이전
          </button>
          <button
            className="talk-nav-button"
            onClick={() =>
              setActiveStepIndex((index) => Math.min(questionSteps.length - 1, index + 1))
            }
            type="button"
          >
            {isResultStep ? "결과 유지" : "다음"}
          </button>
        </div>

        <section className="talk-presets" aria-label="빠른 시나리오">
          <h2>빠른 시나리오</h2>
          <div>
            {scenarioPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setSelection(preset.selection);
                  setActiveStepIndex(questionSteps.length - 1);
                }}
                type="button"
              >
                <strong>{preset.label}</strong>
                <span>{preset.description}</span>
              </button>
            ))}
          </div>
        </section>

        <p className="talk-note">
          AI 없이 동작하는 룰베이스 안내입니다. 실제 신청 전에는 공식 공고의 접수 기간, 소득·자산
          산정 방식, 거주지 기준을 함께 확인하세요.
        </p>
      </section>
    </div>
  );
}
