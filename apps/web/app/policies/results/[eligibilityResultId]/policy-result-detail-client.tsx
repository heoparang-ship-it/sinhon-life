"use client";

import { Button, Card, EmptyState, ErrorState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../../../lib/api";

type EligibilityResult = {
  checkedAt: string;
  disclaimer: string;
  expiresAt: string | null;
  id: string;
  inputSnapshot: Record<string, unknown>;
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
    sourceUpdatedAt: string | null;
    sourceUrl: string;
    summary: string;
    verifiedAt: string | null;
  };
  policyRuleVersion: {
    id: string;
    sourceUpdatedAt: string | null;
    sourceUrl: string;
    verifiedAt: string | null;
    version: number;
  };
  requiredDocuments: Array<{
    key: string;
    label: string;
    required: boolean;
  }>;
  resultReason: string;
  resultStatus: string;
};

type EligibilityResultResponse = {
  eligibilityResult: EligibilityResult;
};

type TaskListResponse = {
  tasks: Array<{
    id: string;
    status: string;
    title: string;
  }>;
};

type PolicyResultDetailClientProps = {
  eligibilityResultId: string;
};

const resultStatusLabels: Record<string, string> = {
  expired: "기간 확인 필요",
  likely_eligible: "조건이 대체로 맞음",
  maybe_eligible: "추가 확인 필요",
  need_more_info: "입력 더 필요",
  not_eligible: "주요 조건 불일치",
  unknown: "판단 보류"
};

function formatDate(value: string | null) {
  if (!value) return "미기록";
  return new Date(value).toLocaleDateString("ko-KR");
}

function statusLabel(status: string) {
  return resultStatusLabels[status] ?? status;
}

export function PolicyResultDetailClient({ eligibilityResultId }: PolicyResultDetailClientProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [tasks, setTasks] = useState<TaskListResponse["tasks"]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function loadResult() {
      try {
        const data = await apiRequest<EligibilityResultResponse>(
          `/eligibility-results/${eligibilityResultId}`,
          {
            token
          }
        );
        setResult(data.eligibilityResult);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "정책 결과를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadResult();
  }, [eligibilityResultId]);

  async function createDocumentTasks() {
    if (!accessToken || !result) return;

    setError(null);
    setIsMutating(true);

    try {
      const data = await apiRequest<TaskListResponse>(`/eligibility-results/${result.id}/tasks`, {
        body: {
          dueInDays: 14
        },
        method: "POST",
        token: accessToken
      });
      setTasks(data.tasks);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "서류 할 일을 만들지 못했습니다."
            })
      );
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="정책 결과를 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 정책 결과를 확인할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (error && !result) {
    return <ErrorState title="정책 결과를 확인하지 못했습니다" description={error.error.message} />;
  }

  if (!result) {
    return (
      <EmptyState
        title="결과가 없습니다"
        description="정책 목록에서 조건 확인을 먼저 실행해 주세요."
        action={
          <Link className="button-link" href="/policies">
            정책 목록
          </Link>
        }
      />
    );
  }

  return (
    <div className="policy-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <Card
        title={result.policyProgram.name}
        description={`${result.policyProgram.providerName} · 룰 버전 ${result.policyRuleVersion.version}`}
      >
        <div className="policy-status-panel">
          <span className={`policy-status ${result.resultStatus}`}>
            {statusLabel(result.resultStatus)}
          </span>
          <p>{result.resultReason}</p>
        </div>
      </Card>

      <section className="policy-columns" aria-label="정책 결과 상세">
        <Card title="확인 정보" description="출처와 유효기간을 함께 확인합니다.">
          <dl className="policy-meta-list large">
            <div>
              <dt>확인일</dt>
              <dd>{formatDate(result.checkedAt)}</dd>
            </div>
            <div>
              <dt>결과 유효 참고일</dt>
              <dd>{formatDate(result.expiresAt)}</dd>
            </div>
            <div>
              <dt>출처 갱신일</dt>
              <dd>{formatDate(result.policyRuleVersion.sourceUpdatedAt)}</dd>
            </div>
            <div>
              <dt>검증일</dt>
              <dd>{formatDate(result.policyRuleVersion.verifiedAt)}</dd>
            </div>
          </dl>
          <a
            className="text-link"
            href={result.policyRuleVersion.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            출처 보기
          </a>
        </Card>

        <Card title="필요 서류" description="정책 결과에서 추출한 준비 목록입니다.">
          {result.requiredDocuments.length ? (
            <div className="document-checklist">
              {result.requiredDocuments.map((document) => (
                <label key={document.key}>
                  <input type="checkbox" />
                  <span>
                    <strong>{document.label}</strong>
                    <small>{document.required ? "필수" : "선택 확인"}</small>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="muted-copy">표시할 필요 서류가 없습니다.</p>
          )}
          <div className="action-row" style={{ marginTop: 18 }}>
            <Button
              disabled={result.requiredDocuments.length === 0}
              isLoading={isMutating}
              onClick={createDocumentTasks}
            >
              문서·할 일 만들기
            </Button>
            <Link className="button-link secondary-link" href="/policies">
              목록
            </Link>
            <Link className="button-link secondary-link" href="/documents">
              문서함
            </Link>
            <Link className="button-link secondary-link" href="/tasks">
              할 일
            </Link>
          </div>
          {tasks.length ? (
            <div className="task-created-list">
              {tasks.map((task) => (
                <span key={task.id}>{task.title}</span>
              ))}
            </div>
          ) : null}
        </Card>
      </section>

      <Card title="누락 입력" description="필요하면 온보딩에서 보완합니다.">
        {result.missingInputs.length ? (
          <div className="policy-chip-list">
            {result.missingInputs.map((input) => (
              <span key={input.key}>{input.label}</span>
            ))}
          </div>
        ) : (
          <p className="muted-copy">현재 결과에 표시된 누락 입력은 없습니다.</p>
        )}
      </Card>

      <Card title="확인 문구">
        <p className="muted-copy">{result.disclaimer}</p>
      </Card>
    </div>
  );
}
