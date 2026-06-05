import type {
  OnboardingVisibilityPreference,
  SaveCoupleOnboardingInput,
  SavePersonalOnboardingInput
} from "@sinhon-os/schemas";
import type { SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";

type OnboardingStore = Pick<SinhonPrismaClient, "couple" | "coupleMember" | "decisionLog">;

type OnboardingServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type CoupleRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["couple"]["findFirst"]>>>;
type CoupleMemberRecord = NonNullable<
  Awaited<ReturnType<SinhonPrismaClient["coupleMember"]["findFirst"]>>
>;

const defaultVisibilityPreference = {
  asset: "summary",
  income: "summary"
} satisfies OnboardingVisibilityPreference;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toVisibilityPreference(value: unknown): OnboardingVisibilityPreference {
  if (!isObject(value)) {
    return defaultVisibilityPreference;
  }

  return {
    asset:
      value.asset === "private" || value.asset === "partner" || value.asset === "summary"
        ? value.asset
        : defaultVisibilityPreference.asset,
    income:
      value.income === "private" || value.income === "partner" || value.income === "summary"
        ? value.income
        : defaultVisibilityPreference.income
  };
}

function isFilled(value: Date | string | null | undefined) {
  return Boolean(value) && value !== "not_set";
}

function toDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function parseDateOnly(value: string | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

function isPersonalInputComplete(member: CoupleMemberRecord) {
  return (
    isFilled(member.displayLabel) &&
    isFilled(member.workRegion) &&
    isFilled(member.incomeRange) &&
    isFilled(member.assetRange)
  );
}

function isCoupleInputComplete(couple: CoupleRecord) {
  return (
    isFilled(couple.weddingDate) &&
    isFilled(couple.weddingRegion) &&
    isFilled(couple.preferredResidenceRegion) &&
    isFilled(couple.housingType) &&
    isFilled(couple.totalBudgetRange) &&
    isFilled(couple.cashOnHandRange) &&
    isFilled(couple.familySupportType) &&
    isFilled(couple.loanConsiderationStatus) &&
    isFilled(couple.childrenPlanStatus) &&
    isFilled(couple.preferredWeddingStyle) &&
    isFilled(couple.moveInPlanAt)
  );
}

async function assertActiveMember(store: OnboardingStore, userId: string, coupleId: string) {
  const member = await store.coupleMember.findFirst({
    where: {
      coupleId,
      status: "active",
      userId
    }
  });

  if (!member) {
    throw new ApiError("FORBIDDEN", "해당 커플에 접근할 수 없습니다.");
  }

  return member;
}

async function getCoupleWithMembers(store: OnboardingStore, coupleId: string) {
  const couple = await store.couple.findFirst({
    include: {
      members: {
        orderBy: {
          createdAt: "asc"
        },
        where: {
          status: "active"
        }
      }
    },
    where: {
      deletedAt: null,
      id: coupleId
    }
  });

  if (!couple) {
    throw new ApiError("NOT_FOUND", "커플 공간을 찾을 수 없습니다.");
  }

  return couple;
}

function toMemberProgress(
  member: CoupleMemberRecord,
  viewerUserId: string,
  options: { includeVisibility?: boolean } = {}
) {
  const visibilityPreference = toVisibilityPreference(member.visibilityPreference);
  const isMine = member.userId === viewerUserId;

  return {
    assetRange: isMine || visibilityPreference.asset !== "private" ? member.assetRange : "private",
    displayLabel: member.displayLabel,
    incomeRange:
      isMine || visibilityPreference.income !== "private" ? member.incomeRange : "private",
    isComplete: member.onboardingStatus === "completed",
    memberId: member.id,
    onboardingCompletedAt: member.onboardingCompletedAt,
    onboardingStatus: member.onboardingStatus,
    phoneVerified: member.phoneVerified,
    role: member.role,
    userId: member.userId,
    visibilityPreference: options.includeVisibility ? visibilityPreference : undefined,
    workRegion: member.workRegion
  };
}

function toCoupleInput(couple: CoupleRecord) {
  return {
    cashOnHandRange: couple.cashOnHandRange,
    childrenPlanStatus: couple.childrenPlanStatus,
    familySupportType: couple.familySupportType,
    housingType: couple.housingType,
    isComplete: isCoupleInputComplete(couple),
    loanConsiderationStatus: couple.loanConsiderationStatus,
    moveInPlanAt: toDateOnly(couple.moveInPlanAt),
    preferredResidenceRegion: couple.preferredResidenceRegion,
    preferredWeddingStyle: couple.preferredWeddingStyle,
    totalBudgetRange: couple.totalBudgetRange,
    weddingDate: toDateOnly(couple.weddingDate),
    weddingRegion: couple.weddingRegion
  };
}

async function buildOnboardingSnapshot(store: OnboardingStore, userId: string, coupleId: string) {
  await assertActiveMember(store, userId, coupleId);
  const couple = await getCoupleWithMembers(store, coupleId);
  const myMember = couple.members.find((member) => member.userId === userId);
  const partnerMember = couple.members.find((member) => member.userId !== userId) ?? null;

  if (!myMember) {
    throw new ApiError("FORBIDDEN", "해당 커플에 접근할 수 없습니다.");
  }

  return {
    couple: {
      displayName: couple.displayName,
      id: couple.id,
      onboardingStatus: couple.onboardingStatus
    },
    coupleInput: toCoupleInput(couple),
    myProgress: toMemberProgress(myMember, userId, { includeVisibility: true }),
    partnerProgress: partnerMember ? toMemberProgress(partnerMember, userId) : null,
    partnerStatus: partnerMember ? "connected" : "waiting_partner",
    status: couple.onboardingStatus
  };
}

function buildPersonalUpdate(input: SavePersonalOnboardingInput) {
  return {
    assetRange: input.assetRange,
    displayLabel: input.nickname,
    incomeRange: input.incomeRange,
    onboardingCompletedAt: null,
    onboardingStatus: "in_progress",
    phoneVerified: input.phoneVerified,
    visibilityPreference: input.visibilityPreference,
    workRegion: input.workRegion
  };
}

function buildCoupleUpdate(input: SaveCoupleOnboardingInput) {
  return {
    cashOnHandRange: input.cashOnHandRange,
    childrenPlanStatus: input.childrenPlanStatus,
    familySupportType: input.familySupportType,
    housingType: input.housingType,
    loanConsiderationStatus: input.loanConsiderationStatus,
    moveInPlanAt: parseDateOnly(input.moveInPlanAt),
    onboardingStatus: "in_progress",
    preferredResidenceRegion: input.preferredResidenceRegion,
    preferredWeddingStyle: input.preferredWeddingStyle,
    totalBudgetRange: input.totalBudgetRange,
    weddingDate: parseDateOnly(input.weddingDate),
    weddingRegion: input.weddingRegion
  };
}

export function createOnboardingService({
  now = () => new Date(),
  prisma
}: OnboardingServiceOptions) {
  return {
    async completeOnboarding(userId: string, coupleId: string) {
      const result = await prisma.$transaction(async (tx) => {
        const member = await assertActiveMember(tx, userId, coupleId);
        const couple = await getCoupleWithMembers(tx, coupleId);

        if (!isPersonalInputComplete(member)) {
          throw new ApiError("ONBOARDING_INCOMPLETE", "개인 입력을 먼저 채워 주세요.", {
            personal: ["닉네임, 직장 지역, 소득 구간, 자산 구간이 필요합니다."]
          });
        }

        if (!isCoupleInputComplete(couple)) {
          throw new ApiError("ONBOARDING_INCOMPLETE", "커플 공통 입력을 먼저 채워 주세요.", {
            couple: ["결혼일, 지역, 주거, 예산, 현금, 계획 정보를 확인해 주세요."]
          });
        }

        await tx.coupleMember.update({
          data: {
            onboardingCompletedAt: now(),
            onboardingStatus: "completed"
          },
          where: {
            id: member.id
          }
        });

        const activeMembers = await tx.coupleMember.findMany({
          where: {
            coupleId,
            status: "active"
          }
        });
        const hasPartner = activeMembers.length > 1;
        const allMembersComplete =
          hasPartner &&
          activeMembers.every((activeMember) =>
            activeMember.id === member.id ? true : activeMember.onboardingStatus === "completed"
          );

        const afterStatus = allMembersComplete ? "completed" : "in_progress";

        await tx.couple.update({
          data: {
            onboardingStatus: afterStatus
          },
          where: {
            id: coupleId
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "complete_onboarding",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus,
            beforeStatus: couple.onboardingStatus,
            coupleId,
            targetId: coupleId,
            targetType: "couple_onboarding"
          }
        });

        return buildOnboardingSnapshot(tx, userId, coupleId);
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId,
        eventName: "onboarding_completed",
        payload: {
          status: result.status
        },
        userId
      });

      return result;
    },

    getOnboarding(userId: string, coupleId: string) {
      return buildOnboardingSnapshot(prisma, userId, coupleId);
    },

    async saveCoupleOnboarding(userId: string, coupleId: string, input: SaveCoupleOnboardingInput) {
      return prisma.$transaction(async (tx) => {
        const member = await assertActiveMember(tx, userId, coupleId);
        const couple = await getCoupleWithMembers(tx, coupleId);

        await tx.couple.update({
          data: buildCoupleUpdate(input),
          where: {
            id: coupleId
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "save_couple_onboarding",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: "in_progress",
            beforeStatus: couple.onboardingStatus,
            coupleId,
            targetId: coupleId,
            targetType: "couple_onboarding"
          }
        });

        return buildOnboardingSnapshot(tx, userId, coupleId);
      });
    },

    async savePersonalOnboarding(
      userId: string,
      coupleId: string,
      input: SavePersonalOnboardingInput
    ) {
      return prisma.$transaction(async (tx) => {
        const member = await assertActiveMember(tx, userId, coupleId);

        await tx.coupleMember.update({
          data: buildPersonalUpdate(input),
          where: {
            id: member.id
          }
        });

        await tx.couple.update({
          data: {
            onboardingStatus: "in_progress"
          },
          where: {
            id: coupleId
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "save_personal_onboarding",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: "in_progress",
            beforeStatus: member.onboardingStatus,
            coupleId,
            targetId: member.id,
            targetType: "couple_member_onboarding"
          }
        });

        return buildOnboardingSnapshot(tx, userId, coupleId);
      });
    }
  };
}

export type OnboardingService = ReturnType<typeof createOnboardingService>;
