"use client";

import { Button, Card, EmptyState, ErrorState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";

type CurrentCoupleResponse = {
  couple: {
    displayName: string;
    id: string;
    onboardingStatus: string;
  } | null;
  partnerStatus: "connected" | "waiting_partner" | null;
};

type PolicyProgram = {
  activeRuleVersion: {
    id: string;
    sourceUpdatedAt: string | null;
    sourceUrl: string;
    verifiedAt: string | null;
    version: number;
  } | null;
  category: string;
  id: string;
  name: string;
  providerName: string;
  region: string | null;
  requiredDocumentsSummary: Array<{
    key: string;
    label: string;
    required: boolean;
  }>;
  sourceUpdatedAt: string | null;
  sourceUrl: string;
  status: string;
  summary: string;
  verifiedAt: string | null;
};

type PolicyProgramListResponse = {
  policyPrograms: PolicyProgram[];
};

type EligibilityResult = {
  checkedAt: string;
  disclaimer: string;
  id: string;
  missingInputs: Array<{
    key: string;
    label: string;
  }>;
  policyProgram: {
    category: string;
    id: string;
    name: string;
    providerName: string;
    region: string | null;
  };
  requiredDocuments: Array<{
    key: string;
    label: string;
    required: boolean;
  }>;
  resultReason: string;
  resultStatus: string;
};

type EligibilityResultListResponse = {
  eligibilityResults: EligibilityResult[];
};

type PolicyCheckResponse = {
  disclaimer: string;
  eligibilityResults: EligibilityResult[];
};

const resultStatusLabels: Record<string, string> = {
  expired: "기간 확인 필요",
  likely_eligible: "조건이 대체로 맞음",
  maybe_eligible: "추가 확인 필요",
  need_more_info: "입력 더 필요",
  not_eligible: "주요 조건 불일치",
  unknown: "판단 보류"
};

const categoryLabels: Record<string, string> = {
  appliance: "가전",
  family: "가족 준비",
  housing: "주거",
  moving: "입주",
  wedding: "예식"
};

function formatDate(value: string | null) {
  if (!value) return "미기록";
  return new Date(value).toLocaleDateString("ko-KR");
}

function statusLabel(status: string) {
  return resultStatusLabels[status] ?? status;
}

export function PolicyMatcherClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [couple, setCouple] = useState<CurrentCoupleResponse["couple"]>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [policyPrograms, setPolicyPrograms] = useState<PolicyProgram[]>([]);
  const [results, setResults] = useState<EligibilityResult[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function loadPolicies() {
      try {
        const [currentCouple, policies] = await Promise.all([
          apiRequest<CurrentCoupleResponse>("/couples/current", {
            token
          }),
          apiRequest<PolicyProgramListResponse>("/policy-programs?limit=20", {
            token
          })
        ]);
        setCouple(currentCouple.couple);
        setPolicyPrograms(policies.policyPrograms);

        if (currentCouple.couple) {
          const resultList = await apiRequest<EligibilityResultListResponse>(
            `/couples/${currentCouple.couple.id}/eligibility-results`,
            {
              token
            }
          );
          setResults(resultList.eligibilityResults);
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "정책 정보를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadPolicies();
  }, []);

  async function runPolicyCheck() {
    if (!accessToken || !couple) return;

    setError(null);
    setIsChecking(true);

    try {
      const checked = await apiRequest<PolicyCheckResponse>(`/couples/${couple.id}/policy-checks`, {
        body: {},
        method: "POST",
        token: accessToken
      });
      setResults(checked.eligibilityResults);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "정책 조건을 확인하지 못했습니다."
            })
      );
    } finally {
      setIsChecking(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="정책 룰과 최근 결과를 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 정책 가능성을 확인할 수 있습니다."
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
        title="커플 공간이 필요합니다"
        description="커플 공간을 만든 뒤 정책 조건을 확인할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            커플 공간 만들기
          </Link>
        }
      />
    );
  }

  return (
    <div className="policy-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <Card
        title="정책 검사"
        description={`${couple.displayName}의 온보딩 입력으로 저장된 정책 룰을 확인합니다.`}
      >
        <div className="action-row">
          <Button isLoading={isChecking} onClick={runPolicyCheck}>
            정책 조건 확인
          </Button>
          <Link className="button-link secondary-link" href="/onboarding">
            온보딩 확인
          </Link>
        </div>
        <p className="muted-copy" style={{ marginTop: 12 }}>
          결과는 가능성 안내이며 실제 접수 가능 여부와 지원 내용은 공식 공고에서 다시 확인해야
          합니다.
        </p>
      </Card>

      <section className="policy-columns" aria-label="정책과 결과">
        <Card title="샘플 정책" description="현재 등록된 활성 정책 룰입니다.">
          {policyPrograms.length ? (
            <div className="policy-list">
              {policyPrograms.map((program) => (
                <article className="policy-list-item" key={program.id}>
                  <span className="policy-badge">
                    {categoryLabels[program.category] ?? program.category}
                  </span>
                  <div>
                    <strong>{program.name}</strong>
                    <p>{program.summary}</p>
                  </div>
                  <dl className="policy-meta-list">
                    <div>
                      <dt>기관</dt>
                      <dd>{program.providerName}</dd>
                    </div>
                    <div>
                      <dt>지역</dt>
                      <dd>{program.region ?? "전국"}</dd>
                    </div>
                    <div>
                      <dt>검증일</dt>
                      <dd>{formatDate(program.verifiedAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-copy">아직 등록된 정책이 없습니다.</p>
          )}
        </Card>

        <Card title="최근 결과" description="가장 최근에 저장된 정책 확인 결과입니다.">
          {results.length ? (
            <div className="policy-result-list">
              {results.map((result) => (
                <Link
                  className={`policy-result-card ${result.resultStatus}`}
                  href={`/policies/results/${result.id}`}
                  key={result.id}
                >
                  <span className="policy-badge">{statusLabel(result.resultStatus)}</span>
                  <strong>{result.policyProgram.name}</strong>
                  <small>{formatDate(result.checkedAt)}</small>
                  <p>{result.resultReason}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="아직 결과가 없습니다"
              description="정책 조건 확인을 실행하면 결과와 필요 서류가 여기에 표시됩니다."
            />
          )}
        </Card>
      </section>
    </div>
  );
}
