"use client";

import { Button, Card, Checkbox, Input, Select } from "@sinhon-os/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { apiRequest, ApiClientError, AUTH_TOKEN_STORAGE_KEY } from "../lib/api";

type RegisterResponse = {
  accessToken: string;
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
  nextStep: string;
  user: {
    displayName: string | null;
    id: string;
    status: string;
  };
};

const lifecycleOptions = [
  { label: "결혼 준비 중", value: "preparing" },
  { label: "혼인 초기", value: "married" },
  { label: "아직 정하지 않음", value: "unknown" }
];

export function SignupForm() {
  const searchParams = useSearchParams();
  const invitationToken = useMemo(
    () => searchParams.get("invitationToken")?.trim() || "",
    [searchParams]
  );
  const [coupleDisplayName, setCoupleDisplayName] = useState("우리 결혼 준비");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState("preparing");
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [phone, setPhone] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const fieldErrors = error?.error.fields ?? {};

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await apiRequest<RegisterResponse>("/auth/register", {
        body: {
          coupleDisplayName: invitationToken ? undefined : coupleDisplayName,
          displayName,
          email,
          invitationToken: invitationToken || undefined,
          lifecycleStatus,
          marketingAccepted,
          phone: phone || undefined,
          privacyAccepted,
          relationshipLabel: relationshipLabel || undefined,
          termsAccepted
        },
        method: "POST"
      });

      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.accessToken);
      setResult(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError
          ? caughtError
          : new ApiClientError({
              code: "NETWORK_ERROR",
              fields: {},
              message: "API 서버에 연결하지 못했습니다."
            })
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <Card
        title={invitationToken ? "커플 공간에 합류했습니다" : "커플 공간을 만들었습니다"}
        description={`${result.user.displayName ?? "사용자"}님, ${result.couple.displayName} 공간이 준비됐습니다.`}
        footer={
          <div className="action-row">
            <Link className="button-link" href="/invite">
              배우자 초대
            </Link>
            <Link className="button-link secondary-link" href="/onboarding">
              온보딩 시작
            </Link>
            <Link className="text-link" href="/">
              홈으로
            </Link>
          </div>
        }
      >
        <dl className="summary-list">
          <div>
            <dt>회원 역할</dt>
            <dd>{result.member.role === "owner" ? "공간 생성자" : "초대 파트너"}</dd>
          </div>
          <div>
            <dt>다음 상태</dt>
            <dd>{result.nextStep === "invite_partner" ? "배우자 초대" : "공동 온보딩"}</dd>
          </div>
        </dl>
      </Card>
    );
  }

  return (
    <Card
      title={invitationToken ? "초대받은 계정 만들기" : "새 커플 공간 만들기"}
      description={
        invitationToken
          ? "가입이 끝나면 초대한 커플 공간에 바로 합류합니다."
          : "가입이 끝나면 배우자를 초대할 수 있습니다."
      }
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        {invitationToken ? (
          <div className="notice-box" role="status">
            초대 링크가 적용됐습니다.
          </div>
        ) : (
          <Input
            error={fieldErrors.coupleDisplayName?.[0]}
            label="커플 공간 이름"
            onChange={(event) => setCoupleDisplayName(event.target.value)}
            required
            value={coupleDisplayName}
          />
        )}

        <div className="form-grid">
          <Input
            error={fieldErrors.displayName?.[0]}
            label="내 이름"
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
          <Input
            error={fieldErrors.email?.[0]}
            label="이메일"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>

        <div className="form-grid">
          <Input
            error={fieldErrors.phone?.[0]}
            label="전화번호"
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            value={phone}
          />
          <Input
            label="내 표시 이름"
            onChange={(event) => setRelationshipLabel(event.target.value)}
            value={relationshipLabel}
          />
        </div>

        {!invitationToken ? (
          <Select
            label="현재 상태"
            onChange={(event) => setLifecycleStatus(event.target.value)}
            options={lifecycleOptions}
            value={lifecycleStatus}
          />
        ) : null}

        <div className="consent-list">
          <Checkbox
            checked={termsAccepted}
            label="이용약관에 동의합니다"
            onChange={(event) => setTermsAccepted(event.target.checked)}
            required
          />
          <Checkbox
            checked={privacyAccepted}
            label="개인정보 처리에 동의합니다"
            onChange={(event) => setPrivacyAccepted(event.target.checked)}
            required
          />
          <Checkbox
            checked={marketingAccepted}
            label="서비스 소식 수신에 동의합니다"
            onChange={(event) => setMarketingAccepted(event.target.checked)}
          />
        </div>

        {error ? (
          <div className="error-box" role="alert">
            {error.error.message}
          </div>
        ) : null}

        <Button fullWidth isLoading={isSubmitting} type="submit">
          {invitationToken ? "가입하고 합류" : "가입하고 공간 만들기"}
        </Button>
      </form>
    </Card>
  );
}
