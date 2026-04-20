// GET /api/admin/users
// 관리자 가입자 통계 API — adminAuth 가드 하에 MAU·신규·탈퇴·리텐션 반환

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, hashAdminToken } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

async function isAdminAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const expected = await hashAdminToken(password);
  return token === expected;
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalActive,
    totalDeleted,
    newThisMonth,
    newThisWeek,
    newToday,
    mau, // Monthly Active Users (last_login_at 기준)
    recentUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: { not: null } } }),
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
    }),
    prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
    }),
    prisma.user.count({
      where: { createdAt: { gte: todayStart }, deletedAt: null },
    }),
    prisma.user.count({
      where: { lastLoginAt: { gte: thirtyDaysAgo }, deletedAt: null },
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        lastLoginAt: true,
        marketingOptIn: true,
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalActive,
      totalDeleted,
      newThisMonth,
      newThisWeek,
      newToday,
      mau,
    },
    recentUsers,
  });
}
