/**
 * 카카오 알림톡 발송 stub.
 *
 * - 실제 발송에는 KakaoBusiness 채널 + 알림톡 템플릿 심사 + 발송 대행사(예: Solapi/NHN/Aligo) 가 필요.
 * - 환경변수 KAKAO_NOTIFY_PROVIDER 가 비어 있으면 "log only" 로 동작 (POC).
 * - 운영 단계에선 이 파일의 `sendKakaoNotify` 본문을 실제 SDK 호출로 교체.
 */

type NotifyTemplate =
  | "lead.created"        // 사용자 리드 접수 → 운영진/파트너 통지
  | "lead.matched"        // 매칭된 파트너 → 사용자에게 안내
  | "partner.welcome";    // 파트너 LOI 접수 확인

export type NotifyParams = {
  to: string;             // 수신자 휴대폰 010-…
  template: NotifyTemplate;
  vars?: Record<string, string | number | null | undefined>;
};

export type NotifyResult =
  | { ok: true; channel: "kakao_alimtalk" | "log" }
  | { ok: false; reason: string };

export async function sendKakaoNotify(params: NotifyParams): Promise<NotifyResult> {
  const provider = process.env.KAKAO_NOTIFY_PROVIDER;

  if (!provider) {
    // POC: 콘솔 로그만
    // eslint-disable-next-line no-console
    console.info("[kakao_notify:stub]", params.template, params.to, params.vars ?? {});
    return { ok: true, channel: "log" };
  }

  // TODO: provider 별 실제 발송 SDK 호출
  // 예: if (provider === "solapi") { ... }
  // eslint-disable-next-line no-console
  console.warn("[kakao_notify] provider configured but no SDK wired:", provider);
  return { ok: false, reason: "provider_not_wired" };
}
