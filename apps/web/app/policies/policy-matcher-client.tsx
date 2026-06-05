"use client";

import { useMemo, useState } from "react";

type ResidenceKey = "seoul" | "gyeonggi" | "incheon" | "nationwide";
type WeddingTimingKey = "first_half_2026" | "second_half_2026" | "year_2027" | "undecided";
type IncomeRangeKey = "under_50m" | "50m_100m" | "over_100m" | "unknown";

type SelectionState = {
  residence: ResidenceKey;
  weddingTiming: WeddingTimingKey;
  incomeRange: IncomeRangeKey;
};

type Option<T extends string> = {
  label: string;
  shortLabel: string;
  value: T;
};

type PolicyRule = {
  category: string;
  documents: string[];
  match: (selection: SelectionState) => boolean;
  name: string;
  providerName: string;
  reason: (selection: SelectionState) => string;
  region: string;
  sourceUrl: string;
  summary: string;
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

const timingMatchesProjectWindow = (timing: WeddingTimingKey) =>
  timing === "first_half_2026" || timing === "second_half_2026" || timing === "year_2027";

const hasModerateIncome = (incomeRange: IncomeRangeKey) =>
  incomeRange === "under_50m" || incomeRange === "50m_100m" || incomeRange === "unknown";

const policyRules: PolicyRule[] = [
  {
    category: "주거",
    documents: ["임대차계약서", "가족관계증명서"],
    match: (selection) => selection.residence === "seoul" && hasModerateIncome(selection.incomeRange),
    name: "서울 신혼 주거 준비 지원 샘플",
    providerName: "샘플시 주거정책과",
    reason: (selection) =>
      selection.residence === "seoul"
        ? "서울 거주 준비 조건과 소득 구간이 주거 지원 샘플 범위에 들어갑니다."
        : "서울 거주 준비 가구를 우선 보는 샘플 정책입니다.",
    region: "서울",
    sourceUrl: "https://example.com/sample-policies/newlywed-housing",
    summary: "신혼 커플의 서울 주거 준비 조건을 확인하는 샘플 정책입니다."
  },
  {
    category: "예식",
    documents: ["예식 계약서", "견적서"],
    match: (selection) =>
      (selection.residence === "seoul" ||
        selection.residence === "gyeonggi" ||
        selection.residence === "incheon") &&
      timingMatchesProjectWindow(selection.weddingTiming),
    name: "수도권 예식 준비 바우처 샘플",
    providerName: "샘플 광역지원센터",
    reason: () => "수도권 준비와 2026-2027년 결혼 시기가 예식 바우처 샘플 조건과 가깝습니다.",
    region: "수도권",
    sourceUrl: "https://example.com/sample-policies/wedding-voucher",
    summary: "예식 준비 비용 일부를 확인하는 샘플 정책입니다."
  },
  {
    category: "입주",
    documents: ["입주 예정 확인 자료", "주소 확인 서류"],
    match: (selection) => timingMatchesProjectWindow(selection.weddingTiming),
    name: "입주 준비 이사비 지원 샘플",
    providerName: "샘플 생활지원과",
    reason: () => "결혼 또는 입주 준비 시기가 2026-2027년 샘플 사업 기간 안에 있습니다.",
    region: "전국",
    sourceUrl: "https://example.com/sample-policies/moving-support",
    summary: "입주 준비 과정의 이사비 조건을 확인하는 샘플 정책입니다."
  },
  {
    category: "가전",
    documents: ["구매 견적서", "주거 확인 자료"],
    match: (selection) => hasModerateIncome(selection.incomeRange),
    name: "신혼 가전 구매 지원 샘플",
    providerName: "샘플 소비생활센터",
    reason: () => "소득 구간이 입주 전 가전 구매 지원 샘플의 확인 대상에 포함됩니다.",
    region: "전국",
    sourceUrl: "https://example.com/sample-policies/appliance-support",
    summary: "입주 전 가전 구매 준비 조건을 확인하는 샘플 정책입니다."
  },
  {
    category: "가족",
    documents: ["혼인 또는 예식 계획 확인서", "가족 계획 체크리스트"],
    match: (selection) =>
      selection.weddingTiming === "undecided" || timingMatchesProjectWindow(selection.weddingTiming),
    name: "신혼 가족 준비 상담 지원 샘플",
    providerName: "샘플 가족센터",
    reason: () => "결혼 준비 전후 상담이 필요한 커플을 넓게 보는 샘플 정책입니다.",
    region: "전국",
    sourceUrl: "https://example.com/sample-policies/family-planning",
    summary: "신혼 초기 가족 계획 상담 조건을 확인하는 샘플 정책입니다."
  }
];

const initialSelection: SelectionState = {
  residence: "seoul",
  weddingTiming: "second_half_2026",
  incomeRange: "50m_100m"
};

function getLabel<T extends string>(options: Array<Option<T>>, value: T) {
  return options.find((option) => option.value === value)?.shortLabel ?? value;
}

function OptionGroup<T extends string>({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: T) => void;
  options: Array<Option<T>>;
  value: T;
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
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PolicyMatcherClient() {
  const [selection, setSelection] = useState<SelectionState>(initialSelection);

  const matchedPolicies = useMemo(
    () => policyRules.filter((policy) => policy.match(selection)),
    [selection]
  );

  const selectedSummary = [
    getLabel(residenceOptions, selection.residence),
    getLabel(timingOptions, selection.weddingTiming),
    getLabel(incomeOptions, selection.incomeRange)
  ].join(" · ");

  return (
    <div className="policy-talk-layout">
      <section className="policy-talk-phone" aria-label="정책 톡 대화">
        <div className="talk-header">
          <span>신혼생활</span>
          <strong>정책 톡</strong>
        </div>

        <div className="talk-thread">
          <div className="talk-bubble bot">
            안녕하세요. 세 가지만 고르면 지금 확인해볼 정책 가능성을 바로 정리해드릴게요.
          </div>
          <div className="talk-bubble user">{selectedSummary}</div>
          <div className="talk-bubble bot">
            {matchedPolicies.length
              ? `${matchedPolicies.length}개 정책이 조건과 맞아 보여요. 아래에서 핵심 조건과 준비 서류를 확인하세요.`
              : "현재 선택으로는 바로 맞는 정책이 적어요. 거주지나 결혼 시기를 바꿔 다시 확인해보세요."}
          </div>

          <div className="talk-result-stack">
            {matchedPolicies.map((policy) => (
              <article className="talk-result-card" key={policy.name}>
                <div className="talk-result-topline">
                  <span>{policy.category}</span>
                  <small>{policy.region}</small>
                </div>
                <h2>{policy.name}</h2>
                <p>{policy.summary}</p>
                <p className="talk-reason">{policy.reason(selection)}</p>
                <dl>
                  <div>
                    <dt>운영처</dt>
                    <dd>{policy.providerName}</dd>
                  </div>
                  <div>
                    <dt>준비 서류</dt>
                    <dd>{policy.documents.join(", ")}</dd>
                  </div>
                </dl>
                <a className="text-link" href={policy.sourceUrl} rel="noreferrer" target="_blank">
                  출처 보기
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="policy-selector-panel" aria-label="정책 조건 선택">
        <OptionGroup
          label="거주지"
          onChange={(residence) => setSelection((current) => ({ ...current, residence }))}
          options={residenceOptions}
          value={selection.residence}
        />
        <OptionGroup
          label="결혼 시기"
          onChange={(weddingTiming) => setSelection((current) => ({ ...current, weddingTiming }))}
          options={timingOptions}
          value={selection.weddingTiming}
        />
        <OptionGroup
          label="소득 구간"
          onChange={(incomeRange) => setSelection((current) => ({ ...current, incomeRange }))}
          options={incomeOptions}
          value={selection.incomeRange}
        />
        <p className="talk-note">
          룰베이스 샘플 안내입니다. 실제 신청 전에는 공식 공고의 접수 기간과 세부 자격을 함께
          확인하세요.
        </p>
      </section>
    </div>
  );
}
