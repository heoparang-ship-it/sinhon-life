// POST /api/profile/sync
// 로그인 직후 localStorage snapshot → 서버 upsert
// 규칙: 서버 profiles 없으면 로컬 우선, 있으면 updatedAt 기준 최신 우선

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ChecklistSnapshot {
  groupKey: string;
  itemKey: string;
  checked: boolean;
  memo?: string;
}

interface BudgetSnapshot {
  owner: "jihoon" | "seoyeon" | "joint";
  category: string;
  amount: number;
  memo?: string;
  spentAt: string; // ISO string
}

interface SyncPayload {
  profile?: {
    stage?: string;
    region?: string;
    interests?: string[];
    partnerName?: string;
    weddingDate?: string;
    completedAt?: number;
    updatedAt?: number; // ms timestamp
  };
  checklist?: ChecklistSnapshot[];
  budget?: BudgetSnapshot[];
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.kakaoId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as SyncPayload;
  const { kakaoId, nickname, profileImage, email } = session.user;

  // 1. users upsert
  const user = await prisma.user.upsert({
    where: { kakaoId },
    update: {
      nickname,
      profileImage,
      email: email || undefined,
      lastLoginAt: new Date(),
    },
    create: {
      kakaoId,
      nickname,
      profileImage,
      email: email || undefined,
      lastLoginAt: new Date(),
    },
  });

  // 2. profiles: 서버 없으면 로컬 upsert, 있으면 updatedAt 비교
  if (payload.profile) {
    const serverProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const localUpdatedAt = payload.profile.updatedAt
      ? new Date(payload.profile.updatedAt)
      : new Date(0);

    const shouldOverwrite =
      !serverProfile || localUpdatedAt > serverProfile.updatedAt;

    if (shouldOverwrite) {
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          stage: payload.profile.stage,
          region: payload.profile.region,
          interests: payload.profile.interests ?? [],
          partnerName: payload.profile.partnerName,
          weddingDate: payload.profile.weddingDate,
          completedAt: payload.profile.completedAt
            ? new Date(payload.profile.completedAt)
            : null,
        },
        create: {
          userId: user.id,
          stage: payload.profile.stage,
          region: payload.profile.region,
          interests: payload.profile.interests ?? [],
          partnerName: payload.profile.partnerName,
          weddingDate: payload.profile.weddingDate,
          completedAt: payload.profile.completedAt
            ? new Date(payload.profile.completedAt)
            : null,
        },
      });
    }
  }

  // 3. checklist: upsert per (userId, groupKey, itemKey)
  if (payload.checklist?.length) {
    await prisma.$transaction(
      payload.checklist.map((item) =>
        prisma.checklistItem.upsert({
          where: {
            userId_groupKey_itemKey: {
              userId: user.id,
              groupKey: item.groupKey,
              itemKey: item.itemKey,
            },
          },
          update: { checked: item.checked, memo: item.memo },
          create: {
            userId: user.id,
            groupKey: item.groupKey,
            itemKey: item.itemKey,
            checked: item.checked,
            memo: item.memo,
          },
        })
      )
    );
  }

  // 4. budget: insert-only (중복 방지는 클라이언트 측 책임)
  if (payload.budget?.length) {
    await prisma.budgetTxn.createMany({
      data: payload.budget.map((txn) => ({
        userId: user.id,
        owner: txn.owner,
        category: txn.category,
        amount: txn.amount,
        memo: txn.memo,
        spentAt: new Date(txn.spentAt),
      })),
      skipDuplicates: true,
    });
  }

  // 5. 서버 최신 프로필 반환 (클라이언트 localStorage 덮어쓰기용)
  const latestProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    serverProfile: latestProfile,
  });
}
