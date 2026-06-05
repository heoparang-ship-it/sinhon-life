"use client";

import { Card, EmptyState, ErrorState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../../lib/api";
import type { LeadRequestDetail, LeadRequestResponse } from "../lead-request-types";

type LeadRequestDetailClientProps = {
  leadRequestId: string;
};

const statusLabels: Record<string, string> = {
  accepted: "접수 승인",
  booked: "상담 예약",
  contacted: "연락 완료",
  expired: "만료",
  rejected: "반려",
  submitted: "접수됨",
  viewed: "확인됨"
};

const contactMethodLabels: Record<string, string> = {
  email: "이메일",
  kakao: "카카오",
  other: "기타",
  phone: "전화",
  sms: "문자"
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

function preferredDateText(value: LeadRequestDetail["preferredContactDates"]) {
  if (!Array.isArray(value)) return "미기록";

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
      const date = "date" in item ? String(item.date) : "";
      const window = "window" in item ? String(item.window) : "any";

      return `${date}${window === "any" ? "" : ` · ${window}`}`;
    })
    .filter(Boolean)
    .join(", ");
}

export function LeadRequestDetailClient({ leadRequestId }: LeadRequestDetailClientProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leadRequest, setLeadRequest] = useState<LeadRequestDetail | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function load() {
      try {
        const response = await apiRequest<LeadRequestResponse>(`/lead-requests/${leadRequestId}`, {
          token
        });
        setLeadRequest(response.leadRequest);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "상담 신청을 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [leadRequestId]);

  if (isLoading) {
    return <LoadingState description="상담 신청 상태를 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 상담 신청 내역을 확인할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (error) {
    return <ErrorState title="확인이 필요합니다" description={error.error.message} />;
  }

  if (!leadRequest) {
    return (
      <EmptyState
        title="상담 신청을 찾을 수 없습니다"
        description="비교방에서 다시 확인해 주세요."
        action={
          <Link className="button-link" href="/compare-rooms">
            비교방 목록
          </Link>
        }
      />
    );
  }

  return (
    <div className="lead-layout">
      <Card
        title={statusLabels[leadRequest.status] ?? leadRequest.status}
        description={`${leadRequest.vendor.name}에 상담 신청이 접수되었습니다.`}
      >
        <dl className="summary-list">
          <div>
            <dt>상품</dt>
            <dd>
              {leadRequest.compareCard?.snapshotTitle ?? leadRequest.offer?.title ?? "미기록"}
            </dd>
          </div>
          <div>
            <dt>희망 상담</dt>
            <dd>{preferredDateText(leadRequest.preferredContactDates)}</dd>
          </div>
          <div>
            <dt>연락 방식</dt>
            <dd>{contactMethodLabels[leadRequest.preferredContactMethod]}</dd>
          </div>
          <div>
            <dt>연락처</dt>
            <dd>{leadRequest.contactPhoneMasked ?? "마스킹됨"}</dd>
          </div>
          <div>
            <dt>접수일</dt>
            <dd>{formatDate(leadRequest.submittedAt)}</dd>
          </div>
        </dl>
        <div className="notice-box" style={{ marginTop: 14 }}>
          파트너가 조건을 확인한 뒤 연락합니다. 계약이나 결제는 이 화면에서 확정되지 않습니다.
        </div>
        <div className="action-row" style={{ marginTop: 16 }}>
          <Link className="button-link" href={`/compare-rooms/${leadRequest.compareRoomId}`}>
            비교방 보기
          </Link>
          <Link className="button-link secondary-link" href="/offers">
            상품 더 보기
          </Link>
        </div>
      </Card>

      <Card title="상태 이력" description="접수 이후 운영 상태 변경 내역입니다.">
        {leadRequest.histories.length ? (
          <div className="lead-history-list">
            {leadRequest.histories.map((history) => (
              <article className="lead-history-item" key={history.id}>
                <strong>{statusLabels[history.toStatus] ?? history.toStatus}</strong>
                <span>
                  {formatDate(history.createdAt)} · {history.changedByRole ?? "system"}
                </span>
                {history.reason ? <p>{history.reason}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="muted-copy">아직 상태 이력이 없습니다.</p>
        )}
      </Card>
    </div>
  );
}
