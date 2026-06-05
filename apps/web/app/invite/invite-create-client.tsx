"use client";

import { Button, Card, EmptyState, LoadingState, Select } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";

type CurrentCoupleResponse = {
  couple: {
    displayName: string;
    id: string;
    lifecycleStatus: string;
    onboardingStatus: string;
  } | null;
  member: {
    coupleId: string;
    id: string;
    role: string;
    status: string;
    userId: string;
  } | null;
  partnerStatus: "connected" | "waiting_partner" | null;
};

type InvitationResponse = {
  expiresAt: string;
  invitationId: string;
  inviteUrl: string;
  token: string;
};

const expirationOptions = [
  { label: "24시간", value: "24" },
  { label: "72시간", value: "72" },
  { label: "7일", value: "168" }
];

export function InviteCreateClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentCouple, setCurrentCouple] = useState<CurrentCoupleResponse | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [expiresInHours, setExpiresInHours] = useState("72");
  const [invitation, setInvitation] = useState<InvitationResponse | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(token);

    if (!token) {
      setIsLoading(false);
      return;
    }

    apiRequest<CurrentCoupleResponse>("/couples/current", { token })
      .then((data) => {
        setCurrentCouple(data);
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "API 서버에 연결하지 못했습니다."
              })
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleCreateInvitation() {
    if (!accessToken || !currentCouple?.couple) {
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const data = await apiRequest<InvitationResponse>(
        `/couples/${currentCouple.couple.id}/invitations`,
        {
          body: { expiresInHours: Number(expiresInHours) },
          method: "POST",
          token: accessToken
        }
      );
      setInvitation(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "초대 링크를 만들지 못했습니다."
            })
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopy() {
    if (!invitation) {
      return;
    }

    setIsCopying(true);
    await navigator.clipboard.writeText(invitation.inviteUrl);
    setTimeout(() => setIsCopying(false), 900);
  }

  if (isLoading) {
    return <LoadingState description="커플 공간을 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간을 만든 뒤 초대 링크를 생성할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (!currentCouple?.couple) {
    return (
      <EmptyState
        title="커플 공간이 없습니다"
        description="새 커플 공간을 만든 뒤 다시 시도해 주세요."
        action={
          <Link className="button-link" href="/signup">
            공간 만들기
          </Link>
        }
      />
    );
  }

  return (
    <Card
      title={currentCouple.couple.displayName}
      description={
        currentCouple.partnerStatus === "connected"
          ? "이미 파트너가 연결된 공간입니다."
          : "초대 링크를 만들어 파트너에게 전달할 수 있습니다."
      }
    >
      <div className="form-stack">
        <Select
          label="초대 링크 유효기간"
          onChange={(event) => setExpiresInHours(event.target.value)}
          options={expirationOptions}
          value={expiresInHours}
        />

        <Button fullWidth isLoading={isCreating} onClick={handleCreateInvitation}>
          초대 링크 만들기
        </Button>

        {invitation ? (
          <div className="invite-result">
            <p>초대 링크</p>
            <code>{invitation.inviteUrl}</code>
            <div className="action-row">
              <Button isLoading={isCopying} onClick={handleCopy} variant="secondary">
                {isCopying ? "복사됨" : "복사"}
              </Button>
              <Link className="text-link" href={`/invite/${invitation.token}`}>
                링크 열기
              </Link>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="error-box" role="alert">
            {error.error.message}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
