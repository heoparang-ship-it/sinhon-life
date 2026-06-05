"use client";

import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Select } from "@sinhon-os/ui";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_AUTH_TOKEN_STORAGE_KEY, apiRequest, ApiClientError } from "./lib/api";
import type {
  AdminLeadRequest,
  AdminLeadRequestListResponse,
  AdminLeadRequestResponse
} from "./lead-types";

type AdminMeResponse = {
  roles: string[];
  user: {
    displayName: string | null;
    isAdmin?: boolean;
    status: string;
  };
};

type VendorSummary = {
  category: string;
  description: string | null;
  id: string;
  name: string;
  region: string | null;
  status: string;
  verificationStatus: string;
  verifiedAt: string | null;
};

type OfferSummary = {
  category: string;
  currentPriceVersion: PriceVersion | null;
  id: string;
  region: string | null;
  status: string;
  summary: string;
  title: string;
  vendor: {
    id: string;
    name: string;
  };
};

type PriceVersion = {
  basePrice: number | null;
  estimatedTotalPrice: number | null;
  id: string;
  validUntil: string | null;
  verificationStatus: string;
  version: number;
};

type PolicyProgramSummary = {
  category: string;
  id: string;
  name: string;
  providerName: string;
  region: string | null;
  status: string;
};

type ArticleSummary = {
  category: string;
  id: string;
  ogImageUrl: string | null;
  publishedAt: string | null;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: string;
  summary: string | null;
  title: string;
};

type VendorListResponse = {
  vendors: VendorSummary[];
};

type VendorResponse = {
  vendor: VendorSummary;
};

type OfferListResponse = {
  offers: OfferSummary[];
};

type OfferResponse = {
  offer: OfferSummary;
};

type PriceVersionResponse = {
  priceVersion: PriceVersion | null;
};

type PolicyProgramListResponse = {
  policyPrograms: PolicyProgramSummary[];
};

type PolicyProgramResponse = {
  policyProgram: PolicyProgramSummary;
};

type ArticleListResponse = {
  articles: ArticleSummary[];
};

type ArticleResponse = {
  article: ArticleSummary;
};

type FunnelStepMetric = {
  count: number;
  eventName: string;
  step: number;
};

type FunnelResponse = {
  funnel: FunnelStepMetric[];
};

type ActiveTab =
  | "analytics"
  | "content"
  | "leads"
  | "offers"
  | "overview"
  | "partners"
  | "policies";

const statusOptions = [
  { label: "활성", value: "active" },
  { label: "초안", value: "draft" },
  { label: "일시 중지", value: "paused" },
  { label: "보관", value: "archived" }
];

const verificationOptions = [
  { label: "검증됨", value: "verified" },
  { label: "미검증", value: "unverified" },
  { label: "검토 필요", value: "needs_review" },
  { label: "만료", value: "expired" },
  { label: "반려", value: "rejected" }
];

const leadStatusOptions = [
  { label: "확인됨", value: "viewed" },
  { label: "접수 승인", value: "accepted" },
  { label: "연락 완료", value: "contacted" },
  { label: "상담 예약", value: "booked" },
  { label: "반려", value: "rejected" },
  { label: "만료", value: "expired" }
];

const policyStatusOptions = [
  { label: "활성", value: "active" },
  { label: "초안", value: "draft" },
  { label: "숨김", value: "hidden" },
  { label: "만료", value: "expired" },
  { label: "보관", value: "retired" }
];

const webBaseUrl = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? "http://localhost:3000";

const tabs: Array<{ label: string; value: ActiveTab }> = [
  { label: "요약", value: "overview" },
  { label: "파트너", value: "partners" },
  { label: "상품·가격", value: "offers" },
  { label: "리드", value: "leads" },
  { label: "정책", value: "policies" },
  { label: "콘텐츠", value: "content" },
  { label: "분석", value: "analytics" }
];

const funnelLabels: Record<string, string> = {
  account_created: "계정 생성",
  approval_submitted: "승인 제출",
  both_approved: "둘 다 승인",
  compare_room_created: "비교방 생성",
  couple_created: "커플 생성",
  lead_submitted: "상담 신청",
  onboarding_completed: "온보딩 완료",
  partner_invited: "배우자 초대",
  partner_joined: "배우자 합류",
  policy_check_completed: "정책 확인",
  scenario_created: "시나리오 생성",
  scenario_evaluated: "시나리오 재계산"
};

function formatKrw(value: number | null) {
  if (value === null) return "금액 없음";

  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function DashboardMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-metric">
      <span>{label}</span>
      <strong>{value.toLocaleString("ko-KR")}</strong>
    </div>
  );
}

export function AdminCrmDashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [adminUser, setAdminUser] = useState<AdminMeResponse["user"] | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [leadRequests, setLeadRequests] = useState<AdminLeadRequest[]>([]);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [funnel, setFunnel] = useState<FunnelStepMetric[]>([]);
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [policies, setPolicies] = useState<PolicyProgramSummary[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [tokenInput, setTokenInput] = useState("");
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [vendorForm, setVendorForm] = useState({
    category: "studio",
    name: "",
    region: "서울",
    status: "active",
    verificationStatus: "verified"
  });
  const [offerForm, setOfferForm] = useState({
    category: "studio",
    region: "서울",
    status: "active",
    summary: "",
    title: "",
    vendorId: ""
  });
  const [priceForm, setPriceForm] = useState({
    basePrice: "",
    includedItemLabel: "기본 상담",
    offerId: "",
    sourceType: "admin_input",
    validUntil: "",
    verificationStatus: "unverified"
  });
  const [policyForm, setPolicyForm] = useState({
    category: "housing",
    name: "",
    providerName: "",
    region: "전국",
    sourceUrl: "https://example.com/policies/admin-input",
    status: "draft",
    summary: ""
  });
  const [articleForm, setArticleForm] = useState({
    body: "",
    category: "budget",
    ogImageUrl: "",
    seoDescription: "",
    seoTitle: "",
    slug: "",
    status: "draft",
    summary: "",
    title: ""
  });

  const selectedVendor = useMemo(
    () => vendors.find((vendor) => vendor.id === selectedVendorId) ?? vendors[0] ?? null,
    [selectedVendorId, vendors]
  );
  const selectedVendorOffers = useMemo(
    () => offers.filter((offer) => offer.vendor.id === selectedVendor?.id),
    [offers, selectedVendor?.id]
  );

  async function loadDashboard(token: string) {
    setError(null);
    setIsLoading(true);

    try {
      const [me, vendorList, offerList, leadList, policyList, articleList, funnelResponse] =
        await Promise.all([
          apiRequest<AdminMeResponse>("/auth/me", { token }),
          apiRequest<VendorListResponse>("/vendors?includeInactive=true&limit=50", { token }),
          apiRequest<OfferListResponse>(
            "/admin/offers?includeUnverified=true&validOnly=false&limit=50",
            {
              token
            }
          ),
          apiRequest<AdminLeadRequestListResponse>("/admin/lead-requests?limit=50", { token }),
          apiRequest<PolicyProgramListResponse>("/policy-programs?includeInactive=true&limit=50", {
            token
          }),
          apiRequest<ArticleListResponse>("/admin/articles?includeDrafts=true&limit=50", { token }),
          apiRequest<FunnelResponse>("/admin/analytics/funnel", { token })
        ]);
      setAdminUser(me.user);
      setVendors(vendorList.vendors);
      setOffers(offerList.offers);
      setLeadRequests(leadList.leadRequests);
      setPolicies(policyList.policyPrograms);
      setArticles(articleList.articles);
      setFunnel(funnelResponse.funnel);
      setSelectedVendorId((current) => current || vendorList.vendors[0]?.id || "");
      setOfferForm((current) => ({
        ...current,
        vendorId: current.vendorId || vendorList.vendors[0]?.id || ""
      }));
      setPriceForm((current) => ({
        ...current,
        offerId: current.offerId || offerList.offers[0]?.id || ""
      }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "CRM 데이터를 불러오지 못했습니다."
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

    void loadDashboard(storedToken);
  }, []);

  function saveToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem(ADMIN_AUTH_TOKEN_STORAGE_KEY, tokenInput);
    setAccessToken(tokenInput);
    void loadDashboard(tokenInput);
  }

  async function refresh() {
    if (!accessToken) return;

    await loadDashboard(accessToken);
  }

  async function createVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSaving(true);
    setError(null);

    try {
      const created = await apiRequest<VendorResponse>("/admin/vendors", {
        body: vendorForm,
        method: "POST",
        token: accessToken
      });
      setVendors((current) => [created.vendor, ...current]);
      setSelectedVendorId(created.vendor.id);
      setOfferForm((current) => ({ ...current, vendorId: created.vendor.id }));
      setVendorForm((current) => ({ ...current, name: "" }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "파트너를 등록하지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !offerForm.vendorId) return;

    setIsSaving(true);
    setError(null);

    try {
      const created = await apiRequest<OfferResponse>(
        `/admin/vendors/${offerForm.vendorId}/offers`,
        {
          body: {
            category: offerForm.category,
            region: offerForm.region,
            status: offerForm.status,
            summary: offerForm.summary,
            title: offerForm.title
          },
          method: "POST",
          token: accessToken
        }
      );
      setOffers((current) => [created.offer, ...current]);
      setPriceForm((current) => ({ ...current, offerId: created.offer.id }));
      setOfferForm((current) => ({ ...current, summary: "", title: "" }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "상품을 만들지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateOfferStatus(offer: OfferSummary, status: string) {
    if (!accessToken) return;

    setPendingId(offer.id);
    setError(null);

    try {
      const updated = await apiRequest<OfferResponse>(`/admin/offers/${offer.id}`, {
        body: { status },
        method: "PATCH",
        token: accessToken
      });
      setOffers((current) =>
        current.map((item) => (item.id === updated.offer.id ? updated.offer : item))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "상품 상태를 바꾸지 못했습니다."
            })
      );
    } finally {
      setPendingId(null);
    }
  }

  async function createPriceVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !priceForm.offerId) return;

    setIsSaving(true);
    setError(null);

    try {
      await apiRequest<PriceVersionResponse>(`/admin/offers/${priceForm.offerId}/price-versions`, {
        body: {
          basePrice: Number(priceForm.basePrice),
          includedItems: [
            {
              key: "admin_item",
              label: priceForm.includedItemLabel
            }
          ],
          sourceType: priceForm.sourceType,
          validUntil: toIsoDateTime(priceForm.validUntil),
          verificationStatus: priceForm.verificationStatus
        },
        method: "POST",
        token: accessToken
      });
      setPriceForm((current) => ({ ...current, basePrice: "", validUntil: "" }));
      await refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "가격 버전을 만들지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updatePriceStatus(priceVersion: PriceVersion, verificationStatus: string) {
    if (!accessToken) return;

    setPendingId(priceVersion.id);
    setError(null);

    try {
      await apiRequest<PriceVersionResponse>(`/admin/offer-price-versions/${priceVersion.id}`, {
        body: {
          verificationStatus
        },
        method: "PATCH",
        token: accessToken
      });
      await refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "가격 검증 상태를 바꾸지 못했습니다."
            })
      );
    } finally {
      setPendingId(null);
    }
  }

  async function updateLeadStatus(leadId: string, status: string) {
    if (!accessToken) return;

    setPendingId(leadId);
    setError(null);

    try {
      const response = await apiRequest<AdminLeadRequestResponse>(
        `/admin/lead-requests/${leadId}/status`,
        {
          body: {
            reason: "운영 CRM에서 상태를 변경했습니다.",
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
      setPendingId(null);
    }
  }

  async function createPolicyProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSaving(true);
    setError(null);

    try {
      const created = await apiRequest<PolicyProgramResponse>("/admin/policy-programs", {
        body: {
          ...policyForm,
          cautionText: "운영 정책 확정 필요",
          sourceUpdatedAt: new Date().toISOString(),
          verifiedAt: policyForm.status === "active" ? new Date().toISOString() : undefined
        },
        method: "POST",
        token: accessToken
      });
      setPolicies((current) => [created.policyProgram, ...current]);
      setPolicyForm((current) => ({ ...current, name: "", providerName: "", summary: "" }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "정책 프로그램을 등록하지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSaving(true);
    setError(null);

    try {
      const created = await apiRequest<ArticleResponse>("/admin/articles", {
        body: {
          body: articleForm.body,
          category: articleForm.category,
          ogImageUrl: articleForm.ogImageUrl || undefined,
          seoDescription: articleForm.seoDescription || undefined,
          seoTitle: articleForm.seoTitle || undefined,
          slug: articleForm.slug,
          status: articleForm.status,
          summary: articleForm.summary || undefined,
          title: articleForm.title
        },
        method: "POST",
        token: accessToken
      });
      setArticles((current) => [created.article, ...current]);
      setArticleForm((current) => ({
        ...current,
        body: "",
        ogImageUrl: "",
        seoDescription: "",
        seoTitle: "",
        slug: "",
        summary: "",
        title: ""
      }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "글을 저장하지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function publishArticle(article: ArticleSummary, publish: boolean) {
    if (!accessToken) return;

    setPendingId(article.id);
    setError(null);

    try {
      const response = await apiRequest<ArticleResponse>(`/admin/articles/${article.id}/publish`, {
        body: { publish },
        method: "POST",
        token: accessToken
      });
      setArticles((current) =>
        current.map((item) => (item.id === article.id ? response.article : item))
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "글 공개 상태를 바꾸지 못했습니다."
            })
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="admin-layout">
      <Card
        title="운영 접근"
        description="운영자 권한이 있는 accessToken만 CRM API를 사용할 수 있습니다."
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
        {adminUser ? (
          <p className="admin-small-copy">
            {adminUser.displayName ?? "운영자"} · {adminUser.status}
          </p>
        ) : null}
      </Card>

      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      <nav className="admin-tabs" aria-label="CRM 보기">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.value ? "active" : ""}
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {isLoading ? (
        <LoadingState description="운영 CRM 데이터를 불러오고 있습니다." />
      ) : !accessToken ? (
        <EmptyState
          title="운영 토큰이 필요합니다"
          description="API에서 발급된 운영자 토큰을 저장한 뒤 CRM을 조회합니다."
        />
      ) : (
        <>
          {activeTab === "overview" ? (
            <section className="admin-metric-grid" aria-label="CRM 요약">
              <DashboardMetric label="파트너" value={vendors.length} />
              <DashboardMetric label="상품" value={offers.length} />
              <DashboardMetric label="리드" value={leadRequests.length} />
              <DashboardMetric label="정책" value={policies.length} />
              <DashboardMetric label="콘텐츠" value={articles.length} />
              <DashboardMetric
                label="퍼널 이벤트"
                value={funnel.reduce((sum, step) => sum + step.count, 0)}
              />
            </section>
          ) : null}

          {activeTab === "partners" ? (
            <section className="admin-crm-grid" aria-label="파트너 관리">
              <Card title="파트너 등록">
                <form className="admin-form-grid" onSubmit={createVendor}>
                  <Input
                    label="파트너명"
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                    value={vendorForm.name}
                  />
                  <Input
                    label="카테고리"
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, category: event.target.value }))
                    }
                    required
                    value={vendorForm.category}
                  />
                  <Input
                    label="지역"
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, region: event.target.value }))
                    }
                    value={vendorForm.region}
                  />
                  <Select
                    label="상태"
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, status: event.target.value }))
                    }
                    options={statusOptions}
                    value={vendorForm.status}
                  />
                  <Select
                    label="검증"
                    onChange={(event) =>
                      setVendorForm((current) => ({
                        ...current,
                        verificationStatus: event.target.value
                      }))
                    }
                    options={verificationOptions}
                    value={vendorForm.verificationStatus}
                  />
                  <Button isLoading={isSaving} type="submit">
                    등록
                  </Button>
                </form>
              </Card>
              <Card title="파트너 목록" description="선택하면 상세와 연결 상품을 확인합니다.">
                <div className="admin-entity-list">
                  {vendors.map((vendor) => (
                    <button
                      className={vendor.id === selectedVendor?.id ? "active" : ""}
                      key={vendor.id}
                      onClick={() => setSelectedVendorId(vendor.id)}
                      type="button"
                    >
                      <strong>{vendor.name}</strong>
                      <span>
                        {vendor.category} · {vendor.status} · {vendor.verificationStatus}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
              <Card title="파트너 상세">
                {selectedVendor ? (
                  <dl className="summary-list">
                    <div>
                      <dt>이름</dt>
                      <dd>{selectedVendor.name}</dd>
                    </div>
                    <div>
                      <dt>지역</dt>
                      <dd>{selectedVendor.region ?? "미기록"}</dd>
                    </div>
                    <div>
                      <dt>검증</dt>
                      <dd>{selectedVendor.verificationStatus}</dd>
                    </div>
                    <div>
                      <dt>연결 상품</dt>
                      <dd>{selectedVendorOffers.length}</dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyState
                    title="파트너가 없습니다"
                    description="파트너를 먼저 등록해 주세요."
                  />
                )}
              </Card>
            </section>
          ) : null}

          {activeTab === "offers" ? (
            <section className="admin-crm-grid" aria-label="상품과 가격 관리">
              <Card title="상품 생성">
                <form className="admin-form-grid" onSubmit={createOffer}>
                  <Select
                    label="파트너"
                    onChange={(event) =>
                      setOfferForm((current) => ({ ...current, vendorId: event.target.value }))
                    }
                    options={vendors.map((vendor) => ({ label: vendor.name, value: vendor.id }))}
                    value={offerForm.vendorId}
                  />
                  <Input
                    label="상품명"
                    onChange={(event) =>
                      setOfferForm((current) => ({ ...current, title: event.target.value }))
                    }
                    required
                    value={offerForm.title}
                  />
                  <Input
                    label="요약"
                    onChange={(event) =>
                      setOfferForm((current) => ({ ...current, summary: event.target.value }))
                    }
                    required
                    value={offerForm.summary}
                  />
                  <Input
                    label="카테고리"
                    onChange={(event) =>
                      setOfferForm((current) => ({ ...current, category: event.target.value }))
                    }
                    required
                    value={offerForm.category}
                  />
                  <Select
                    label="상태"
                    onChange={(event) =>
                      setOfferForm((current) => ({ ...current, status: event.target.value }))
                    }
                    options={statusOptions}
                    value={offerForm.status}
                  />
                  <Button isLoading={isSaving} type="submit">
                    상품 만들기
                  </Button>
                </form>
              </Card>

              <Card title="가격 버전 생성">
                <form className="admin-form-grid" onSubmit={createPriceVersion}>
                  <Select
                    label="상품"
                    onChange={(event) =>
                      setPriceForm((current) => ({ ...current, offerId: event.target.value }))
                    }
                    options={offers.map((offer) => ({ label: offer.title, value: offer.id }))}
                    value={priceForm.offerId}
                  />
                  <Input
                    label="기본가"
                    min="0"
                    onChange={(event) =>
                      setPriceForm((current) => ({ ...current, basePrice: event.target.value }))
                    }
                    required
                    type="number"
                    value={priceForm.basePrice}
                  />
                  <Input
                    label="포함 항목"
                    onChange={(event) =>
                      setPriceForm((current) => ({
                        ...current,
                        includedItemLabel: event.target.value
                      }))
                    }
                    required
                    value={priceForm.includedItemLabel}
                  />
                  <Input
                    label="유효기간"
                    onChange={(event) =>
                      setPriceForm((current) => ({ ...current, validUntil: event.target.value }))
                    }
                    type="datetime-local"
                    value={priceForm.validUntil}
                  />
                  <Select
                    label="검증"
                    onChange={(event) =>
                      setPriceForm((current) => ({
                        ...current,
                        verificationStatus: event.target.value
                      }))
                    }
                    options={verificationOptions}
                    value={priceForm.verificationStatus}
                  />
                  <Button isLoading={isSaving} type="submit">
                    가격 만들기
                  </Button>
                </form>
              </Card>

              <section className="admin-lead-list" aria-label="상품 목록">
                {offers.map((offer) => (
                  <article className="admin-lead-row" key={offer.id}>
                    <div>
                      <span className={`admin-status ${offer.status}`}>{offer.status}</span>
                      <h3>{offer.title}</h3>
                      <p>
                        {offer.vendor.name} · {offer.category} ·{" "}
                        {formatKrw(offer.currentPriceVersion?.estimatedTotalPrice ?? null)}
                      </p>
                    </div>
                    <div className="admin-lead-actions">
                      <Select
                        label="상품 상태"
                        onChange={(event) => void updateOfferStatus(offer, event.target.value)}
                        options={statusOptions}
                        value={offer.status}
                      />
                      {offer.currentPriceVersion ? (
                        <Select
                          label="가격 검증"
                          onChange={(event) =>
                            void updatePriceStatus(offer.currentPriceVersion!, event.target.value)
                          }
                          options={verificationOptions}
                          value={offer.currentPriceVersion.verificationStatus}
                        />
                      ) : null}
                      {pendingId === offer.id || pendingId === offer.currentPriceVersion?.id ? (
                        <span className="admin-small-copy">저장 중</span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </section>
            </section>
          ) : null}

          {activeTab === "leads" ? (
            <section className="admin-lead-list" aria-label="상담 신청 리드">
              {leadRequests.length ? (
                leadRequests.map((lead) => (
                  <article className="admin-lead-row" key={lead.id}>
                    <div>
                      <span className={`admin-status ${lead.status}`}>{lead.status}</span>
                      <h3>{lead.compareCard?.snapshotTitle ?? "상담 상품"}</h3>
                      <p>
                        {lead.vendor.name} · {lead.contactPhoneMasked ?? "마스킹"} ·{" "}
                        {new Date(lead.submittedAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="admin-lead-actions">
                      <Select
                        label="상태"
                        onChange={(event) => void updateLeadStatus(lead.id, event.target.value)}
                        options={leadStatusOptions}
                        value={lead.status === "submitted" ? "viewed" : lead.status}
                      />
                      <Link
                        className="button-link secondary-link"
                        href={`/partner/lead-requests/${lead.id}`}
                      >
                        파트너 보기
                      </Link>
                      {pendingId === lead.id ? (
                        <span className="admin-small-copy">저장 중</span>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="접수된 상담 신청이 없습니다"
                  description="사용자 앱에서 상담 신청을 만들면 여기에 표시됩니다."
                />
              )}
            </section>
          ) : null}

          {activeTab === "policies" ? (
            <section className="admin-crm-grid" aria-label="정책 관리">
              <Card title="정책 프로그램 등록">
                <form className="admin-form-grid" onSubmit={createPolicyProgram}>
                  <Input
                    label="정책명"
                    onChange={(event) =>
                      setPolicyForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                    value={policyForm.name}
                  />
                  <Input
                    label="기관"
                    onChange={(event) =>
                      setPolicyForm((current) => ({ ...current, providerName: event.target.value }))
                    }
                    required
                    value={policyForm.providerName}
                  />
                  <Input
                    label="요약"
                    onChange={(event) =>
                      setPolicyForm((current) => ({ ...current, summary: event.target.value }))
                    }
                    required
                    value={policyForm.summary}
                  />
                  <Input
                    label="카테고리"
                    onChange={(event) =>
                      setPolicyForm((current) => ({ ...current, category: event.target.value }))
                    }
                    required
                    value={policyForm.category}
                  />
                  <Select
                    label="상태"
                    onChange={(event) =>
                      setPolicyForm((current) => ({ ...current, status: event.target.value }))
                    }
                    options={policyStatusOptions}
                    value={policyForm.status}
                  />
                  <Button isLoading={isSaving} type="submit">
                    정책 등록
                  </Button>
                </form>
              </Card>
              <section className="admin-entity-list" aria-label="정책 목록">
                {policies.map((policy) => (
                  <button key={policy.id} type="button">
                    <strong>{policy.name}</strong>
                    <span>
                      {policy.providerName} · {policy.category} · {policy.status}
                    </span>
                  </button>
                ))}
              </section>
            </section>
          ) : null}

          {activeTab === "content" ? (
            <section className="admin-crm-grid" aria-label="콘텐츠 CMS">
              <Card title="글 작성">
                <form className="admin-form-grid wide-form" onSubmit={createArticle}>
                  <Input
                    label="제목"
                    onChange={(event) =>
                      setArticleForm((current) => ({ ...current, title: event.target.value }))
                    }
                    required
                    value={articleForm.title}
                  />
                  <Input
                    label="slug"
                    onChange={(event) =>
                      setArticleForm((current) => ({ ...current, slug: event.target.value }))
                    }
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    required
                    value={articleForm.slug}
                  />
                  <Input
                    label="카테고리"
                    onChange={(event) =>
                      setArticleForm((current) => ({ ...current, category: event.target.value }))
                    }
                    required
                    value={articleForm.category}
                  />
                  <Select
                    label="상태"
                    onChange={(event) =>
                      setArticleForm((current) => ({ ...current, status: event.target.value }))
                    }
                    options={[
                      { label: "초안", value: "draft" },
                      { label: "공개", value: "published" },
                      { label: "보관", value: "archived" }
                    ]}
                    value={articleForm.status}
                  />
                  <Input
                    label="요약"
                    onChange={(event) =>
                      setArticleForm((current) => ({ ...current, summary: event.target.value }))
                    }
                    value={articleForm.summary}
                  />
                  <Input
                    label="SEO 제목"
                    onChange={(event) =>
                      setArticleForm((current) => ({ ...current, seoTitle: event.target.value }))
                    }
                    value={articleForm.seoTitle}
                  />
                  <Input
                    label="SEO 설명"
                    onChange={(event) =>
                      setArticleForm((current) => ({
                        ...current,
                        seoDescription: event.target.value
                      }))
                    }
                    value={articleForm.seoDescription}
                  />
                  <Input
                    label="OG 이미지 URL"
                    onChange={(event) =>
                      setArticleForm((current) => ({ ...current, ogImageUrl: event.target.value }))
                    }
                    type="url"
                    value={articleForm.ogImageUrl}
                  />
                  <label className="admin-textarea-label">
                    <span>본문</span>
                    <textarea
                      onChange={(event) =>
                        setArticleForm((current) => ({ ...current, body: event.target.value }))
                      }
                      required
                      rows={8}
                      value={articleForm.body}
                    />
                  </label>
                  <Button isLoading={isSaving} type="submit">
                    글 저장
                  </Button>
                </form>
              </Card>
              <section className="admin-lead-list" aria-label="글 목록">
                {articles.length ? (
                  articles.map((article) => (
                    <article className="admin-lead-row" key={article.id}>
                      <div>
                        <span className={`admin-status ${article.status}`}>{article.status}</span>
                        <h3>{article.title}</h3>
                        <p>
                          {article.category} · /articles/{article.slug}
                        </p>
                        <p>{article.seoTitle}</p>
                      </div>
                      <div className="admin-lead-actions">
                        <Button
                          isLoading={pendingId === article.id}
                          onClick={() =>
                            void publishArticle(article, article.status !== "published")
                          }
                          type="button"
                          variant={article.status === "published" ? "secondary" : "primary"}
                        >
                          {article.status === "published" ? "비공개" : "공개"}
                        </Button>
                        <a
                          className="button-link secondary-link"
                          href={`${webBaseUrl}/articles/${article.slug}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          보기
                        </a>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="등록된 글이 없습니다"
                    description="첫 글을 초안으로 저장합니다."
                  />
                )}
              </section>
            </section>
          ) : null}

          {activeTab === "analytics" ? (
            <section className="admin-lead-list" aria-label="분석 퍼널">
              {funnel.map((step) => (
                <article className="admin-funnel-row" key={step.eventName}>
                  <span>{step.step}</span>
                  <div>
                    <strong>{funnelLabels[step.eventName] ?? step.eventName}</strong>
                    <small>{step.eventName}</small>
                  </div>
                  <b>{step.count.toLocaleString("ko-KR")}</b>
                </article>
              ))}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
