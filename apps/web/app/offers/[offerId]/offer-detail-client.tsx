"use client";

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PriceCard,
  Select
} from "@sinhon-os/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../../lib/api";
import type {
  CompareRoomDetailResponse,
  CompareRoomListResponse,
  CompareRoomSummary,
  CurrentCoupleResponse
} from "../../compare-rooms/compare-room-types";
import type { OfferDetail, OfferDetailResponse, OfferPriceVersion } from "../offer-types";

type OfferDetailClientProps = {
  offerId: string;
};

type CreateCompareRoomResponse = Pick<CompareRoomDetailResponse, "compareRoom">;

const verificationLabels: Record<string, string> = {
  expired: "만료",
  needs_review: "검토 필요",
  rejected: "반려",
  unverified: "검증 대기",
  verified: "검증됨"
};

const validityLabels: Record<string, string> = {
  expired: "만료됨",
  valid: "유효",
  validity_not_recorded: "유효기간 미기록"
};

function formatKrw(amount: number | null) {
  if (amount === null) return "상담 후 산정";

  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "미기록";
  return new Date(value).toLocaleDateString("ko-KR");
}

function getSourceLabel(priceVersion: OfferPriceVersion) {
  const labels: Record<string, string> = {
    admin_seed: "운영 검증",
    admin_test: "운영 검증",
    partner_input: "파트너 입력",
    partner_seed: "파트너 입력"
  };

  return labels[priceVersion.sourceType] ?? priceVersion.sourceType;
}

function PriceVersionRow({ priceVersion }: { priceVersion: OfferPriceVersion }) {
  return (
    <article className={`offer-history-row ${priceVersion.validityStatus}`}>
      <div>
        <span className="offer-badge">v{priceVersion.version}</span>
        <h3>{formatKrw(priceVersion.estimatedTotalPrice)}</h3>
        <p>
          기준가 {formatKrw(priceVersion.basePrice)} ·{" "}
          {verificationLabels[priceVersion.verificationStatus] ?? priceVersion.verificationStatus}
        </p>
      </div>
      <dl className="offer-detail-meta">
        <div>
          <dt>검증일</dt>
          <dd>{formatDate(priceVersion.verifiedAt)}</dd>
        </div>
        <div>
          <dt>유효기간</dt>
          <dd>{formatDate(priceVersion.validUntil)}</dd>
        </div>
        <div>
          <dt>상태</dt>
          <dd>{validityLabels[priceVersion.validityStatus] ?? priceVersion.validityStatus}</dd>
        </div>
      </dl>
    </article>
  );
}

function RepresentativePriceCard({ offer }: { offer: OfferDetail }) {
  const priceVersion = offer.currentPriceVersion;

  if (!priceVersion) {
    return (
      <EmptyState
        title="대표 가격이 없습니다"
        description="현재 검증되고 유효한 가격 버전이 없습니다."
      />
    );
  }

  return (
    <PriceCard
      basePriceAmount={priceVersion.basePrice}
      description={offer.description ?? offer.summary ?? undefined}
      estimatedTotalPriceAmount={priceVersion.estimatedTotalPrice}
      includedItems={priceVersion.includedItems}
      optionalOptions={priceVersion.optionalOptions}
      requiredOptions={priceVersion.requiredOptions}
      sourceLabel={getSourceLabel(priceVersion)}
      sourceUpdatedAt={priceVersion.verifiedAt ?? undefined}
      title={offer.title}
      validUntil={priceVersion.validUntil ?? undefined}
      validityStatus={priceVersion.validityStatus}
      vendorName={`${offer.vendor.name}${offer.region ? ` · ${offer.region}` : ""}`}
      verificationStatus={priceVersion.verificationStatus}
      verifiedAt={priceVersion.verifiedAt ?? undefined}
    />
  );
}

export function OfferDetailClient({ offerId }: OfferDetailClientProps) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [compareRooms, setCompareRooms] = useState<CompareRoomSummary[]>([]);
  const [couple, setCouple] = useState<CurrentCoupleResponse["couple"]>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isCompareSaving, setIsCompareSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [selectedCompareRoomId, setSelectedCompareRoomId] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const token = storedToken;

    async function loadOffer() {
      try {
        const [offerResponse, currentCouple] = await Promise.all([
          apiRequest<OfferDetailResponse>(`/offers/${offerId}`, {
            token
          }),
          apiRequest<CurrentCoupleResponse>("/couples/current", {
            token
          })
        ]);
        setOffer(offerResponse.offer);
        setCouple(currentCouple.couple);

        if (currentCouple.couple) {
          const compareRoomList = await apiRequest<CompareRoomListResponse>(
            `/couples/${currentCouple.couple.id}/compare-rooms`,
            {
              token
            }
          );
          setCompareRooms(compareRoomList.compareRooms);
          setSelectedCompareRoomId(compareRoomList.compareRooms[0]?.id ?? "");
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "상품 상세를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadOffer();
  }, [offerId]);

  async function createCompareRoomWithOffer() {
    if (!accessToken || !couple || !offer?.currentPriceVersion) return;

    setError(null);
    setIsCompareSaving(true);

    try {
      const roomTitle = `${offer.title} 비교`.slice(0, 80);
      const created = await apiRequest<CreateCompareRoomResponse>(
        `/couples/${couple.id}/compare-rooms`,
        {
          body: {
            initialOfferId: offer.id,
            offerPriceVersionId: offer.currentPriceVersion.id,
            title: roomTitle
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
      setIsCompareSaving(false);
    }
  }

  async function addToSelectedCompareRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !offer?.currentPriceVersion || !selectedCompareRoomId) return;

    setError(null);
    setIsCompareSaving(true);

    try {
      await apiRequest<CompareRoomDetailResponse>(`/compare-rooms/${selectedCompareRoomId}/cards`, {
        body: {
          offerId: offer.id,
          offerPriceVersionId: offer.currentPriceVersion.id
        },
        method: "POST",
        token: accessToken
      });
      router.push(`/compare-rooms/${selectedCompareRoomId}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "비교방에 상품을 담지 못했습니다."
            })
      );
    } finally {
      setIsCompareSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="상품 가격 버전을 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 상품 상세를 확인할 수 있습니다."
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

  if (!offer) {
    return (
      <EmptyState
        title="상품을 찾을 수 없습니다"
        description="상품 목록에서 다시 선택해 주세요."
        action={
          <Link className="button-link" href="/offers">
            상품 목록
          </Link>
        }
      />
    );
  }

  return (
    <div className="offer-detail-layout">
      <section className="offer-detail-main" aria-label="대표 가격">
        <RepresentativePriceCard offer={offer} />
        <Card
          title="비교방에 담기"
          description="검증되고 유효한 대표 가격을 비교방에 스냅샷으로 저장합니다."
        >
          {!offer.currentPriceVersion ? (
            <p className="muted-copy">현재 담을 수 있는 가격 버전이 없습니다.</p>
          ) : !couple ? (
            <div className="notice-box">커플 공간을 만든 뒤 비교방에 상품을 담을 수 있습니다.</div>
          ) : (
            <div className="form-stack">
              {compareRooms.length ? (
                <form className="offer-compare-row" onSubmit={addToSelectedCompareRoom}>
                  <Select
                    label="기존 비교방"
                    onChange={(event) => setSelectedCompareRoomId(event.target.value)}
                    options={compareRooms.map((room) => ({
                      label: `${room.title} · 상품 ${room.cardCount}개`,
                      value: room.id
                    }))}
                    value={selectedCompareRoomId}
                  />
                  <Button isLoading={isCompareSaving} type="submit">
                    기존 방에 추가
                  </Button>
                </form>
              ) : null}
              <Button
                isLoading={isCompareSaving}
                onClick={() => void createCompareRoomWithOffer()}
                type="button"
                variant={compareRooms.length ? "secondary" : "primary"}
              >
                새 비교방으로 시작
              </Button>
            </div>
          )}
        </Card>
        <div className="action-row">
          <Link className="button-link secondary-link" href="/offers">
            목록으로
          </Link>
        </div>
      </section>

      <section className="offer-history-panel" aria-label="가격 버전 이력">
        <div>
          <span className="offer-badge">{offer.vendor.name}</span>
          <h2>{offer.title}</h2>
          <p>{offer.summary}</p>
        </div>
        <div className="offer-history-list">
          {offer.priceVersions.map((priceVersion) => (
            <PriceVersionRow key={priceVersion.id} priceVersion={priceVersion} />
          ))}
        </div>
      </section>
    </div>
  );
}
