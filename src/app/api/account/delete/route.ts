// DELETE /api/account/delete
// 회원 탈퇴 — soft delete (deletedAt 기록) + 카카오 연결 해제 요청
// 실제 데이터 물리 삭제는 30일 후 배치로 진행 (MVP에서는 soft delete만)

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getAuthSession();
  if (!session?.user?.kakaoId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kakaoId } = session.user;

  const user = await prisma.user.findUnique({ where: { kakaoId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // soft delete
  await prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: new Date() },
  });

  // TODO: 카카오 연결 해제 API 호출 (admin key 필요 — 옵션 2 단계에서 추가)
  // POST https://kapi.kakao.com/v1/user/unlink  with admin_key header

  return NextResponse.json({ ok: true });
}
