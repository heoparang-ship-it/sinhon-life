"use client";

import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Select } from "@sinhon-os/ui";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ADMIN_AUTH_TOKEN_STORAGE_KEY, apiRequest, ApiClientError } from "./lib/api";
import type {
  AdminLeadRequest,
  AdminLeadRequestListResponse,
  AdminLeadRequestResponse
} from "./lead-types";

const statusLabels: Record<string, string> = {
  accepted: "접수 승인",
  booked: "상담 예약",
  contacted: "연락 완료",
  expired: "만료",
  rejected: "반려",
  submitted: "접수됨",
  viewed: "확인됨"
};

const statusOptions = [
  { label: "확인됨", value: "viewed" },
  { label: "접수 승인", value: "accepted" },
  { label: "연락 완료", value: "contacted" },
  { label: "상담 예약", value: "booked" },
  { label: "반려", value: "rejected" },
  { label: "만료", value: "expired" }
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

function LeadRow({
  lead,
  onStatusChange,
  pendingLeadId
}: {
  lead: AdminLeadRequest;
  onStatusChange: (leadId: string, status: string) => void;
  pendingLeadId: string | null;
}) {
  const [nextStatus, setNextStatus] = useState(
    lead.status === "submitted" ? "viewed" : lead.status
  );

  return (
    <article className="admin-lead-row">
      <div>
        <span className={`admin-status ${lead.status}`}>
          {statusLabels[lead.status] ?? lead.status}
        </span>
        <h3>{lead.compareCard?.snapshotTitle ?? "상담 상품"}</h3>
        <p>
          {lead.vendor.name} · {formatDate(lead.submittedAt)} ·{" "}
          {lead.contactPhoneMasked ?? "마스킹"}
        </p>
      </div>
      <div className="admin-lead-actions">
        <Select
          label="상태"
          onChange={(event) => setNextStatus(event.target.value)}
          options={statusOptions}
          value={nextStatus}
        />
        <Button
          disabled={pendingLeadId !== null}
          isLoading={pendingLeadId === lead.id}
          onClick={() => onStatusChange(lead.id, nextStatus)}
          type="button"
        >
          저장
        </Button>
        <Link className="button-link secondary-link" href={`/partner/lead-requests/${lead.id}`}>
          파트너 보기
        </Link>
      </div>
    </article>
  );
}

export function AdminLeadDashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leadRequests, setLeadRequests] = useState<AdminLeadRequest[]>([]);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");

  async function loadLeads(token: string) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiRequest<AdminLeadRequestListResponse>("/admin/lead-requests", {
        token
      });
      setLeadRequests(response.leadRequests);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "리드 목록을 불러오지 못했습니다."
            })
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);
    setTokenInput(storedToken ?? "");

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    void loadLeads(storedToken);
  }, []);

  function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem(ADMIN_AUTH_TOKEN_STORAGE_KEY, tokenInput);
    setAccessToken(tokenInput);
    void loadLeads(tokenInput);
  }

  async function updateLeadStatus(leadId: string, status: string) {
    if (!accessToken) return;

    setError(null);
    setPendingLeadId(leadId);

    try {
      const response = await apiRequest<AdminLeadRequestResponse>(
        `/admin/lead-requests/${leadId}/status`,
        {
          body: {
            reason: "운영 화면에서 상태를 변경했습니다.",
            status
          },
          method: "PATCH",
          token: accessToken
        }
      );
      setLeadRequests((current) =>
        current.map((lead) => (lead.id === leadId ? response.leadRequest : lead))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "리드 상태를 변경하지 못했습니다."
            })
      );
    } finally {
      setPendingLeadId(null);
    }
  }

  return (
    <div className="admin-layout">
      <Card
        title="운영 접근"
        description="로컬 MVP에서는 사용자 accessToken으로 운영 API를 확인합니다."
      >
        <form className="admin-token-row" onSubmit={saveToken}>
          <Input
            label="운영 토큰"
            onChange={(event) => setTokenInput(event.target.value)}
            required
            value={tokenInput}
          />
          <Button type="submit">저장 후 조회</Button>
        </form>
      </Card>

      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      {isLoading ? (
        <LoadingState description="상담 신청 리드를 불러오고 있습니다." />
      ) : leadRequests.length ? (
        <section className="admin-lead-list" aria-label="상담 신청 리드">
          {leadRequests.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              onStatusChange={(leadId, status) => void updateLeadStatus(leadId, status)}
              pendingLeadId={pendingLeadId}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="접수된 상담 신청이 없습니다"
          description="사용자 앱에서 both_approved 비교방으로 상담 신청을 만들면 여기에 표시됩니다."
        />
      )}
    </div>
  );
}
