"use client";

import { Card, EmptyState, ErrorState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ADMIN_AUTH_TOKEN_STORAGE_KEY, apiRequest, ApiClientError } from "../../../lib/api";
import type { AdminLeadRequest, AdminLeadRequestResponse } from "../../../lead-types";

type PartnerLeadDetailClientProps = {
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

export function PartnerLeadDetailClient({ leadRequestId }: PartnerLeadDetailClientProps) {
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leadRequest, setLeadRequest] = useState<AdminLeadRequest | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_AUTH_TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function load() {
      try {
        const response = await apiRequest<AdminLeadRequestResponse>(
          `/partner/lead-requests/${leadRequestId}`,
          {
            token
          }
        );
        setLeadRequest(response.leadRequest);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "파트너 리드 상세를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [leadRequestId]);

  if (isLoading) {
    return <LoadingState description="파트너 리드 상세를 확인하고 있습니다." />;
  }

  if (error) {
    return <ErrorState title="확인이 필요합니다" description={error.error.message} />;
  }

  if (!leadRequest) {
    return (
      <EmptyState
        title="운영 토큰이 필요합니다"
        description="관리자 홈에서 운영 토큰을 저장한 뒤 다시 확인해 주세요."
        action={
          <Link className="button-link" href="/">
            관리자 홈
          </Link>
        }
      />
    );
  }

  return (
    <div className="admin-layout">
      <Card
        title={leadRequest.compareCard?.snapshotTitle ?? "상담 요청"}
        description={`${leadRequest.vendor.name}에 전달되는 기본 상담 요청입니다.`}
      >
        <dl className="summary-list">
          <div>
            <dt>상태</dt>
            <dd>{statusLabels[leadRequest.status] ?? leadRequest.status}</dd>
          </div>
          <div>
            <dt>접수일</dt>
            <dd>{formatDate(leadRequest.submittedAt)}</dd>
          </div>
          <div>
            <dt>연락처</dt>
            <dd>{leadRequest.contactPhoneMasked ?? "마스킹됨"}</dd>
          </div>
          <div>
            <dt>문의 요약</dt>
            <dd>{leadRequest.messagePreview ?? "문의 내용 없음"}</dd>
          </div>
        </dl>
        <div className="notice-box" style={{ marginTop: 14 }}>
          파트너 상세는 MVP에서 마스킹된 정보만 표시합니다. 실제 파트너 권한과 개인정보 제공 범위는
          별도 운영 정책에서 확정합니다.
        </div>
      </Card>
    </div>
  );
}
