/**
 * 운영자(사장님) 즉시 알림 — 광고 ON 시 리드 들어오면 30초 안에 인지하기 위함.
 *
 * 동작 우선순위:
 * 1) SLACK_LEAD_WEBHOOK_URL 있으면 Slack incoming webhook
 * 2) RESEND_API_KEY + OPERATOR_EMAIL 있으면 Resend 이메일
 * 3) 그 외엔 콘솔 로그만 (no-op, 절대 throw 하지 않음)
 *
 * 정책: 개인정보 최소화 — 메시지 본문엔 *마스킹된* 연락처만, 전체 데이터는 Supabase 콘솔에서 확인.
 */

export type OperatorAlertPayload = {
  source: "ai_chat" | "landing" | "partner_loi" | "other";
  category?: string | null;
  region?: string | null;
  budgetManwon?: number | null;
  weddingDate?: string | null;
  contactName: string;
  contactPhone: string;
  contactKakao?: string | null;
  note?: string | null;
  utm?: Record<string, string | undefined>;
};

function mask(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 8) return "***";
  return digits.slice(0, 3) + "-****-" + digits.slice(-4);
}

function buildText(p: OperatorAlertPayload): string {
  const lines: string[] = [];
  lines.push(`🔔 새 리드 (${p.source})`);
  lines.push(`👤 ${p.contactName} · ${mask(p.contactPhone)}`);
  if (p.contactKakao) lines.push(`💬 카카오: ${p.contactKakao}`);
  if (p.category) lines.push(`📂 카테고리: ${p.category}`);
  if (p.region) lines.push(`📍 지역: ${p.region}`);
  if (typeof p.budgetManwon === "number") lines.push(`💰 예산: ${p.budgetManwon}만원`);
  if (p.weddingDate) lines.push(`📅 예식일: ${p.weddingDate}`);
  if (p.utm && Object.keys(p.utm).length > 0) {
    const utmStr = Object.entries(p.utm)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join(" ");
    if (utmStr) lines.push(`🎯 ${utmStr}`);
  }
  if (p.note) lines.push(`📝 ${p.note.slice(0, 160)}`);
  lines.push(`상세: Supabase decision_leads`);
  return lines.join("\n");
}

async function sendSlack(text: string): Promise<boolean> {
  const url = process.env.SLACK_LEAD_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch (e) {
    console.warn("[operator_alert:slack] failed", e);
    return false;
  }
}

async function sendResendEmail(text: string, subject: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OPERATOR_EMAIL;
  const from = process.env.RESEND_FROM || "신혼생활 알림 <onboarding@resend.dev>";
  if (!apiKey || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn("[operator_alert:resend] failed", e);
    return false;
  }
}

export async function notifyOperator(payload: OperatorAlertPayload): Promise<void> {
  const text = buildText(payload);
  const subject = `🔔 ${payload.source} 리드 — ${payload.contactName} (${payload.region ?? "-"})`;

  // 두 채널 모두 시도 (둘 다 켜져 있으면 둘 다 발송)
  const [slackOk, emailOk] = await Promise.all([sendSlack(text), sendResendEmail(text, subject)]);

  if (!slackOk && !emailOk) {
    // eslint-disable-next-line no-console
    console.info("[operator_alert:stub]", subject, text);
  }
}
