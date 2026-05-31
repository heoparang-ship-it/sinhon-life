import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendKakaoNotify } from "@/lib/notifications/kakao";

export const runtime = "nodejs";

const CATEGORIES = ["sdm", "venue", "interior", "goods", "honeymoon"] as const;
type Category = (typeof CATEGORIES)[number];

const isUuid = (s: unknown): s is string =>
  typeof s === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const isPhone = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9+\-\s()]{9,20}$/.test(s.trim());

function buildNote(note: string | undefined, marketingConsent: boolean): string {
  const tags: string[] = [];
  tags.push(`thirdPartyConsent=true`);
  tags.push(`marketingConsent=${marketingConsent}`);
  tags.push(`consentAt=${new Date().toISOString()}`);
  const base = `[CONSENT ${tags.join(";")}]`;
  const userNote = typeof note === "string" ? note.slice(0, 400) : "";
  return userNote ? `${base} ${userNote}` : base;
}

type Body = {
  sessionId?: string;
  category?: Category;
  slots?: {
    budgetManwon?: number;
    region?: string;
    weddingDate?: string;        // YYYY-MM-DD
    styleTags?: string[];
    priorityTag?: string;
    note?: string;
  };
  contact?: {
    name?: string;
    phone?: string;
    kakao?: string;
  };
  /** 개인정보 수집·이용 동의 (필수) */
  consent?: boolean;
  /** 제3자(매칭 파트너) 제공 동의 (필수 — 송객 매칭에 사용) */
  thirdPartyConsent?: boolean;
  /** 마케팅 정보 수신 동의 (선택) */
  marketingConsent?: boolean;
  sourceMessageId?: string | null;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  if (!isUuid(body.sessionId)) {
    return NextResponse.json({ error: "sessionId 가 올바르지 않아요." }, { status: 400 });
  }
  if (!body.category || !CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: "category 가 올바르지 않아요." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "개인정보 수집·이용 동의가 필요해요." }, { status: 400 });
  }
  if (body.thirdPartyConsent !== true) {
    return NextResponse.json(
      { error: "매칭 파트너에 대한 제3자 제공 동의가 필요해요." },
      { status: 400 },
    );
  }
  const marketingConsent = body.marketingConsent === true;

  const name = body.contact?.name?.trim();
  const phone = body.contact?.phone?.trim();
  if (!name || name.length < 1 || name.length > 30) {
    return NextResponse.json({ error: "이름을 확인해 주세요." }, { status: 400 });
  }
  if (!isPhone(phone)) {
    return NextResponse.json({ error: "연락처 형식을 확인해 주세요." }, { status: 400 });
  }

  const slots = body.slots ?? {};
  const styleTags = Array.isArray(slots.styleTags)
    ? slots.styleTags.filter((t): t is string => typeof t === "string").slice(0, 10)
    : [];

  let weddingDate: string | null = null;
  if (typeof slots.weddingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(slots.weddingDate)) {
    weddingDate = slots.weddingDate;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const { data, error } = await supabase
      .from("decision_leads")
      .insert({
        user_id: userId,
        session_id: body.sessionId,
        category: body.category,
        budget_manwon:
          typeof slots.budgetManwon === "number" && Number.isFinite(slots.budgetManwon)
            ? Math.max(0, Math.min(100000, Math.round(slots.budgetManwon)))
            : null,
        region: typeof slots.region === "string" ? slots.region.slice(0, 50) : null,
        wedding_date: weddingDate,
        style_tags: styleTags,
        priority_tag: typeof slots.priorityTag === "string" ? slots.priorityTag.slice(0, 30) : null,
        contact_name: name,
        contact_phone: phone,
        contact_kakao:
          typeof body.contact?.kakao === "string" ? body.contact.kakao.trim().slice(0, 50) : null,
        consent_at: new Date().toISOString(),
        note: buildNote(slots.note, marketingConsent),
        source_message_id: isUuid(body.sourceMessageId) ? body.sourceMessageId : null,
      })
      .select("id")
      .single();

    if (error) {
      console.warn("/api/leads insert error:", error.message);
      return NextResponse.json({ error: "접수에 실패했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
    }

    // 카카오 알림톡 (stub — provider 미설정 시 콘솔 로그만)
    void sendKakaoNotify({
      to: phone,
      template: "lead.created",
      vars: { category: body.category, region: slots.region ?? null, name },
    });

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    console.warn("/api/leads failed:", e);
    return NextResponse.json({ error: "접수에 실패했어요." }, { status: 500 });
  }
}
