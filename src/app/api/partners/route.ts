import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CATEGORIES = ["sdm", "venue", "interior", "goods", "honeymoon"] as const;

const isPhone = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9+\-\s()]{9,20}$/.test(s.trim());

const isEmail = (s: unknown): s is string =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

type Body = {
  companyName?: string;
  representativeName?: string;
  contactPhone?: string;
  contactEmail?: string;
  categories?: string[];
  region?: string;
  monthlyVolume?: number;
  message?: string;
  consent?: boolean;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  if (body.consent !== true)
    return NextResponse.json({ error: "개인정보 수집·이용 동의가 필요해요." }, { status: 400 });

  const company = body.companyName?.trim();
  const rep = body.representativeName?.trim();
  const phone = body.contactPhone?.trim();
  const region = body.region?.trim();
  if (!company || company.length > 80)
    return NextResponse.json({ error: "업체명을 확인해 주세요." }, { status: 400 });
  if (!rep || rep.length > 30)
    return NextResponse.json({ error: "담당자명을 확인해 주세요." }, { status: 400 });
  if (!isPhone(phone))
    return NextResponse.json({ error: "연락처 형식을 확인해 주세요." }, { status: 400 });
  if (!region || region.length > 50)
    return NextResponse.json({ error: "지역을 선택해 주세요." }, { status: 400 });

  const email = isEmail(body.contactEmail) ? body.contactEmail!.trim() : null;
  const categories = Array.isArray(body.categories)
    ? body.categories.filter((c): c is string => CATEGORIES.includes(c as never))
    : [];
  const volume =
    typeof body.monthlyVolume === "number" && Number.isFinite(body.monthlyVolume)
      ? Math.max(0, Math.min(100000, Math.round(body.monthlyVolume)))
      : null;

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("partner_leads").insert({
      company_name: company,
      representative_name: rep,
      contact_phone: phone,
      contact_email: email,
      categories,
      region,
      monthly_volume: volume,
      message: typeof body.message === "string" ? body.message.slice(0, 1000) : null,
      consent_at: new Date().toISOString(),
    });
    if (error) {
      console.warn("/api/partners insert error:", error.message);
      return NextResponse.json({ error: "접수 실패. 잠시 후 다시 시도해 주세요." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.warn("/api/partners failed:", e);
    return NextResponse.json({ error: "접수 실패." }, { status: 500 });
  }
}
