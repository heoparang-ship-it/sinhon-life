"use client";

import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Select } from "@sinhon-os/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type ScenarioSummary = {
  containsSampleValue: boolean;
  createdAt: string;
  id: string;
  monthlyAmount: number | null;
  shortfallAmount: number | null;
  status: string;
  title: string;
  totalAmount: number | null;
  warnings: string[];
};

type ScenarioListResponse = {
  scenarios: ScenarioSummary[];
};

type ScenarioCreateResponse = {
  scenario: {
    id: string;
  };
};

type ItemDraft = {
  amount: string;
  amountType: "admin_default" | "partner_price_snapshot" | "sample" | "user_input";
  category:
    | "appliance"
    | "furniture"
    | "honeymoon"
    | "housing_initial"
    | "housing_monthly"
    | "living_setup"
    | "misc"
    | "wedding";
  frequency: "monthly" | "one_time";
  isRequired: boolean;
  label: string;
  sortOrder: number;
};

const categoryOptions = [
  { label: "예식", value: "wedding" },
  { label: "주거 초기", value: "housing_initial" },
  { label: "월 주거", value: "housing_monthly" },
  { label: "가구", value: "furniture" },
  { label: "가전", value: "appliance" },
  { label: "허니문", value: "honeymoon" },
  { label: "입주 준비", value: "living_setup" },
  { label: "기타", value: "misc" }
];

const frequencyOptions = [
  { label: "일회성", value: "one_time" },
  { label: "월 부담", value: "monthly" }
];

const amountTypeOptions = [
  { label: "직접 입력", value: "user_input" },
  { label: "샘플", value: "sample" },
  { label: "운영 기본값", value: "admin_default" }
];

const initialItems: ItemDraft[] = [
  {
    amount: "16000000",
    amountType: "user_input",
    category: "wedding",
    frequency: "one_time",
    isRequired: true,
    label: "예식장 예상 비용",
    sortOrder: 10
  },
  {
    amount: "8000000",
    amountType: "sample",
    category: "appliance",
    frequency: "one_time",
    isRequired: false,
    label: "가전 샘플",
    sortOrder: 20
  },
  {
    amount: "5000000",
    amountType: "sample",
    category: "furniture",
    frequency: "one_time",
    isRequired: false,
    label: "가구 샘플",
    sortOrder: 30
  },
  {
    amount: "1200000",
    amountType: "user_input",
    category: "housing_monthly",
    frequency: "monthly",
    isRequired: false,
    label: "월 주거비",
    sortOrder: 40
  }
];

function formatKrw(amount: number | null) {
  if (amount === null) return "계산 전";
  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amount);
}

function toNumber(value: string) {
  const normalized = value.replace(/[^\d]/g, "");
  return normalized ? Number(normalized) : 0;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

export function ScenarioBuilderClient() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [availableBudgetAmount, setAvailableBudgetAmount] = useState("21000000");
  const [couple, setCouple] = useState<CurrentCoupleResponse["couple"]>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [items, setItems] = useState<ItemDraft[]>(initialItems);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [title, setTitle] = useState("봄 예식 기본 시나리오");
  const previewTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.frequency === "one_time" ? toNumber(item.amount) : 0),
        0
      ),
    [items]
  );
  const previewMonthly = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.frequency === "monthly" ? toNumber(item.amount) : 0),
        0
      ),
    [items]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function loadScenarios() {
      try {
        const currentCouple = await apiRequest<CurrentCoupleResponse>("/couples/current", {
          token
        });
        setCouple(currentCouple.couple);

        if (!currentCouple.couple) {
          return;
        }

        const list = await apiRequest<ScenarioListResponse>(
          `/couples/${currentCouple.couple.id}/scenarios`,
          {
            token
          }
        );
        setScenarios(list.scenarios);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "시나리오 정보를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadScenarios();
  }, []);

  function updateItem(index: number, patch: Partial<ItemDraft>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        amount: "",
        amountType: "user_input",
        category: "misc",
        frequency: "one_time",
        isRequired: false,
        label: "기타 항목",
        sortOrder: (current.length + 1) * 10
      }
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function createScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !couple) return;

    setError(null);
    setIsSaving(true);

    try {
      const payload = await apiRequest<ScenarioCreateResponse>(`/couples/${couple.id}/scenarios`, {
        body: {
          budgetBasis: {
            availableBudgetAmount: toNumber(availableBudgetAmount)
          },
          items: items
            .filter((item) => item.label.trim())
            .map((item, index) => ({
              amount: toNumber(item.amount),
              amountType: item.amountType,
              category: item.category,
              frequency: item.frequency,
              isRequired: item.isRequired,
              label: item.label,
              sortOrder: index * 10
            })),
          title,
          useOnboardingDefaults: true
        },
        method: "POST",
        token: accessToken
      });

      router.push(`/scenarios/${payload.scenario.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "시나리오를 만들지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="시나리오 정보를 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간을 만든 뒤 시나리오를 만들 수 있습니다."
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

  return (
    <div className="scenario-layout">
      {error ? (
        <ErrorState
          title="확인이 필요합니다"
          description={error.error.message}
          action={
            error.error.code === "ONBOARDING_INCOMPLETE" ? (
              <Link className="button-link" href="/onboarding">
                온보딩 확인
              </Link>
            ) : undefined
          }
        />
      ) : null}

      <Card
        title={couple.displayName}
        description="온보딩 구간값은 맥락으로만 사용하고, 부족 금액은 아래 예산 기준 금액으로 계산합니다."
      >
        <div className="metric-grid">
          <div className="metric-tile">
            <span>미리 보는 총액</span>
            <strong>{formatKrw(previewTotal)}</strong>
          </div>
          <div className="metric-tile">
            <span>미리 보는 월 부담</span>
            <strong>{formatKrw(previewMonthly)}</strong>
          </div>
        </div>
      </Card>

      <Card
        title="새 시나리오"
        description="금액은 원화 정수로 저장합니다. 샘플 항목은 결과에서 표시됩니다."
      >
        <form className="form-stack" onSubmit={createScenario}>
          <div className="form-grid">
            <Input
              label="시나리오 이름"
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
            <Input
              inputMode="numeric"
              label="예산 기준 금액"
              onChange={(event) => setAvailableBudgetAmount(event.target.value)}
              required
              value={availableBudgetAmount}
            />
          </div>

          <div className="scenario-items" aria-label="비용 항목">
            {items.map((item, index) => (
              <div className="scenario-item-row" key={`${item.label}-${index}`}>
                <Input
                  label="항목명"
                  onChange={(event) => updateItem(index, { label: event.target.value })}
                  required
                  value={item.label}
                />
                <Select
                  label="분류"
                  onChange={(event) =>
                    updateItem(index, {
                      category: event.target.value as ItemDraft["category"]
                    })
                  }
                  options={categoryOptions}
                  value={item.category}
                />
                <Input
                  inputMode="numeric"
                  label="금액"
                  onChange={(event) => updateItem(index, { amount: event.target.value })}
                  required
                  value={item.amount}
                />
                <Select
                  label="주기"
                  onChange={(event) =>
                    updateItem(index, {
                      frequency: event.target.value as ItemDraft["frequency"]
                    })
                  }
                  options={frequencyOptions}
                  value={item.frequency}
                />
                <Select
                  label="출처"
                  onChange={(event) =>
                    updateItem(index, {
                      amountType: event.target.value as ItemDraft["amountType"]
                    })
                  }
                  options={amountTypeOptions}
                  value={item.amountType}
                />
                <Button
                  disabled={items.length <= 1}
                  onClick={() => removeItem(index)}
                  type="button"
                  variant="ghost"
                >
                  제거
                </Button>
              </div>
            ))}
          </div>

          <div className="action-row">
            <Button isLoading={isSaving} type="submit">
              시나리오 만들기
            </Button>
            <Button onClick={addItem} type="button" variant="secondary">
              항목 추가
            </Button>
          </div>
        </form>
      </Card>

      <Card title="최근 시나리오" description="보관된 시나리오는 기본 목록에서 제외됩니다.">
        {scenarios.length ? (
          <div className="scenario-list">
            {scenarios.map((scenario) => (
              <Link
                className="scenario-list-item"
                href={`/scenarios/${scenario.id}`}
                key={scenario.id}
              >
                <span>
                  <strong>{scenario.title}</strong>
                  <small>{formatDate(scenario.createdAt)}</small>
                </span>
                <span>
                  <strong>{formatKrw(scenario.totalAmount)}</strong>
                  {scenario.containsSampleValue ? <small>샘플 포함</small> : null}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted-copy">아직 만든 시나리오가 없습니다.</p>
        )}
      </Card>
    </div>
  );
}
