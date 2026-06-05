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
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";
import type { OfferListResponse, OfferPriceVersion, OfferSummary } from "./offer-types";

type OfferFilters = {
  budgetRange: string;
  category: string;
  region: string;
};

const categoryOptions = [
  { label: "전체", value: "" },
  { label: "스튜디오", value: "studio" },
  { label: "예식", value: "wedding" },
  { label: "가전", value: "appliance" },
  { label: "가구", value: "furniture" },
  { label: "입주", value: "moving" },
  { label: "주거", value: "housing" },
  { label: "허니문", value: "honeymoon" }
];

const regionOptions = [
  { label: "전체", value: "" },
  { label: "서울", value: "서울" },
  { label: "경기", value: "경기" },
  { label: "전국", value: "전국" }
];

const budgetRangeOptions = [
  { label: "전체", value: "" },
  { label: "100만원 미만", value: "under_1m" },
  { label: "100만~300만원", value: "1m_3m" },
  { label: "300만~500만원", value: "3m_5m" },
  { label: "500만~1,000만원", value: "5m_10m" },
  { label: "1,000만원 이상", value: "over_10m" }
];

const categoryLabels: Record<string, string> = {
  appliance: "가전",
  furniture: "가구",
  honeymoon: "허니문",
  housing: "주거",
  moving: "입주",
  studio: "스튜디오",
  wedding: "예식"
};

function buildOfferQuery(filters: OfferFilters) {
  const params = new URLSearchParams({
    limit: "20"
  });

  if (filters.category) params.set("category", filters.category);
  if (filters.region) params.set("region", filters.region);
  if (filters.budgetRange) params.set("budgetRange", filters.budgetRange);

  return `/offers?${params.toString()}`;
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

function OfferSummaryCard({ offer }: { offer: OfferSummary }) {
  const priceVersion = offer.currentPriceVersion;

  if (!priceVersion) {
    return (
      <article className="offer-list-item">
        <div>
          <span className="offer-badge">{categoryLabels[offer.category] ?? offer.category}</span>
          <h3>{offer.title}</h3>
          <p>{offer.summary}</p>
        </div>
        <Link className="button-link secondary-link" href={`/offers/${offer.id}`}>
          상세 보기
        </Link>
      </article>
    );
  }

  return (
    <article className="offer-list-item">
      <PriceCard
        basePriceAmount={priceVersion.basePrice}
        description={offer.summary ?? undefined}
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
      <div className="offer-list-actions">
        <span className="offer-badge">{categoryLabels[offer.category] ?? offer.category}</span>
        <Link className="button-link secondary-link" href={`/offers/${offer.id}`}>
          상세 보기
        </Link>
      </div>
    </article>
  );
}

export function OffersClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [filters, setFilters] = useState<OfferFilters>({
    budgetRange: "",
    category: "",
    region: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offers, setOffers] = useState<OfferSummary[]>([]);

  async function loadOffers(token: string, nextFilters: OfferFilters, refreshing = false) {
    setError(null);
    setIsRefreshing(refreshing);

    try {
      const response = await apiRequest<OfferListResponse>(buildOfferQuery(nextFilters), {
        token
      });
      setOffers(response.offers);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "상품 정보를 불러오지 못했습니다."
            })
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    void loadOffers(storedToken, filters);
  }, []);

  function updateFilter(key: keyof OfferFilters, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    void loadOffers(accessToken, filters, true);
  }

  if (isLoading) {
    return <LoadingState description="검증된 상품 가격을 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 파트너 상품을 확인할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  return (
    <div className="offer-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <Card
        title="상품 필터"
        description="카테고리, 지역, 예산 구간으로 검증된 가격을 좁혀 봅니다."
      >
        <form className="offer-filter-grid" onSubmit={submitFilters}>
          <Select
            label="카테고리"
            onChange={(event) => updateFilter("category", event.target.value)}
            options={categoryOptions}
            value={filters.category}
          />
          <Select
            label="지역"
            onChange={(event) => updateFilter("region", event.target.value)}
            options={regionOptions}
            value={filters.region}
          />
          <Select
            label="예산"
            onChange={(event) => updateFilter("budgetRange", event.target.value)}
            options={budgetRangeOptions}
            value={filters.budgetRange}
          />
          <Button isLoading={isRefreshing} type="submit">
            적용
          </Button>
        </form>
      </Card>

      {offers.length ? (
        <section className="offer-grid" aria-label="상품 목록">
          {offers.map((offer) => (
            <OfferSummaryCard key={offer.id} offer={offer} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="조건에 맞는 상품이 없습니다"
          description="다른 카테고리나 예산 구간으로 다시 확인해 주세요."
        />
      )}
    </div>
  );
}
