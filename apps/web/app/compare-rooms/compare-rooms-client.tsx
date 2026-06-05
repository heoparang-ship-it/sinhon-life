"use client";

import { Button, Card, EmptyState, ErrorState, Input, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";
import type {
  CompareRoomListResponse,
  CompareRoomSummary,
  CurrentCoupleResponse
} from "./compare-room-types";

type CreateCompareRoomResponse = {
  compareRoom: CompareRoomSummary;
};

const statusLabels: Record<string, string> = {
  archived: "보관됨",
  both_approved: "둘 다 승인",
  draft: "초안",
  rejected: "반려",
  shared: "검토 중",
  waiting_partner: "배우자 대기"
};

const approvalLabels: Record<string, string> = {
  approved: "승인",
  hold: "보류",
  pending: "대기",
  rejected: "반려"
};

function statusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function approvalLabel(status: string | null) {
  return status ? (approvalLabels[status] ?? status) : "배우자 대기";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

function CompareRoomListItem({ room }: { room: CompareRoomSummary }) {
  return (
    <Link className={`compare-room-list-item ${room.status}`} href={`/compare-rooms/${room.id}`}>
      <span>
        <strong>{room.title}</strong>
        <small>
          {statusLabel(room.status)} · 상품 {room.cardCount}개 · {formatDate(room.updatedAt)}
        </small>
      </span>
      <span>
        <strong>{approvalLabel(room.myApprovalStatus)}</strong>
        <small>{approvalLabel(room.partnerApprovalStatus)}</small>
      </span>
    </Link>
  );
}

export function CompareRoomsClient() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [couple, setCouple] = useState<CurrentCoupleResponse["couple"]>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rooms, setRooms] = useState<CompareRoomSummary[]>([]);
  const [title, setTitle] = useState("새 상품 비교");

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function loadRooms() {
      try {
        const currentCouple = await apiRequest<CurrentCoupleResponse>("/couples/current", {
          token
        });
        setCouple(currentCouple.couple);

        if (!currentCouple.couple) {
          return;
        }

        const list = await apiRequest<CompareRoomListResponse>(
          `/couples/${currentCouple.couple.id}/compare-rooms`,
          {
            token
          }
        );
        setRooms(list.compareRooms);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "비교방 정보를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadRooms();
  }, []);

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !couple) return;

    setError(null);
    setIsSaving(true);

    try {
      const created = await apiRequest<CreateCompareRoomResponse>(
        `/couples/${couple.id}/compare-rooms`,
        {
          body: {
            title
          },
          method: "POST",
          token: accessToken
        }
      );
      router.push(`/compare-rooms/${created.compareRoom.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "비교방을 만들지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="비교방 목록을 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 비교방을 사용할 수 있습니다."
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
        description="커플 공간을 만든 뒤 함께 비교할 상품을 담을 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            커플 공간 만들기
          </Link>
        }
      />
    );
  }

  return (
    <div className="compare-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <Card
        title={couple.displayName}
        description="상품 상세에서 바로 비교방에 담을 수도 있습니다."
      >
        <form className="compare-create-row" onSubmit={createRoom}>
          <Input
            label="비교방 이름"
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
          <Button isLoading={isSaving} type="submit">
            비교방 만들기
          </Button>
          <Link className="button-link secondary-link" href="/offers">
            상품 보기
          </Link>
        </form>
      </Card>

      {rooms.length ? (
        <section className="compare-room-list" aria-label="비교방 목록">
          {rooms.map((room) => (
            <CompareRoomListItem key={room.id} room={room} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="아직 비교방이 없습니다"
          description="상품을 둘러보고 마음에 드는 가격 카드를 비교방에 담아 보세요."
          action={
            <Link className="button-link" href="/offers">
              상품 보기
            </Link>
          }
        />
      )}
    </div>
  );
}
