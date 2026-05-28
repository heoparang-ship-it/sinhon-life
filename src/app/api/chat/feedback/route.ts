import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const isValidUuid = (s: unknown): s is string =>
  typeof s === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function POST(request: Request) {
  let body: { messageId?: string; feedback?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  if (!isValidUuid(body.messageId)) {
    return NextResponse.json({ error: "messageId 가 올바르지 않아요." }, { status: 400 });
  }
  const fb = Number(body.feedback);
  if (![1, 0, -1].includes(fb)) {
    return NextResponse.json({ error: "feedback 은 -1/0/1 이어야 해요." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("chat_logs")
      .update({ feedback: fb })
      .eq("id", body.messageId);
    if (error) {
      console.warn("/api/chat/feedback update error:", error.message);
      return NextResponse.json({ ok: false }, { status: 200 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.warn("/api/chat/feedback failed:", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
