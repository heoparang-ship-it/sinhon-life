import type { Prisma, PrismaClient } from "@prisma/client";

export type CoupleRepositoryClient = Pick<PrismaClient, "couple" | "decisionLog">;

export type CreateDecisionLogInput = {
  action: string;
  actorCoupleMemberId?: string;
  actorUserId?: string;
  afterStatus?: string;
  beforeStatus?: string;
  coupleId?: string;
  metadata?: Prisma.InputJsonValue;
  reason?: string;
  targetId: string;
  targetType: string;
};

export function createCoupleRepository(client: CoupleRepositoryClient) {
  return {
    findById(coupleId: string) {
      return client.couple.findFirst({
        include: {
          compareRooms: {
            orderBy: {
              createdAt: "desc"
            },
            take: 5
          },
          members: true,
          scenarios: {
            orderBy: {
              createdAt: "desc"
            },
            take: 5
          },
          tasks: {
            orderBy: {
              dueAt: "asc"
            },
            take: 10
          }
        },
        where: {
          deletedAt: null,
          id: coupleId
        }
      });
    },

    listActiveForUser(userId: string) {
      return client.couple.findMany({
        orderBy: {
          updatedAt: "desc"
        },
        where: {
          deletedAt: null,
          members: {
            some: {
              status: "active",
              userId
            }
          }
        }
      });
    },

    recordDecision(input: CreateDecisionLogInput) {
      const data: Prisma.DecisionLogUncheckedCreateInput = {
        action: input.action,
        targetId: input.targetId,
        targetType: input.targetType
      };

      if (input.actorCoupleMemberId) data.actorCoupleMemberId = input.actorCoupleMemberId;
      if (input.actorUserId) data.actorUserId = input.actorUserId;
      if (input.afterStatus) data.afterStatus = input.afterStatus;
      if (input.beforeStatus) data.beforeStatus = input.beforeStatus;
      if (input.coupleId) data.coupleId = input.coupleId;
      if (input.metadata) data.metadata = input.metadata;
      if (input.reason) data.reason = input.reason;

      return client.decisionLog.create({
        data
      });
    }
  };
}
