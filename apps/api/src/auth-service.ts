import type { RegisterInput, LoginInput } from "@sinhon-os/schemas";
import type { SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";
import {
  createAccessToken,
  createOpaqueToken,
  getAuthProviderUserId,
  getBearerToken,
  hashIdentifier,
  verifyAccessToken
} from "./local-auth.js";

type AuthStore = Pick<
  SinhonPrismaClient,
  "couple" | "coupleInvitation" | "coupleMember" | "decisionLog" | "user"
>;

type AuthServiceOptions = {
  authTokenSecret: string;
  authTokenTtlSeconds?: number;
  now?: () => Date;
  prisma: SinhonPrismaClient;
  webBaseUrl: string;
};

const defaultAccessTokenTtlSeconds = 60 * 60 * 24 * 7;

type UserRecord = Awaited<ReturnType<SinhonPrismaClient["user"]["findFirst"]>>;
type CoupleRecord = Awaited<ReturnType<SinhonPrismaClient["couple"]["findFirst"]>>;
type CoupleMemberRecord = Awaited<ReturnType<SinhonPrismaClient["coupleMember"]["findFirst"]>>;
type UserIdentityCondition = {
  authProvider?: string;
  authProviderUserId?: string;
  emailHash?: string;
  phoneHash?: string;
};

const authenticatedUserStatuses = ["active", "admin"] as const;

function getIdentifierHashes(input: { email?: string; phone?: string }) {
  return {
    emailHash: input.email ? hashIdentifier(input.email) : undefined,
    phoneHash: input.phone ? hashIdentifier(input.phone) : undefined
  };
}

function toUserSummary(user: NonNullable<UserRecord>) {
  return {
    displayName: user.displayName,
    id: user.id,
    isAdmin: user.status === "admin",
    status: user.status
  };
}

function toCoupleSummary(couple: NonNullable<CoupleRecord>) {
  return {
    displayName: couple.displayName,
    id: couple.id,
    lifecycleStatus: couple.lifecycleStatus,
    onboardingStatus: couple.onboardingStatus
  };
}

function toMemberSummary(member: NonNullable<CoupleMemberRecord>) {
  return {
    coupleId: member.coupleId,
    id: member.id,
    role: member.role,
    status: member.status,
    userId: member.userId
  };
}

async function findExistingUser(
  store: AuthStore,
  input: {
    authProvider: string;
    authProviderUserId: string;
    emailHash?: string;
    phoneHash?: string;
  }
) {
  const conditions: UserIdentityCondition[] = [
    {
      authProvider: input.authProvider,
      authProviderUserId: input.authProviderUserId
    }
  ];

  if (input.emailHash) {
    conditions.push({ emailHash: input.emailHash });
  }

  if (input.phoneHash) {
    conditions.push({ phoneHash: input.phoneHash });
  }

  return store.user.findFirst({
    where: {
      OR: conditions,
      deletedAt: null
    }
  });
}

async function assertActiveMember(store: AuthStore, userId: string, coupleId: string) {
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

async function findInvitationByToken(store: AuthStore, token: string) {
  return store.coupleInvitation.findFirst({
    include: {
      couple: true,
      invitedBy: true
    },
    where: {
      tokenHash: hashIdentifier(token)
    }
  });
}

function invitationStatus(
  invitation: {
    expiresAt: Date;
    status: string;
  },
  now: Date
) {
  if (invitation.status === "active" && invitation.expiresAt.getTime() <= now.getTime()) {
    return "expired";
  }

  return invitation.status;
}

async function acceptInvitationWithStore(
  store: AuthStore,
  userId: string,
  token: string,
  now: Date
) {
  const invitation = await findInvitationByToken(store, token);

  if (!invitation) {
    throw new ApiError("NOT_FOUND", "초대 링크를 찾을 수 없습니다.");
  }

  const status = invitationStatus(invitation, now);

  if (status === "expired") {
    throw new ApiError("INVITATION_EXPIRED", "초대 링크가 만료됐습니다.");
  }

  if (status !== "active") {
    throw new ApiError("CONFLICT", "이미 처리된 초대입니다.");
  }

  const existingActiveMember = await store.coupleMember.findFirst({
    where: {
      status: "active",
      userId
    }
  });

  if (existingActiveMember && existingActiveMember.coupleId !== invitation.coupleId) {
    throw new ApiError("ALREADY_IN_COUPLE", "이미 다른 커플에 참여 중입니다.");
  }

  if (existingActiveMember?.coupleId === invitation.coupleId) {
    throw new ApiError("CONFLICT", "이미 이 커플에 참여 중입니다.");
  }

  const user = await store.user.findFirst({
    where: {
      id: userId,
      status: "active"
    }
  });

  if (!user) {
    throw new ApiError("UNAUTHENTICATED", "로그인이 필요합니다.");
  }

  const member = await store.coupleMember.create({
    data: {
      coupleId: invitation.coupleId,
      displayLabel: user.displayName ?? "배우자",
      invitedAt: invitation.createdAt,
      invitedByUserId: invitation.invitedByUserId,
      joinedAt: now,
      role: "partner",
      status: "active",
      userId
    }
  });

  const updatedInvitation = await store.coupleInvitation.update({
    data: {
      acceptedAt: now,
      acceptedByUserId: userId,
      invitedUserId: userId,
      status: "accepted"
    },
    where: {
      id: invitation.id
    }
  });

  await store.decisionLog.create({
    data: {
      action: "accept_invitation",
      actorCoupleMemberId: member.id,
      actorUserId: userId,
      afterStatus: updatedInvitation.status,
      beforeStatus: invitation.status,
      coupleId: invitation.coupleId,
      targetId: invitation.id,
      targetType: "couple_invitation"
    }
  });

  return {
    couple: invitation.couple,
    member
  };
}

export function createAuthService({
  authTokenSecret,
  authTokenTtlSeconds = defaultAccessTokenTtlSeconds,
  now = () => new Date(),
  prisma,
  webBaseUrl
}: AuthServiceOptions) {
  function createSession(userId: string) {
    return createAccessToken(userId, authTokenSecret, authTokenTtlSeconds);
  }

  return {
    async acceptInvitation(userId: string, token: string) {
      const result = await prisma.$transaction(async (tx) =>
        acceptInvitationWithStore(tx, userId, token, now())
      );

      await recordAnalyticsEventSafely(prisma, {
        coupleId: result.couple.id,
        eventName: "partner_joined",
        payload: {
          role: result.member.role
        },
        userId
      });

      return result;
    },

    async createInvitation(userId: string, coupleId: string, expiresInHours: number) {
      const token = createOpaqueToken();
      const expiresAt = new Date(now().getTime() + expiresInHours * 60 * 60 * 1000);

      const invitation = await prisma.$transaction(async (tx) => {
        await assertActiveMember(tx, userId, coupleId);

        const createdInvitation = await tx.coupleInvitation.create({
          data: {
            coupleId,
            expiresAt,
            invitedByUserId: userId,
            status: "active",
            tokenHash: hashIdentifier(token)
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "create_invitation",
            actorUserId: userId,
            afterStatus: createdInvitation.status,
            coupleId,
            targetId: createdInvitation.id,
            targetType: "couple_invitation"
          }
        });

        return createdInvitation;
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId,
        eventName: "partner_invited",
        payload: {
          expiresInHours
        },
        userId
      });

      return {
        expiresAt: invitation.expiresAt,
        invitationId: invitation.id,
        inviteUrl: `${webBaseUrl.replace(/\/$/, "")}/invite/${token}`,
        token
      };
    },

    async getCurrentUser(userId: string) {
      const user = await prisma.user.findFirst({
        include: {
          coupleMemberships: {
            include: {
              couple: true
            },
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
          id: userId,
          status: {
            in: [...authenticatedUserStatuses]
          }
        }
      });

      if (!user) {
        throw new ApiError("UNAUTHENTICATED", "로그인이 필요합니다.");
      }

      const currentMember = user.coupleMemberships[0];

      return {
        currentCoupleId: currentMember?.coupleId,
        currentMember: currentMember ? toMemberSummary(currentMember) : undefined,
        roles: [
          ...(user.status === "admin" ? ["admin"] : []),
          ...user.coupleMemberships.map((member) => member.role)
        ],
        user: toUserSummary(user)
      };
    },

    async assertAdminUser(userId: string) {
      const user = await prisma.user.findFirst({
        where: {
          deletedAt: null,
          id: userId,
          status: "admin"
        }
      });

      if (!user) {
        throw new ApiError("FORBIDDEN", "운영자 권한이 필요합니다.");
      }

      return toUserSummary(user);
    },

    async getCurrentCouple(userId: string) {
      const member = await prisma.coupleMember.findFirst({
        include: {
          couple: true
        },
        orderBy: {
          createdAt: "asc"
        },
        where: {
          status: "active",
          userId
        }
      });
      const activeMemberCount = member
        ? await prisma.coupleMember.count({
            where: {
              coupleId: member.coupleId,
              status: "active"
            }
          })
        : 0;

      return {
        couple: member?.couple ? toCoupleSummary(member.couple) : null,
        member: member ? toMemberSummary(member) : null,
        partnerStatus: member ? (activeMemberCount > 1 ? "connected" : "waiting_partner") : null
      };
    },

    async login(input: LoginInput) {
      const authProviderUserId = getAuthProviderUserId(input);
      const { emailHash, phoneHash } = getIdentifierHashes(input);
      const user = await findExistingUser(prisma, {
        authProvider: input.authProvider,
        authProviderUserId,
        emailHash,
        phoneHash
      });

      if (!user) {
        throw new ApiError("UNAUTHENTICATED", "가입 정보를 찾을 수 없습니다.");
      }

      return {
        accessToken: createSession(user.id),
        nextStep: "home",
        user: toUserSummary(user)
      };
    },

    async previewInvitation(token: string) {
      const invitation = await findInvitationByToken(prisma, token);

      if (!invitation) {
        throw new ApiError("NOT_FOUND", "초대 링크를 찾을 수 없습니다.");
      }

      return {
        invitation: {
          coupleDisplayName: invitation.couple.displayName,
          expiresAt: invitation.expiresAt,
          inviterDisplayName: invitation.invitedBy.displayName ?? "초대한 사용자",
          status: invitationStatus(invitation, now())
        }
      };
    },

    async register(input: RegisterInput) {
      const authProviderUserId = getAuthProviderUserId(input);
      const { emailHash, phoneHash } = getIdentifierHashes(input);
      const existingUser = await findExistingUser(prisma, {
        authProvider: input.authProvider,
        authProviderUserId,
        emailHash,
        phoneHash
      });

      if (existingUser) {
        throw new ApiError("CONFLICT", "이미 가입된 사용자입니다.");
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            authProvider: input.authProvider,
            authProviderUserId,
            displayName: input.displayName,
            emailHash,
            phoneHash,
            status: "active"
          }
        });

        if (input.invitationToken) {
          const accepted = await acceptInvitationWithStore(
            tx,
            user.id,
            input.invitationToken,
            now()
          );

          return {
            couple: accepted.couple,
            member: accepted.member,
            nextStep: "onboarding",
            user
          };
        }

        const couple = await tx.couple.create({
          data: {
            createdByUserId: user.id,
            displayName: input.coupleDisplayName ?? "우리 결혼 준비",
            lifecycleStatus: input.lifecycleStatus,
            onboardingStatus: "not_started"
          }
        });

        const member = await tx.coupleMember.create({
          data: {
            coupleId: couple.id,
            displayLabel: input.relationshipLabel ?? input.displayName,
            joinedAt: now(),
            role: "owner",
            status: "active",
            userId: user.id
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "create_couple",
            actorCoupleMemberId: member.id,
            actorUserId: user.id,
            afterStatus: couple.lifecycleStatus,
            coupleId: couple.id,
            targetId: couple.id,
            targetType: "couple"
          }
        });

        return {
          couple,
          member,
          nextStep: "invite_partner",
          user
        };
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId: result.couple.id,
        eventName: "account_created",
        payload: {
          authProvider: input.authProvider,
          nextStep: result.nextStep
        },
        userId: result.user.id
      });

      if (result.nextStep === "invite_partner") {
        await recordAnalyticsEventSafely(prisma, {
          coupleId: result.couple.id,
          eventName: "couple_created",
          payload: {
            lifecycleStatus: result.couple.lifecycleStatus
          },
          userId: result.user.id
        });
      }

      return {
        accessToken: createSession(result.user.id),
        couple: toCoupleSummary(result.couple),
        member: toMemberSummary(result.member),
        nextStep: result.nextStep,
        user: toUserSummary(result.user)
      };
    },

    verifyAuthorizationHeader(authorizationHeader: string | undefined) {
      const token = getBearerToken(authorizationHeader);

      if (!token) {
        throw new ApiError("UNAUTHENTICATED", "로그인이 필요합니다.");
      }

      const payload = verifyAccessToken(token, authTokenSecret);

      if (!payload) {
        throw new ApiError("UNAUTHENTICATED", "다시 로그인해 주세요.");
      }

      return payload.sub;
    }
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
