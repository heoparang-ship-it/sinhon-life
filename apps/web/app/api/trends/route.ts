import { NextResponse } from "next/server";
import { kvConfigured, kvMGet } from "../../lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dayStr(offset = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 80);

  if (!kvConfigured || ids.length === 0) {
    return NextResponse.json({ source: "synthetic", totals: {} });
  }

  const today = dayStr(0);
  const yest = dayStr(-1);
  const keys: string[] = [];
  ids.forEach((raw) => {
    const id = raw.replace(/[^\w-]/g, "").slice(0, 64);
    keys.push(`p:score:${id}`, `p:score:${id}:${today}`, `p:score:${id}:${yest}`);
  });

  try {
    const vals = await kvMGet(keys);
    const totals: Record<string, { total: number; delta: number }> = {};
    ids.forEach((raw, i) => {
      const total = vals[i * 3] ?? 0;
      const t = vals[i * 3 + 1] ?? 0;
      const y = vals[i * 3 + 2] ?? 0;
      const delta = y && y > 0 ? Math.round(((t - y) / y) * 100) : t > 0 ? 100 : 0;
      totals[raw] = { total: total ?? 0, delta };
    });
    return NextResponse.json({ source: "live", totals });
  } catch {
    return NextResponse.json({ source: "synthetic", totals: {} });
  }
}
