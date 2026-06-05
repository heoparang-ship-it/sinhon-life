"use client";

import { Button, Card, EmptyState, ErrorState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../../lib/api";

type ScenarioDetailResponse = {
  scenario: {
    calculationVersion: string;
    containsSampleValue: boolean;
    id: string;
    items: Array<{
      amount: number;
      amountType: string;
      category: string;
      frequency: "monthly" | "one_time";
      id: string;
      isRequired: boolean;
      label: string;
    }>;
    monthlyAmount: number | null;
    nextActions: string[];
    riskFlags: Array<{
      code: string;
      message: string;
      severity: "info" | "warning";
    }>;
    shortfallAmount: number | null;
    status: string;
    title: string;
    totalAmount: number | null;
    warnings: string[];
  };
};

type ScenarioDetailClientProps = {
  scenarioId: string;
};

const categoryLabels: Record<string, string> = {
  appliance: "가전",
  furniture: "가구",
  honeymoon: "허니문",
  housing_initial: "주거 초기",
  housing_monthly: "월 주거",
  living_setup: "입주 준비",
  misc: "기타",
  wedding: "예식"
};

const amountTypeLabels: Record<string, string> = {
  admin_default: "운영 기본값",
  partner_price_snapshot: "파트너 가격",
  sample: "샘플",
  user_input: "직접 입력"
};

function formatKrw(amount: number | null) {
  if (amount === null) return "계산 불가";
  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amount);
}

export function ScenarioDetailClient({ scenarioId }: ScenarioDetailClientProps) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [scenario, setScenario] = useState<ScenarioDetailResponse["scenario"] | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function loadScenario() {
      try {
        const data = await apiRequest<ScenarioDetailResponse>(`/scenarios/${scenarioId}`, {
          token
        });
        setScenario(data.scenario);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "시나리오를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadScenario();
  }, [scenarioId]);

  async function evaluateScenario() {
    if (!accessToken) return;

    setIsMutating(true);
    setError(null);

    try {
      const data = await apiRequest<ScenarioDetailResponse & { warnings: string[] }>(
        `/scenarios/${scenarioId}/evaluate`,
        {
          body: {},
          method: "POST",
          token: accessToken
        }
      );
      setScenario(data.scenario);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "재계산하지 못했습니다."
            })
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function archiveScenario() {
    if (!accessToken) return;

    setIsMutating(true);
    setError(null);

    try {
      await apiRequest(`/scenarios/${scenarioId}/archive`, {
        method: "POST",
        token: accessToken
      });
      router.push("/scenarios");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "시나리오를 보관하지 못했습니다."
            })
      );
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="시나리오 결과를 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 시나리오를 확인할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (error && !scenario) {
    return <ErrorState title="시나리오를 확인하지 못했습니다" description={error.error.message} />;
  }

  if (!scenario) {
    return (
      <EmptyState
        title="시나리오가 없습니다"
        description="목록으로 돌아가 새 시나리오를 만들어 주세요."
        action={
          <Link className="button-link" href="/scenarios">
            목록으로 이동
          </Link>
        }
      />
    );
  }

  return (
    <div className="scenario-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <Card
        title={scenario.title}
        description={`계산 버전 ${scenario.calculationVersion}. ${
          scenario.containsSampleValue
            ? "샘플 항목이 포함되어 있습니다."
            : "직접 입력 항목으로 계산했습니다."
        }`}
      >
        <div className="metric-grid">
          <div className="metric-tile">
            <span>예상 총액</span>
            <strong>{formatKrw(scenario.totalAmount)}</strong>
          </div>
          <div className="metric-tile">
            <span>월 예상 부담</span>
            <strong>{formatKrw(scenario.monthlyAmount)}</strong>
          </div>
          <div className="metric-tile">
            <span>부족 금액</span>
            <strong>{formatKrw(scenario.shortfallAmount)}</strong>
          </div>
        </div>
      </Card>

      <Card title="비용 항목" description="월 부담 항목은 예상 총액과 따로 계산됩니다.">
        <div className="scenario-result-items">
          {scenario.items.map((item) => (
            <div className="scenario-result-row" key={item.id}>
              <span>
                <strong>{item.label}</strong>
                <small>
                  {categoryLabels[item.category] ?? item.category} ·{" "}
                  {amountTypeLabels[item.amountType] ?? item.amountType}
                  {item.frequency === "monthly" ? " · 월 부담" : ""}
                </small>
              </span>
              <strong>{formatKrw(item.amount)}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card title="위험 신호" description="확정 판단이 아니라 확인이 필요한 상태입니다.">
        {scenario.riskFlags.length ? (
          <div className="risk-list">
            {scenario.riskFlags.map((flag) => (
              <div className={`risk-item ${flag.severity}`} key={flag.code}>
                <strong>{flag.code}</strong>
                <span>{flag.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-copy">현재 표시할 위험 신호가 없습니다.</p>
        )}
      </Card>

      <Card
        title="다음 행동"
        description="계약, 정책, 금융 가능성을 단정하지 않는 확인 목록입니다."
      >
        {scenario.nextActions.length ? (
          <ul className="next-action-list">
            {scenario.nextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        ) : (
          <p className="muted-copy">추가 확인 항목이 없습니다.</p>
        )}
        <div className="action-row" style={{ marginTop: 18 }}>
          <Button isLoading={isMutating} onClick={evaluateScenario}>
            다시 계산
          </Button>
          <Button isLoading={isMutating} onClick={archiveScenario} variant="secondary">
            보관
          </Button>
          <Link className="button-link secondary-link" href="/scenarios">
            목록
          </Link>
        </div>
      </Card>
    </div>
  );
}
