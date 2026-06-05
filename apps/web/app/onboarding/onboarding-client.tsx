"use client";

import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Progress,
  Select,
  Stepper
} from "@sinhon-os/ui";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";

type CurrentCoupleResponse = {
  couple: {
    displayName: string;
    id: string;
    onboardingStatus: string;
  } | null;
  partnerStatus: "connected" | "waiting_partner" | null;
};

type VisibilityPreference = {
  asset: "partner" | "private" | "summary";
  income: "partner" | "private" | "summary";
};

type OnboardingResponse = {
  couple: {
    displayName: string;
    id: string;
    onboardingStatus: string;
  };
  coupleInput: CoupleFormState & {
    isComplete: boolean;
  };
  myProgress: PersonalFormState & {
    isComplete: boolean;
    onboardingStatus: string;
  };
  partnerProgress: {
    displayLabel: string | null;
    isComplete: boolean;
    onboardingStatus: string;
  } | null;
  partnerStatus: "connected" | "waiting_partner";
  status: string;
};

type PersonalFormState = {
  assetRange: string;
  displayLabel: string | null;
  incomeRange: string;
  phoneVerified: boolean;
  visibilityPreference: VisibilityPreference;
  workRegion: string;
};

type CoupleFormState = {
  cashOnHandRange: string;
  childrenPlanStatus: string;
  familySupportType: string;
  housingType: string;
  loanConsiderationStatus: string;
  moveInPlanAt: string | null;
  preferredResidenceRegion: string;
  preferredWeddingStyle: string;
  totalBudgetRange: string;
  weddingDate: string | null;
  weddingRegion: string;
};

type StepKey = "couple" | "personal" | "review";

const rangeOptions = [
  { label: "선택 안 함", value: "not_set" },
  { label: "3천만 원 미만", value: "under_30m" },
  { label: "3천만-5천만 원", value: "30m_50m" },
  { label: "5천만-1억 원", value: "50m_100m" },
  { label: "1억 원 이상", value: "over_100m" },
  { label: "비공개", value: "private" }
];

const budgetOptions = [
  { label: "선택 안 함", value: "not_set" },
  { label: "1억 원 미만", value: "under_100m" },
  { label: "1억-2억 원", value: "100m_200m" },
  { label: "2억-3억 원", value: "200m_300m" },
  { label: "3억-5억 원", value: "300m_500m" },
  { label: "5억 원 이상", value: "over_500m" },
  { label: "비공개", value: "private" }
];

const visibilityOptions = [
  { label: "요약 공개", value: "summary" },
  { label: "배우자에게만 공개", value: "partner" },
  { label: "비공개", value: "private" }
];

const housingOptions = [
  { label: "선택 안 함", value: "not_set" },
  { label: "전세", value: "rental_jeonse" },
  { label: "월세", value: "monthly_rent" },
  { label: "매매", value: "purchase" },
  { label: "가족 집", value: "family_home" },
  { label: "아직 미정", value: "undecided" },
  { label: "기타", value: "other" }
];

const familySupportOptions = [
  { label: "선택 안 함", value: "not_set" },
  { label: "없음", value: "none" },
  { label: "가능성 있음", value: "possible" },
  { label: "확정", value: "confirmed" },
  { label: "비공개", value: "private" }
];

const loanOptions = [
  { label: "선택 안 함", value: "not_set" },
  { label: "고려 안 함", value: "not_considering" },
  { label: "고려 중", value: "considering" },
  { label: "이미 이용 중", value: "already_using" },
  { label: "비공개", value: "private" }
];

const childrenOptions = [
  { label: "선택 안 함", value: "not_set" },
  { label: "계획 있음", value: "planning" },
  { label: "계획 없음", value: "not_planning" },
  { label: "아직 미정", value: "undecided" },
  { label: "비공개", value: "private" }
];

const weddingStyleOptions = [
  { label: "선택 안 함", value: "not_set" },
  { label: "스몰 웨딩", value: "small" },
  { label: "일반 예식", value: "standard" },
  { label: "호텔 예식", value: "hotel" },
  { label: "종교 예식", value: "church" },
  { label: "야외 예식", value: "outdoor" },
  { label: "가족 중심", value: "family_only" },
  { label: "아직 미정", value: "undecided" },
  { label: "기타", value: "other" }
];

const emptyPersonalForm: PersonalFormState = {
  assetRange: "not_set",
  displayLabel: "",
  incomeRange: "not_set",
  phoneVerified: false,
  visibilityPreference: {
    asset: "summary",
    income: "summary"
  },
  workRegion: ""
};

const emptyCoupleForm: CoupleFormState = {
  cashOnHandRange: "not_set",
  childrenPlanStatus: "not_set",
  familySupportType: "not_set",
  housingType: "not_set",
  loanConsiderationStatus: "not_set",
  moveInPlanAt: "",
  preferredResidenceRegion: "",
  preferredWeddingStyle: "not_set",
  totalBudgetRange: "not_set",
  weddingDate: "",
  weddingRegion: ""
};

function normalizePersonalForm(data: OnboardingResponse): PersonalFormState {
  return {
    ...emptyPersonalForm,
    ...data.myProgress,
    displayLabel: data.myProgress.displayLabel ?? "",
    visibilityPreference:
      data.myProgress.visibilityPreference ?? emptyPersonalForm.visibilityPreference
  };
}

function normalizeCoupleForm(data: OnboardingResponse): CoupleFormState {
  return {
    ...emptyCoupleForm,
    ...data.coupleInput,
    moveInPlanAt: data.coupleInput.moveInPlanAt ?? "",
    weddingDate: data.coupleInput.weddingDate ?? ""
  };
}

function fieldValue(value: string | null | undefined) {
  return value || "미입력";
}

export function OnboardingClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<StepKey>("personal");
  const [couple, setCouple] = useState<CurrentCoupleResponse["couple"]>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingResponse | null>(null);
  const [personalForm, setPersonalForm] = useState<PersonalFormState>(emptyPersonalForm);
  const [coupleForm, setCoupleForm] = useState<CoupleFormState>(emptyCoupleForm);
  const completionValue = useMemo(() => {
    if (!onboarding) return 0;
    if (onboarding.status === "completed") return 100;
    return (
      (onboarding.myProgress.isComplete ? 34 : 0) +
      (onboarding.coupleInput.isComplete ? 33 : 0) +
      (onboarding.partnerProgress?.isComplete ? 33 : 0)
    );
  }, [onboarding]);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function loadOnboarding() {
      try {
        const currentCouple = await apiRequest<CurrentCoupleResponse>("/couples/current", {
          token
        });
        setCouple(currentCouple.couple);

        if (!currentCouple.couple) {
          return;
        }

        const data = await apiRequest<OnboardingResponse>(
          `/couples/${currentCouple.couple.id}/onboarding`,
          {
            token
          }
        );
        setOnboarding(data);
        setPersonalForm(normalizePersonalForm(data));
        setCoupleForm(normalizeCoupleForm(data));
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "온보딩 정보를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadOnboarding();
  }, []);

  async function savePersonal(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!accessToken || !couple) return;

    setError(null);
    setIsSaving(true);

    try {
      const data = await apiRequest<OnboardingResponse>(`/couples/${couple.id}/onboarding/me`, {
        body: {
          assetRange: personalForm.assetRange,
          incomeRange: personalForm.incomeRange,
          nickname: personalForm.displayLabel,
          phoneVerified: personalForm.phoneVerified,
          visibilityPreference: personalForm.visibilityPreference,
          workRegion: personalForm.workRegion
        },
        method: "PATCH",
        token: accessToken
      });
      setOnboarding(data);
      setPersonalForm(normalizePersonalForm(data));
      setActiveStep("couple");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "개인 입력을 저장하지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveCouple(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!accessToken || !couple) return;

    setError(null);
    setIsSaving(true);

    try {
      const data = await apiRequest<OnboardingResponse>(`/couples/${couple.id}/onboarding/couple`, {
        body: coupleForm,
        method: "PATCH",
        token: accessToken
      });
      setOnboarding(data);
      setCoupleForm(normalizeCoupleForm(data));
      setActiveStep("review");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "커플 공통 입력을 저장하지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function completeOnboarding() {
    if (!accessToken || !couple) return;

    setError(null);
    setIsSaving(true);

    try {
      const data = await apiRequest<OnboardingResponse>(
        `/couples/${couple.id}/onboarding/complete`,
        {
          body: {
            confirm: true
          },
          method: "POST",
          token: accessToken
        }
      );
      setOnboarding(data);
      setPersonalForm(normalizePersonalForm(data));
      setCoupleForm(normalizeCoupleForm(data));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "온보딩을 완료하지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="온보딩 정보를 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간을 만든 뒤 온보딩을 시작할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (!couple) {
    return (
      <EmptyState
        title="커플 공간이 없습니다"
        description="먼저 커플 공간을 만들거나 초대를 수락해 주세요."
        action={
          <Link className="button-link" href="/signup">
            커플 공간 만들기
          </Link>
        }
      />
    );
  }

  const steps = [
    {
      description: onboarding?.myProgress.isComplete ? "완료" : "저장 필요",
      label: "개인 입력",
      status:
        activeStep === "personal"
          ? "current"
          : onboarding?.myProgress.isComplete
            ? "complete"
            : "upcoming"
    },
    {
      description: onboarding?.coupleInput.isComplete ? "완료" : "저장 필요",
      label: "커플 공통",
      status:
        activeStep === "couple"
          ? "current"
          : onboarding?.coupleInput.isComplete
            ? "complete"
            : "upcoming"
    },
    {
      description: onboarding?.status === "completed" ? "완료" : "확인 필요",
      label: "확인",
      status:
        activeStep === "review"
          ? "current"
          : onboarding?.status === "completed"
            ? "complete"
            : "upcoming"
    }
  ] as const;

  return (
    <div className="onboarding-layout">
      <Card
        title={couple.displayName}
        description={
          onboarding?.partnerStatus === "waiting_partner"
            ? "배우자가 아직 참여하지 않았습니다."
            : "둘의 입력 상태를 함께 확인합니다."
        }
      >
        <div className="form-stack">
          <Progress label="온보딩 진행률" value={completionValue} />
          <Stepper steps={[...steps]} />
          {onboarding?.partnerStatus === "waiting_partner" ? (
            <div className="notice-box" role="status">
              배우자 참여 전에도 내 입력과 커플 공통 입력은 먼저 저장할 수 있습니다.
            </div>
          ) : null}
        </div>
      </Card>

      {error ? (
        <ErrorState
          title="확인이 필요합니다"
          description={error.error.message}
          action={
            error.error.code === "ONBOARDING_INCOMPLETE" ? (
              <div className="field-error-list">
                {Object.entries(error.error.fields).map(([field, messages]) => (
                  <p key={field}>{messages.join(" ")}</p>
                ))}
              </div>
            ) : undefined
          }
        />
      ) : null}

      {activeStep === "personal" ? (
        <Card title="개인 입력" description="각자 입력한 값은 공개 범위에 따라 보여집니다.">
          <form className="form-stack" onSubmit={savePersonal}>
            <div className="form-grid">
              <Input
                label="닉네임"
                onChange={(event) =>
                  setPersonalForm((current) => ({
                    ...current,
                    displayLabel: event.target.value
                  }))
                }
                required
                value={personalForm.displayLabel ?? ""}
              />
              <Input
                label="직장 지역"
                onChange={(event) =>
                  setPersonalForm((current) => ({
                    ...current,
                    workRegion: event.target.value
                  }))
                }
                required
                value={personalForm.workRegion}
              />
            </div>
            <div className="form-grid">
              <Select
                label="소득 구간"
                onChange={(event) =>
                  setPersonalForm((current) => ({
                    ...current,
                    incomeRange: event.target.value
                  }))
                }
                options={rangeOptions}
                value={personalForm.incomeRange}
              />
              <Select
                label="자산 구간"
                onChange={(event) =>
                  setPersonalForm((current) => ({
                    ...current,
                    assetRange: event.target.value
                  }))
                }
                options={rangeOptions}
                value={personalForm.assetRange}
              />
            </div>
            <div className="form-grid">
              <Select
                label="소득 공개 범위"
                onChange={(event) =>
                  setPersonalForm((current) => ({
                    ...current,
                    visibilityPreference: {
                      ...current.visibilityPreference,
                      income: event.target.value as VisibilityPreference["income"]
                    }
                  }))
                }
                options={visibilityOptions}
                value={personalForm.visibilityPreference.income}
              />
              <Select
                label="자산 공개 범위"
                onChange={(event) =>
                  setPersonalForm((current) => ({
                    ...current,
                    visibilityPreference: {
                      ...current.visibilityPreference,
                      asset: event.target.value as VisibilityPreference["asset"]
                    }
                  }))
                }
                options={visibilityOptions}
                value={personalForm.visibilityPreference.asset}
              />
            </div>
            <Checkbox
              checked={personalForm.phoneVerified}
              label="휴대폰 확인 완료"
              onChange={(event) =>
                setPersonalForm((current) => ({
                  ...current,
                  phoneVerified: event.target.checked
                }))
              }
            />
            <div className="action-row">
              <Button isLoading={isSaving} type="submit">
                개인 입력 저장
              </Button>
              <Button onClick={() => setActiveStep("couple")} type="button" variant="secondary">
                다음
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {activeStep === "couple" ? (
        <Card title="커플 공통 입력" description="정확한 금액 대신 구간으로만 저장합니다.">
          <form className="form-stack" onSubmit={saveCouple}>
            <div className="form-grid">
              <Input
                label="결혼 예정일"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    weddingDate: event.target.value
                  }))
                }
                required
                type="date"
                value={coupleForm.weddingDate ?? ""}
              />
              <Input
                label="입주 예정일"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    moveInPlanAt: event.target.value
                  }))
                }
                required
                type="date"
                value={coupleForm.moveInPlanAt ?? ""}
              />
            </div>
            <div className="form-grid">
              <Input
                label="예식 지역"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    weddingRegion: event.target.value
                  }))
                }
                required
                value={coupleForm.weddingRegion}
              />
              <Input
                label="거주 희망 지역"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    preferredResidenceRegion: event.target.value
                  }))
                }
                required
                value={coupleForm.preferredResidenceRegion}
              />
            </div>
            <div className="form-grid">
              <Select
                label="주거 형태"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    housingType: event.target.value
                  }))
                }
                options={housingOptions}
                value={coupleForm.housingType}
              />
              <Select
                label="선호 예식 스타일"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    preferredWeddingStyle: event.target.value
                  }))
                }
                options={weddingStyleOptions}
                value={coupleForm.preferredWeddingStyle}
              />
            </div>
            <div className="form-grid">
              <Select
                label="예산 총액 구간"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    totalBudgetRange: event.target.value
                  }))
                }
                options={budgetOptions}
                value={coupleForm.totalBudgetRange}
              />
              <Select
                label="보유 현금 구간"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    cashOnHandRange: event.target.value
                  }))
                }
                options={rangeOptions}
                value={coupleForm.cashOnHandRange}
              />
            </div>
            <div className="form-grid">
              <Select
                label="가족 지원금"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    familySupportType: event.target.value
                  }))
                }
                options={familySupportOptions}
                value={coupleForm.familySupportType}
              />
              <Select
                label="대출 고려 여부"
                onChange={(event) =>
                  setCoupleForm((current) => ({
                    ...current,
                    loanConsiderationStatus: event.target.value
                  }))
                }
                options={loanOptions}
                value={coupleForm.loanConsiderationStatus}
              />
            </div>
            <Select
              label="자녀 계획"
              onChange={(event) =>
                setCoupleForm((current) => ({
                  ...current,
                  childrenPlanStatus: event.target.value
                }))
              }
              options={childrenOptions}
              value={coupleForm.childrenPlanStatus}
            />
            <div className="action-row">
              <Button onClick={() => setActiveStep("personal")} type="button" variant="secondary">
                이전
              </Button>
              <Button isLoading={isSaving} type="submit">
                공통 입력 저장
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {activeStep === "review" && onboarding ? (
        <Card
          title="입력 확인"
          description={
            onboarding.status === "completed"
              ? "온보딩이 완료됐습니다."
              : "입력값을 확인하고 온보딩을 완료합니다."
          }
        >
          <div className="form-stack">
            <dl className="summary-list">
              <div>
                <dt>내 입력</dt>
                <dd>{onboarding.myProgress.isComplete ? "완료" : "저장 필요"}</dd>
              </div>
              <div>
                <dt>배우자 입력</dt>
                <dd>
                  {onboarding.partnerProgress
                    ? onboarding.partnerProgress.isComplete
                      ? "완료"
                      : "대기 중"
                    : "미참여"}
                </dd>
              </div>
              <div>
                <dt>커플 공통</dt>
                <dd>{onboarding.coupleInput.isComplete ? "완료" : "저장 필요"}</dd>
              </div>
              <div>
                <dt>예식 지역</dt>
                <dd>{fieldValue(onboarding.coupleInput.weddingRegion)}</dd>
              </div>
              <div>
                <dt>예산 구간</dt>
                <dd>{fieldValue(onboarding.coupleInput.totalBudgetRange)}</dd>
              </div>
            </dl>
            <div className="action-row">
              <Button onClick={() => setActiveStep("couple")} type="button" variant="secondary">
                이전
              </Button>
              <Button
                disabled={onboarding.status === "completed"}
                isLoading={isSaving}
                onClick={completeOnboarding}
                type="button"
              >
                온보딩 완료
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
