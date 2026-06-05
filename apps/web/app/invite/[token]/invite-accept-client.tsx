"use client";

import { Button, Card, EmptyState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../../lib/api";

type InvitationPreviewResponse = {
  invitation: {
    coupleDisplayName: string;
    expiresAt: string;
    inviterDisplayName: string;
    status: string;
  };
};

type AcceptInvitationResponse = {
  couple: {
    displayName: string;
    id: string;
    lifecycleStatus: string;
    onboardingStatus: string;
  };
  member: {
    coupleId: string;
    id: string;
    role: string;
    status: string;
    userId: string;
  };
};

type InviteAcceptClientProps = {
  token: string;
};

function formatExpiresAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function InviteAcceptClient({ token }: InviteAcceptClientProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [acceptResult, setAcceptResult] = useState<AcceptInvitationResponse | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preview, setPreview] = useState<InvitationPreviewResponse | null>(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    apiRequest<InvitationPreviewResponse>(`/couple-invitations/${token}`)
      .then((data) => {
        setPreview(data);
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "초대 링크를 확인하지 못했습니다."
              })
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  async function handleAccept() {
    if (!accessToken) {
      return;
    }

    setError(null);
    setIsAccepting(true);

    try {
      const data = await apiRequest<AcceptInvitationResponse>(
        `/couple-invitations/${token}/accept`,
        {
          body: { accept: true },
          method: "POST",
          token: accessToken
        }
      );
      setAcceptResult(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "초대를 수락하지 못했습니다."
            })
      );
    } finally {
      setIsAccepting(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="초대 링크를 확인하고 있습니다." />;
  }

  if (acceptResult) {
    return (
      <Card
        title="합류가 완료됐습니다"
        description={`${acceptResult.couple.displayName} 공간에 연결됐습니다.`}
        footer={
          <Link className="button-link" href="/">
            홈으로
          </Link>
        }
      >
        <dl className="summary-list">
          <div>
            <dt>역할</dt>
            <dd>
              {acceptResult.member.role === "partner" ? "초대 파트너" : acceptResult.member.role}
            </dd>
          </div>
          <div>
            <dt>상태</dt>
            <dd>{acceptResult.member.status}</dd>
          </div>
        </dl>
      </Card>
    );
  }

  if (!preview) {
    return (
      <EmptyState
        title="초대 링크를 찾지 못했습니다"
        description={error?.error.message ?? "링크 주소를 다시 확인해 주세요."}
      />
    );
  }

  return (
    <Card
      title={preview.invitation.coupleDisplayName}
      description={`${preview.invitation.inviterDisplayName}님이 초대했습니다.`}
    >
      <div className="form-stack">
        <dl className="summary-list">
          <div>
            <dt>링크 상태</dt>
            <dd>{preview.invitation.status}</dd>
          </div>
          <div>
            <dt>만료 시각</dt>
            <dd>{formatExpiresAt(preview.invitation.expiresAt)}</dd>
          </div>
        </dl>

        {accessToken ? (
          <Button fullWidth isLoading={isAccepting} onClick={handleAccept}>
            초대 수락
          </Button>
        ) : (
          <Link
            className="button-link"
            href={`/signup?invitationToken=${encodeURIComponent(token)}`}
          >
            가입하고 합류
          </Link>
        )}

        {error ? (
          <div className="error-box" role="alert">
            {error.error.message}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
