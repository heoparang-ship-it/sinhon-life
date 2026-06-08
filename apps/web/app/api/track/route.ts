import { NextResponse } from "next/server";
import { kvConfigured, kvIncr } from "../../lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  kind?: "view" | "bookmark" | "apply" | "search";
  policyId?: string;
  region?: string;
};

const WEIGHT: Record<string, number> = { view: 1, bookmark: 3, apply: 5, search: 1 };

function dayBucket(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { kind, policyId, region } = body;
  if (!kind || !policyId) return NextResponse.json({ ok: false }, { status: 400 });

  if (!kvConfigured) return NextResponse.json({ ok: true, stored: false });

  const w = WEIGHT[kind] ?? 1;
  const id = policyId.replace(/[^\w-]/g, "").slice(0, 64);
  const day = dayBucket();
  const keys: string[] = [];
  // 점수(가중) — 오늘/누적
  for (let i = 0; i < w; i++) {
    keys.push(`p:score:${id}`);
    keys.push(`p:score:${id}:${day}`);
  }
  // 이벤트 종류별 카운트
  keys.push(`p:${kind}:${id}`);
  if (region) keys.push(`r:${region.replace(/[^\w가-힣]/g, "")}:${id}`);

  try {
    await kvIncr(keys);
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }
}
