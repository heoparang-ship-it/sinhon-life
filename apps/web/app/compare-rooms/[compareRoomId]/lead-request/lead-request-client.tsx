"use client";

import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select
} from "@sinhon-os/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../../../lib/api";
import type {
  CompareCardSummary,
  CompareRoomDetailResponse
} from "../../../compare-rooms/compare-room-types";
import type { LeadRequestResponse } from "../../../lead-requests/lead-request-types";

type LeadRequestClientProps = {
  compareRoomId: string;
};

type Step = "confirm" | "edit";

const contactMethodOptions = [
  { label: "전화", value: "phone" },
  { label: "문자", value: "sms" },
  { label: "이메일", value: "email" },
  { label: "카카오", value: "kakao" },
  { label: "기타", value: "other" }
];

const contactWindowOptions = [
  { label: "상관없음", value: "any" },
  { label: "오전", value: "morning" },
  { label: "오후", value: "afternoon" },
  { label: "저녁", value: "evening" }
];

const contactMethodLabels: Record<string, string> = {
  email: "이메일",
  kakao: "카카오",
  other: "기타",
  phone: "전화",
  sms: "문자"
};

const contactWindowLabels: Record<string, string> = {
  afternoon: "오후",
  any: "상관없음",
  evening: "저녁",
  morning: "오전"
};

function defaultContactDate() {
  const date = new Date();
  date.setDate(date.getDate() + 5);

  return date.toISOString().slice(0, 10);
}

function formatKrw(amount: number | null) {
  if (amount === null) return "상담 후 산정";

  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amount);
}

function getCardLabel(card: CompareCardSummary) {
  return `${card.snapshotTitle} · ${formatKrw(card.snapshotPriceSummary.estimatedTotalPrice)}`;
}

export function LeadRequestClient({ compareRoomId }: LeadRequestClientProps) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWindow, setContactWindow] = useState("afternoon");
  const [detail, setDetail] = useState<CompareRoomDetailResponse | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preferredContactDate, setPreferredContactDate] = useState(defaultContactDate);
  const [preferredContactMethod, setPreferredContactMethod] = useState("phone");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [step, setStep] = useState<Step>("edit");

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
        const response = await apiRequest<CompareRoomDetailResponse>(
          `/compare-rooms/${compareRoomId}`,
          {
            token
          }
        );
        setDetail(response);
        setSelectedCardId(response.cards[0]?.id ?? "");
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "비교방을 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [compareRoomId]);

  const selectedCard = useMemo(
    () => detail?.cards.find((card) => card.id === selectedCardId) ?? null,
    [detail?.cards, selectedCardId]
  );

  function moveToConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStep("confirm");
  }

  async function submitLeadRequest() {
    if (!accessToken || !selectedCard) return;

    setError(null);
    setIsSaving(true);

    try {
      const response = await apiRequest<LeadRequestResponse>(
        `/compare-rooms/${compareRoomId}/lead-requests`,
        {
          body: {
            compareCardId: selectedCard.id,
            contactName,
            contactPhone,
            message: message || undefined,
            preferredContactDates: [
              {
                date: preferredContactDate,
                window: contactWindow
              }
            ],
            preferredContactMethod,
            privacyConsent
          },
          method: "POST",
          token: accessToken
        }
      );

      router.push(`/lead-requests/${response.leadRequest.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "상담 신청을 접수하지 못했습니다."
            })
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState description="상담 신청 가능한 비교방인지 확인하고 있습니다." />;
  }

  if (!accessToken) {
    return (
      <EmptyState
        title="가입이 필요합니다"
        description="커플 공간에 로그인한 뒤 상담 신청을 진행할 수 있습니다."
        action={
          <Link className="button-link" href="/signup">
            가입 시작
          </Link>
        }
      />
    );
  }

  if (error && !detail) {
    return <ErrorState title="확인이 필요합니다" description={error.error.message} />;
  }

  if (!detail) {
    return (
      <EmptyState
        title="비교방을 찾을 수 없습니다"
        description="비교방 목록에서 다시 선택해 주세요."
        action={
          <Link className="button-link" href="/compare-rooms">
            비교방 목록
          </Link>
        }
      />
    );
  }

  if (!detail.compareRoom.canRequestLead) {
    return (
      <EmptyState
        title="상담 신청 전 승인이 필요합니다"
        description="상품을 2개 이상 담고 두 사람이 모두 승인해야 상담 신청으로 넘어갈 수 있습니다."
        action={
          <Link className="button-link" href={`/compare-rooms/${compareRoomId}`}>
            비교방으로 돌아가기
          </Link>
        }
      />
    );
  }

  if (!selectedCard) {
    return (
      <EmptyState
        title="신청할 상품이 없습니다"
        description="비교방에 담긴 상품을 다시 확인해 주세요."
        action={
          <Link className="button-link" href={`/compare-rooms/${compareRoomId}`}>
            비교방으로 돌아가기
          </Link>
        }
      />
    );
  }

  return (
    <div className="lead-layout">
      {error ? <ErrorState title="확인이 필요합니다" description={error.error.message} /> : null}

      {step === "edit" ? (
        <form className="lead-layout" onSubmit={moveToConfirm}>
          <Card title="상담할 상품" description="파트너에게 전달할 상품을 선택합니다.">
            <Select
              label="상품"
              onChange={(event) => setSelectedCardId(event.target.value)}
              options={detail.cards.map((card) => ({
                label: getCardLabel(card),
                value: card.id
              }))}
              value={selectedCardId}
            />
          </Card>

          <Card title="희망 상담 정보" description="상담 가능 시간과 연락 방식을 선택합니다.">
            <div className="lead-form-grid">
              <DatePicker
                label="상담 희망일"
                onChange={(event) => setPreferredContactDate(event.target.value)}
                required
                value={preferredContactDate}
              />
              <Select
                label="희망 시간대"
                onChange={(event) => setContactWindow(event.target.value)}
                options={contactWindowOptions}
                value={contactWindow}
              />
              <Select
                label="연락 방식"
                onChange={(event) => setPreferredContactMethod(event.target.value)}
                options={contactMethodOptions}
                value={preferredContactMethod}
              />
            </div>
          </Card>

          <Card title="연락처" description="전송 전 확인 화면에서 한 번 더 확인합니다.">
            <div className="lead-form-grid">
              <Input
                label="이름"
                onChange={(event) => setContactName(event.target.value)}
                required
                value={contactName}
              />
              <Input
                label="연락처"
                onChange={(event) => setContactPhone(event.target.value)}
                placeholder="010-0000-0000"
                required
                type="tel"
                value={contactPhone}
              />
            </div>
            <label className="lead-textarea-label">
              문의 내용
              <textarea
                className="lead-textarea"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="확인하고 싶은 날짜, 추가 비용, 상담 요청 내용을 남겨 주세요."
                value={message}
              />
            </label>
          </Card>

          <Card
            title="개인정보 제공 동의"
            description="상담 접수를 위해 선택한 파트너에게 필요한 정보만 전달합니다."
          >
            <Checkbox
              checked={privacyConsent}
              description="이름, 연락처, 희망 상담일, 문의 내용이 파트너와 운영자에게 전달됩니다."
              label="개인정보 제공에 동의합니다"
              onChange={(event) => setPrivacyConsent(event.target.checked)}
              required
            />
            <div className="action-row" style={{ marginTop: 12 }}>
              <Button type="submit">전송 전 확인</Button>
              <Link className="button-link secondary-link" href={`/compare-rooms/${compareRoomId}`}>
                비교방으로
              </Link>
            </div>
          </Card>
        </form>
      ) : (
        <Card title="전송 전 확인" description="아래 정보로 상담 신청을 접수합니다.">
          <dl className="summary-list">
            <div>
              <dt>상품</dt>
              <dd>{selectedCard.snapshotTitle}</dd>
            </div>
            <div>
              <dt>파트너</dt>
              <dd>{selectedCard.offer.vendor.name}</dd>
            </div>
            <div>
              <dt>예상 총액</dt>
              <dd>{formatKrw(selectedCard.snapshotPriceSummary.estimatedTotalPrice)}</dd>
            </div>
            <div>
              <dt>희망 상담</dt>
              <dd>
                {preferredContactDate} · {contactWindowLabels[contactWindow]}
              </dd>
            </div>
            <div>
              <dt>연락 방식</dt>
              <dd>{contactMethodLabels[preferredContactMethod]}</dd>
            </div>
            <div>
              <dt>전달 정보</dt>
              <dd>이름, 연락처, 상담 희망일, 문의 내용</dd>
            </div>
          </dl>
          <div className="notice-box" style={{ marginTop: 14 }}>
            상담 신청은 계약이나 결제가 아닙니다. 파트너가 조건을 확인한 뒤 연락합니다.
          </div>
          <div className="action-row" style={{ marginTop: 16 }}>
            <Button isLoading={isSaving} onClick={() => void submitLeadRequest()} type="button">
              최종 신청
            </Button>
            <Button
              disabled={isSaving}
              onClick={() => setStep("edit")}
              type="button"
              variant="secondary"
            >
              수정
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
