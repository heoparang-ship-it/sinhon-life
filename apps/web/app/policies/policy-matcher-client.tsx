"use client";

import { useMemo, useState } from "react";
import {
  POLICIES,
  POLICY_CATEGORY_LABELS,
  POLICY_LEVEL_LABELS,
  type LifeStage,
  type Policy
} from "../lib/policies";

type ResidenceKey = "incheon" | "capital" | "nationwide" | "undecided";
type WeddingTimingKey = "engaged_soon" | "married_7y" | "newborn_2y" | "undecided";
type IncomeRangeKey = "under_50m" | "under_75m" | "under_85m" | "under_130m" | "over_130m" | "unknown";
type SelectionKey = keyof SelectionState;

type SelectionState = {
  incomeRange: IncomeRangeKey;
  residence: ResidenceKey;
  weddingTiming: WeddingTimingKey;
};

type Option<T extends string> = {
  helper: string;
  label: string;
  value: T;
};

type QuestionConfig<T extends SelectionKey> = {
  key: T;
  label: string;
  options: Array<Option<SelectionState[T]>>;
};

type EvaluatedPolicy = Policy & {
  missing: string[];
  matched: string[];
  score: number;
  status: MatchStatus;
  unknown: string[];
};

type MatchStatus = "strong" | "possible" | "need_more_info" | "low";

const residenceOptions: Array<Option<ResidenceKey>> = [
  { helper: "인천시·군구 정책까지 함께 봅니다.", label: "인천", value: "incheon" },
  { helper: "중앙 정책 중심으로 먼저 봅니다.", label: "서울·경기", value: "capital" },
  { helper: "전국 공통 정책부터 확인합니다.", label: "전국/이사 예정", value: "nationwide" },
  { helper: "지역 조건은 추가 확인으로 남깁니다.", label: "아직 미정", value: "undecided" }
];

const timingOptions: Array<Option<WeddingTimingKey>> = [
  { helper: "결혼예정자 대상 정책을 봅니다.", label: "3개월 내 결혼 예정", value: "engaged_soon" },
  { helper: "신혼부부 대상 정책을 우선 봅니다.", label: "혼인 7년 이내", value: "married_7y" },
  { helper: "출산·육아 연계 정책까지 봅니다.", label: "2년 내 출산", value: "newborn_2y" },
  { helper: "시기 조건은 추가 확인으로 남깁니다.", label: "아직 미정", value: "undecided" }
];

const incomeOptions: Array<Option<IncomeRangeKey>> = [
  { helper: "청년·보증료 기준까지 넓게 봅니다.", label: "5천만원 이하", value: "under_50m" },
  { helper: "신혼 보증료·보금자리론 기준을 봅니다.", label: "7천5백만원 이하", value: "under_75m" },
  { helper: "신혼 구입자금 기준까지 봅니다.", label: "8천5백만원 이하", value: "under_85m" },
  { helper: "신생아 특례 기준까지 봅니다.", label: "1억3천만원 이하", value: "under_130m" },
  { helper: "소득 제한 정책은 낮게 표시합니다.", label: "1억3천만원 초과", value: "over_130m" },
  { helper: "소득 조건은 추가 확인으로 남깁니다.", label: "아직 모름", value: "unknown" }
];

const questions: Array<QuestionConfig<SelectionKey>> = [
  { key: "residence", label: "거주지", options: residenceOptions },
  { key: "weddingTiming", label: "결혼 시기", options: timingOptions },
  { key: "incomeRange", label: "소득 구간", options: incomeOptions }
];

const initialSelection: SelectionState = {
  incomeRange: "under_85m",
  residence: "incheon",
  weddingTiming: "married_7y"
};

const statusLabels: Record<MatchStatus, string> = {
  low: "낮음",
  need_more_info: "확인 필요",
  possible: "검토 가능",
  strong: "우선 확인"
};

const incomeCeilings: Partial<Record<string, number>> = {
  "central-bogeumjari-newlywed-rate-cut": 70,
  "central-newborn-special-buteummok": 130,
  "central-newborn-special-didimdol": 130,
  "central-newlywed-home-purchase-fund": 85,
  "ic-jeonse-guarantee-fee": 75,
  "ic-youth-jeonse-interest": 50
};

const incomeValues: Record<IncomeRangeKey, number | null> = {
  over_130m: 999,
  under_130m: 130,
  under_50m: 50,
  under_75m: 75,
  under_85m: 85,
  unknown: null
};

function selectedStages(selection: SelectionState): LifeStage[] {
  if (selection.weddingTiming === "engaged_soon") return ["engaged"];
  if (selection.weddingTiming === "married_7y") return ["married", "renting", "buying"];
  if (selection.weddingTiming === "newborn_2y") return ["newborn", "married"];
  return [];
}

function optionLabel<T extends string>(options: Array<Option<T>>, value: T) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function selectedSummary(selection: SelectionState) {
  return [
    optionLabel(residenceOptions, selection.residence),
    optionLabel(timingOptions, selection.weddingTiming),
    optionLabel(incomeOptions, selection.incomeRange)
  ].join(" · ");
}

function evaluateResidence(policy: Policy, selection: SelectionState) {
  if (policy.level === "central") {
    return {
      matched: ["전국 공통 또는 중앙 정책이라 지역과 무관하게 먼저 확인할 수 있어요."],
      missing: [] as string[],
      score: 24,
      unknown: [] as string[]
    };
  }

  if (selection.residence === "incheon") {
    return {
      matched: [`${POLICY_LEVEL_LABELS[policy.level]} 정책이라 인천 거주 조건과 잘 맞아요.`],
      missing: [] as string[],
      score: 24,
      unknown: [] as string[]
    };
  }

  if (selection.residence === "undecided" || selection.residence === "nationwide") {
    return {
      matched: [] as string[],
      missing: [] as string[],
      score: 9,
      unknown: ["인천 거주 또는 전입 예정 여부를 확인해야 해요."]
    };
  }

  return {
    matched: [] as string[],
    missing: ["인천시 정책은 인천 거주·전입 조건이 붙을 수 있어요."],
    score: 0,
    unknown: [] as string[]
  };
}

function evaluateTiming(policy: Policy, selection: SelectionState) {
  const stages = selectedStages(selection);

  if (stages.some((stage) => policy.stages.includes(stage))) {
    return {
      matched: ["선택한 결혼·출산 시기와 정책 대상 단계가 겹쳐요."],
      missing: [] as string[],
      score: 34,
      unknown: [] as string[]
    };
  }

  if (selection.weddingTiming === "undecided") {
    return {
      matched: [] as string[],
      missing: [] as string[],
      score: 13,
      unknown: ["혼인신고일, 예식일, 출산일 중 기준일을 정하면 더 정확해져요."]
    };
  }

  return {
    matched: [] as string[],
    missing: ["이 정책은 현재 선택한 결혼·출산 시기와 우선 대상이 달라 보여요."],
    score: 0,
    unknown: [] as string[]
  };
}

function evaluateIncome(policy: Policy, selection: SelectionState) {
  const selectedIncome = incomeValues[selection.incomeRange];
  const ceiling = incomeCeilings[policy.id];

  if (!ceiling) {
    return {
      matched: [] as string[],
      missing: [] as string[],
      score: 16,
      unknown: ["이 정책은 모집공고별 소득·자산 기준을 따로 확인해야 해요."]
    };
  }

  if (selectedIncome === null) {
    return {
      matched: [] as string[],
      missing: [] as string[],
      score: 12,
      unknown: [`소득 기준은 ${ceiling.toLocaleString("ko-KR")}백만원 이하 여부를 확인하면 좋아요.`]
    };
  }

  if (selectedIncome <= ceiling) {
    return {
      matched: [`입력한 소득 구간이 ${ceiling.toLocaleString("ko-KR")}백만원 기준 안에 들어와요.`],
      missing: [] as string[],
      score: 24,
      unknown: [] as string[]
    };
  }

  return {
    matched: [] as string[],
    missing: [`소득 구간이 ${ceiling.toLocaleString("ko-KR")}백만원 기준을 넘을 수 있어요.`],
    score: 0,
    unknown: [] as string[]
  };
}

function evaluatePolicy(policy: Policy, selection: SelectionState): EvaluatedPolicy {
  const residence = evaluateResidence(policy, selection);
  const timing = evaluateTiming(policy, selection);
  const income = evaluateIncome(policy, selection);
  const sourceScore = policy.confidence === "확인" ? 18 : 8;
  const score = Math.min(100, residence.score + timing.score + income.score + sourceScore);
  const unknown = [...residence.unknown, ...timing.unknown, ...income.unknown];
  const missing = [...residence.missing, ...timing.missing, ...income.missing];
  const matched = [
    ...residence.matched,
    ...timing.matched,
    ...income.matched,
    `${policy.verifiedAt} 기준 공식 출처 확인 정책입니다.`
  ];
  const status: MatchStatus =
    score >= 78 && missing.length === 0
      ? "strong"
      : score >= 58
        ? "possible"
        : score >= 38 || unknown.length > 0
          ? "need_more_info"
          : "low";

  return {
    ...policy,
    matched,
    missing,
    score,
    status,
    unknown
  };
}

function OptionGroup<T extends SelectionKey>({
  label,
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
              <span>{option.label}</span>
              <small>{option.helper}</small>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function PolicyResultCard({ policy }: { policy: EvaluatedPolicy }) {
  const checkItems = policy.unknown.length ? policy.unknown : policy.missing;
  const eligibility = Object.entries(policy.eligibility).slice(0, 3);

  return (
    <article className={`talk-result-card ${policy.status}`}>
      <div className="talk-result-topline">
        <span>{POLICY_CATEGORY_LABELS[policy.category]}</span>
        <small>{POLICY_LEVEL_LABELS[policy.level]}</small>
      </div>
      <div className="talk-score-row">
        <strong>{statusLabels[policy.status]}</strong>
        <meter max={100} min={0} value={policy.score}>
          {policy.score}점
        </meter>
        <b>{policy.score}점</b>
      </div>
      <h3>{policy.name}</h3>
      <p>{policy.oneLiner}</p>

      <div className="talk-reason-grid">
        <section>
          <h4>맞는 이유</h4>
          <ul>
            {policy.matched.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>{checkItems.length ? "더 확인할 것" : "주요 기준"}</h4>
          <ul>
            {(checkItems.length ? checkItems : eligibility.map(([key, value]) => `${key}: ${String(value)}`))
              .slice(0, 3)
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </section>
      </div>

      <dl>
        <div>
          <dt>지원 내용</dt>
          <dd>{policy.amountOrRate}</dd>
        </div>
        <div>
          <dt>운영처</dt>
          <dd>{policy.applicationOrg}</dd>
        </div>
        <div>
          <dt>기간</dt>
          <dd>{policy.duration}</dd>
        </div>
      </dl>

      <a className="text-link" href={policy.sourceUrl} rel="noreferrer" target="_blank">
        공식 출처 보기
      </a>
    </article>
  );
}

export function PolicyMatcherClient() {
  const [selection, setSelection] = useState<SelectionState>(initialSelection);

  const evaluatedPolicies = useMemo(
    () =>
      POLICIES.map((policy) => evaluatePolicy(policy, selection)).sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko-KR")
      ),
    [selection]
  );

  const visiblePolicies = evaluatedPolicies.filter((policy) => policy.status !== "low").slice(0, 5);
  const topPolicy = evaluatedPolicies[0];
  const summary = selectedSummary(selection);
  const strongCount = evaluatedPolicies.filter((policy) => policy.status === "strong").length;
  const possibleCount = evaluatedPolicies.filter((policy) => policy.status === "possible").length;
  const needInfoCount = evaluatedPolicies.filter((policy) => policy.status === "need_more_info").length;

  return (
    <div className="policy-talk-layout refined">
      <section className="policy-talk-phone" aria-label="AI 정책 톡 대화">
        <div className="talk-header">
          <span>신혼생활</span>
          <strong>AI 정책 톡</strong>
        </div>

        <div className="talk-thread refined">
          <div className="talk-bubble bot">
            거주지, 결혼 시기, 소득 구간만으로 지금 먼저 볼 정책을 정리해드릴게요.
          </div>
          <div className="talk-bubble user">{summary}</div>
          <div className="talk-bubble bot">
            {topPolicy
              ? `가장 먼저 볼 정책은 '${topPolicy.name}'입니다. 현재 ${topPolicy.score}점, ${statusLabels[topPolicy.status]} 단계예요.`
              : "조건을 선택하면 정책을 바로 정리해드릴게요."}
          </div>

          <section className="talk-insight-panel" aria-label="정책 요약">
            <div>
              <span>우선 확인</span>
              <strong>{strongCount}개</strong>
            </div>
            <div>
              <span>검토 가능</span>
              <strong>{possibleCount}개</strong>
            </div>
            <div>
              <span>확인 필요</span>
              <strong>{needInfoCount}개</strong>
            </div>
          </section>

          <div className="talk-result-stack">
            {(visiblePolicies.length ? visiblePolicies : evaluatedPolicies.slice(0, 3)).map((policy) => (
              <PolicyResultCard key={policy.id} policy={policy} />
            ))}
          </div>
        </div>
      </section>

      <section className="policy-selector-panel refined" aria-label="정책 조건 선택">
        <div className="talk-step-copy">
          <strong>조건 선택</strong>
          <p>로그인 없이 브라우저 안에서만 계산합니다. 지금 단계는 AI 없는 정적 룰베이스입니다.</p>
        </div>

        {questions.map((question) => (
          <OptionGroup
            key={question.key}
            label={question.label}
            onChange={(value) => setSelection((current) => ({ ...current, [question.key]: value }))}
            options={question.options}
            value={selection[question.key]}
          />
        ))}

        <section className="talk-presets" aria-label="빠른 시나리오">
          <h3>빠른 선택</h3>
          <div>
            <button
              onClick={() =>
                setSelection({
                  incomeRange: "under_85m",
                  residence: "incheon",
                  weddingTiming: "married_7y"
                })
              }
              type="button"
            >
              <strong>인천 신혼</strong>
              <span>전월세·대출 정책 우선</span>
            </button>
            <button
              onClick={() =>
                setSelection({
                  incomeRange: "under_130m",
                  residence: "incheon",
                  weddingTiming: "newborn_2y"
                })
              }
              type="button"
            >
              <strong>출산 가구</strong>
              <span>신생아 특례·육아 지원</span>
            </button>
            <button
              onClick={() =>
                setSelection({
                  incomeRange: "unknown",
                  residence: "nationwide",
                  weddingTiming: "engaged_soon"
                })
              }
              type="button"
            >
              <strong>결혼 예정</strong>
              <span>중앙 정책부터 확인</span>
            </button>
          </div>
        </section>

        <p className="talk-note">
          실제 신청 가능 여부는 접수 기간, 혼인신고일, 자산 기준, 세대주 여부에 따라 달라질 수 있습니다.
        </p>
      </section>
    </div>
  );
}
