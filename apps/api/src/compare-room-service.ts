import type {
  AddCompareCardInput,
  ApprovalStatus,
  CreateCompareCommentInput,
  CreateCompareRoomInput,
  ListCompareRoomsQuery,
  SubmitApprovalInput,
  UpdateCompareRoomInput
} from "@sinhon-os/schemas";
import type { Prisma, SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";
import { deriveCompareRoomStatus, getCompareRoomReadiness } from "./compare-room-engine.js";
import { getOfferPriceValidity, isPriceVersionVisibleByDefault } from "./offer-price-engine.js";

type CompareRoomStore = Pick<
  SinhonPrismaClient,
  | "approval"
  | "compareCard"
  | "compareComment"
  | "compareRoom"
  | "couple"
  | "coupleMember"
  | "decisionLog"
  | "offer"
  | "offerPriceVersion"
>;

type CompareRoomServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type JsonInputValue =
  | boolean
  | number
  | string
  | JsonInputValue[]
  | { [key: string]: JsonInputValue | null };

const defaultLimit = 10;
const maxCardsPerRoom = 4;

const compareRoomInclude = {
  approvals: {
    include: {
      coupleMember: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc" as const
    }
  },
  cards: {
    include: {
      offer: {
        include: {
          vendor: true,
          vendorBranch: {
            select: {
              id: true,
              name: true,
              region: true
            }
          }
        }
      },
      offerPriceVersion: true
    },
    orderBy: {
      position: "asc" as const
    },
    where: {
      removedAt: null
    }
  },
  comments: {
    include: {
      coupleMember: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: "asc" as const
    },
    where: {
      deletedAt: null
    }
  },
  couple: {
    include: {
      members: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: "asc" as const
        },
        where: {
          status: "active"
        }
      }
    }
  }
} satisfies Prisma.CompareRoomInclude;

type CompareRoomWithRelations = Prisma.CompareRoomGetPayload<{
  include: typeof compareRoomInclude;
}>;
type CompareCardWithRelations = CompareRoomWithRelations["cards"][number];
type CoupleMemberWithUser = CompareRoomWithRelations["couple"]["members"][number];
type ApprovalWithMember = CompareRoomWithRelations["approvals"][number];
type OfferWithPriceVersions = Prisma.OfferGetPayload<{
  include: {
    priceVersions: {
      orderBy: {
        version: "desc";
      };
    };
    vendor: true;
    vendorBranch: {
      select: {
        id: true;
        name: true;
        region: true;
      };
    };
  };
}>;
type OfferPriceVersionRecord = OfferWithPriceVersions["priceVersions"][number];

function toInputJson(value: unknown): JsonInputValue {
  return JSON.parse(JSON.stringify(value)) as JsonInputValue;
}

function toNumber(value: bigint | number | null | undefined) {
  return value === null || value === undefined ? null : Number(value);
}

function memberDisplayName(member: CoupleMemberWithUser) {
  return member.displayLabel ?? member.user.displayName ?? "커플 멤버";
}

function getRoomLevelApproval(
  approvals: ApprovalWithMember[],
  member: CoupleMemberWithUser
): ApprovalWithMember | undefined {
  return approvals.find(
    (approval) => approval.coupleMemberId === member.id && approval.compareCardId === null
  );
}

function roomLevelApprovalStatuses(room: CompareRoomWithRelations): ApprovalStatus[] {
  return room.couple.members.map((member) => {
    const approval = getRoomLevelApproval(room.approvals, member);

    return (approval?.status ?? "pending") as ApprovalStatus;
  });
}

function deriveStatusForRoom(room: CompareRoomWithRelations) {
  return deriveCompareRoomStatus({
    activeCardCount: room.cards.length,
    activeMemberCount: room.couple.members.length,
    approvalStatuses: roomLevelApprovalStatuses(room),
    currentStatus: room.status
  });
}

function canMutateRoom(room: CompareRoomWithRelations) {
  return !["archived", "both_approved"].includes(room.status);
}

function toSnapshotPriceSummary(priceVersion: OfferPriceVersionRecord) {
  return {
    basePrice: toNumber(priceVersion.basePrice),
    currency: "KRW",
    estimatedTotalPrice: toNumber(priceVersion.estimatedTotalPrice),
    validUntil: priceVersion.validUntil,
    verificationStatus: priceVersion.verificationStatus,
    verifiedAt: priceVersion.verifiedAt,
    version: priceVersion.version
  };
}

function toCompareCardResponse(card: CompareCardWithRelations) {
  return {
    createdAt: card.createdAt,
    id: card.id,
    offer: {
      category: card.offer.category,
      id: card.offer.id,
      region: card.offer.region,
      summary: card.offer.summary,
      title: card.offer.title,
      vendor: {
        id: card.offer.vendor.id,
        name: card.offer.vendor.name,
        region: card.offer.vendor.region,
        verificationStatus: card.offer.vendor.verificationStatus,
        verifiedAt: card.offer.vendor.verifiedAt
      },
      vendorBranch: card.offer.vendorBranch
    },
    offerId: card.offerId,
    offerPriceVersionId: card.offerPriceVersionId,
    position: card.position,
    snapshotIncludedItems: card.snapshotIncludedItems ?? [],
    snapshotOptionalOptions: card.snapshotOptionalOptions ?? [],
    snapshotPriceSummary: card.snapshotPriceSummary,
    snapshotRequiredOptions: card.snapshotRequiredOptions ?? [],
    snapshotTitle: card.snapshotTitle
  };
}

function toApprovalResponses(room: CompareRoomWithRelations, userId: string) {
  return room.couple.members.map((member) => {
    const approval = getRoomLevelApproval(room.approvals, member);

    return {
      comment: approval?.comment ?? null,
      compareRoomId: room.id,
      decidedAt: approval?.decidedAt ?? null,
      displayLabel: memberDisplayName(member),
      id: approval?.id ?? null,
      isMine: member.userId === userId,
      status: approval?.status ?? "pending",
      userId: member.userId
    };
  });
}

function toCommentResponse(comment: CompareRoomWithRelations["comments"][number], userId: string) {
  return {
    body: comment.body,
    compareCardId: comment.compareCardId,
    createdAt: comment.createdAt,
    displayLabel: memberDisplayName(comment.coupleMember),
    id: comment.id,
    isMine: comment.userId === userId,
    userId: comment.userId
  };
}

function toCompareRoomSummary(room: CompareRoomWithRelations, userId: string) {
  const approvals = toApprovalResponses(room, userId);
  const myApproval = approvals.find((approval) => approval.isMine);
  const partnerApproval = approvals.find((approval) => !approval.isMine);
  const readiness = getCompareRoomReadiness({
    activeCardCount: room.cards.length,
    activeMemberCount: room.couple.members.length
  });

  return {
    archivedAt: room.archivedAt,
    bothApprovedAt: room.bothApprovedAt,
    canRequestLead: room.status === "both_approved",
    cardCount: room.cards.length,
    createdAt: room.createdAt,
    id: room.id,
    myApprovalStatus: myApproval?.status ?? "pending",
    partnerApprovalStatus: partnerApproval?.status ?? null,
    partnerStatus: readiness.hasPartner ? "connected" : "waiting_partner",
    readiness,
    rejectedAt: room.rejectedAt,
    sharedAt: room.sharedAt,
    status: room.status,
    title: room.title,
    updatedAt: room.updatedAt
  };
}

function toCompareRoomDetail(room: CompareRoomWithRelations, userId: string) {
  return {
    compareRoom: toCompareRoomSummary(room, userId),
    approvals: toApprovalResponses(room, userId),
    cards: room.cards.map(toCompareCardResponse),
    comments: room.comments.map((comment) => toCommentResponse(comment, userId))
  };
}

async function assertActiveMember(store: CompareRoomStore, userId: string, coupleId: string) {
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

async function getRoomWithAccess(store: CompareRoomStore, userId: string, compareRoomId: string) {
  const room = await store.compareRoom.findFirst({
    include: compareRoomInclude,
    where: {
      deletedAt: null,
      id: compareRoomId
    }
  });

  if (!room) {
    throw new ApiError("NOT_FOUND", "비교방을 찾을 수 없습니다.");
  }

  await assertActiveMember(store, userId, room.coupleId);

  return room;
}

async function getOfferWithPriceVersions(
  store: CompareRoomStore,
  offerId: string
): Promise<OfferWithPriceVersions> {
  const offer = await store.offer.findFirst({
    include: {
      priceVersions: {
        orderBy: {
          version: "desc"
        }
      },
      vendor: true,
      vendorBranch: {
        select: {
          id: true,
          name: true,
          region: true
        }
      }
    },
    where: {
      deletedAt: null,
      id: offerId,
      status: "active",
      vendor: {
        deletedAt: null,
        status: "active"
      }
    }
  });

  if (!offer) {
    throw new ApiError("NOT_FOUND", "상품을 찾을 수 없습니다.");
  }

  return offer;
}

function selectPriceVersion(
  offer: OfferWithPriceVersions,
  options: {
    now: Date;
    offerPriceVersionId?: string;
  }
) {
  const priceVersion = options.offerPriceVersionId
    ? offer.priceVersions.find((candidate) => candidate.id === options.offerPriceVersionId)
    : offer.priceVersions.find((candidate) =>
        isPriceVersionVisibleByDefault({
          now: options.now,
          validUntil: candidate.validUntil,
          verificationStatus: candidate.verificationStatus
        })
      );

  if (!priceVersion) {
    throw new ApiError("NOT_FOUND", "사용할 수 있는 가격 버전을 찾을 수 없습니다.");
  }

  const validityStatus = getOfferPriceValidity({
    now: options.now,
    validUntil: priceVersion.validUntil
  });

  if (validityStatus === "expired") {
    throw new ApiError("PRICE_VERSION_EXPIRED", "유효기간이 지난 가격은 담을 수 없습니다.");
  }

  if (priceVersion.verificationStatus !== "verified") {
    throw new ApiError("CONFLICT", "검증된 가격만 비교방에 담을 수 있습니다.");
  }

  return priceVersion;
}

async function buildCompareCardCreateData(
  store: CompareRoomStore,
  input: AddCompareCardInput,
  options: {
    compareRoomId: string;
    now: Date;
    position: number;
    userId: string;
  }
) {
  const offer = await getOfferWithPriceVersions(store, input.offerId);
  const priceVersion = selectPriceVersion(offer, {
    now: options.now,
    offerPriceVersionId: input.offerPriceVersionId
  });

  return {
    addedByUserId: options.userId,
    compareRoomId: options.compareRoomId,
    offerId: offer.id,
    offerPriceVersionId: priceVersion.id,
    position: options.position,
    snapshotIncludedItems: toInputJson(priceVersion.includedItems),
    snapshotOptionalOptions: toInputJson(priceVersion.optionalOptions ?? []),
    snapshotPriceSummary: toInputJson(toSnapshotPriceSummary(priceVersion)),
    snapshotRequiredOptions: toInputJson(priceVersion.requiredOptions ?? []),
    snapshotTitle: offer.title
  };
}

async function refreshRoomStatus(
  store: CompareRoomStore,
  room: CompareRoomWithRelations,
  options: {
    action: string;
    actorCoupleMemberId?: string;
    actorUserId: string;
    now: Date;
  }
) {
  const nextStatus = deriveStatusForRoom(room);

  if (nextStatus === room.status) {
    return room;
  }

  const updated = await store.compareRoom.update({
    data: {
      bothApprovedAt: nextStatus === "both_approved" ? options.now : null,
      rejectedAt: nextStatus === "rejected" ? options.now : null,
      sharedAt:
        nextStatus === "shared" || nextStatus === "both_approved"
          ? (room.sharedAt ?? options.now)
          : room.sharedAt,
      status: nextStatus
    },
    include: compareRoomInclude,
    where: {
      id: room.id
    }
  });

  await store.decisionLog.create({
    data: {
      action: options.action,
      actorCoupleMemberId: options.actorCoupleMemberId,
      actorUserId: options.actorUserId,
      afterStatus: nextStatus,
      beforeStatus: room.status,
      coupleId: room.coupleId,
      targetId: room.id,
      targetType: "compare_room"
    }
  });

  return updated;
}

function assertCardBelongsToRoom(room: CompareRoomWithRelations, compareCardId: string) {
  const card = room.cards.find((candidate) => candidate.id === compareCardId);

  if (!card) {
    throw new ApiError("NOT_FOUND", "비교 카드를 찾을 수 없습니다.");
  }

  return card;
}

export function createCompareRoomService({
  now = () => new Date(),
  prisma
}: CompareRoomServiceOptions) {
  return {
    async addCard(userId: string, compareRoomId: string, input: AddCompareCardInput) {
      return prisma.$transaction(async (tx) => {
        const memberRoom = await getRoomWithAccess(tx, userId, compareRoomId);
        const member = await assertActiveMember(tx, userId, memberRoom.coupleId);

        if (!canMutateRoom(memberRoom)) {
          throw new ApiError("CONFLICT", "현재 상태에서는 비교 카드를 추가할 수 없습니다.");
        }

        if (memberRoom.cards.length >= maxCardsPerRoom) {
          throw new ApiError("CONFLICT", "비교방에는 최대 4개 상품만 담을 수 있습니다.");
        }

        if (memberRoom.cards.some((card) => card.offerId === input.offerId)) {
          throw new ApiError("CONFLICT", "이미 담긴 상품입니다.");
        }

        const card = await tx.compareCard.create({
          data: await buildCompareCardCreateData(tx, input, {
            compareRoomId,
            now: now(),
            position: memberRoom.cards.length + 1,
            userId
          })
        });

        await tx.decisionLog.create({
          data: {
            action: "add_compare_card",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: "active",
            coupleId: memberRoom.coupleId,
            metadata: {
              offerId: input.offerId
            },
            targetId: card.id,
            targetType: "compare_card"
          }
        });

        const room = await getRoomWithAccess(tx, userId, compareRoomId);
        const refreshedRoom = await refreshRoomStatus(tx, room, {
          action: "refresh_compare_room_after_card_add",
          actorCoupleMemberId: member.id,
          actorUserId: userId,
          now: now()
        });

        return {
          cardId: card.id,
          ...toCompareRoomDetail(refreshedRoom, userId)
        };
      });
    },

    async createComment(userId: string, compareRoomId: string, input: CreateCompareCommentInput) {
      return prisma.$transaction(async (tx) => {
        const room = await getRoomWithAccess(tx, userId, compareRoomId);
        const member = await assertActiveMember(tx, userId, room.coupleId);

        if (input.compareCardId) {
          assertCardBelongsToRoom(room, input.compareCardId);
        }

        const comment = await tx.compareComment.create({
          data: {
            body: input.body,
            compareCardId: input.compareCardId,
            compareRoomId,
            coupleMemberId: member.id,
            userId
          },
          include: {
            coupleMember: {
              include: {
                user: true
              }
            }
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "create_compare_comment",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            coupleId: room.coupleId,
            targetId: comment.id,
            targetType: "compare_comment"
          }
        });

        return {
          comment: toCommentResponse(comment, userId)
        };
      });
    },

    async createRoom(userId: string, coupleId: string, input: CreateCompareRoomInput) {
      const result = await prisma.$transaction(async (tx) => {
        const member = await assertActiveMember(tx, userId, coupleId);
        const activeMemberCount = await tx.coupleMember.count({
          where: {
            coupleId,
            status: "active"
          }
        });
        const initialStatus = input.initialOfferId
          ? activeMemberCount > 1
            ? "shared"
            : "waiting_partner"
          : "draft";
        const room = await tx.compareRoom.create({
          data: {
            coupleId,
            createdByUserId: userId,
            sharedAt: initialStatus === "shared" ? now() : null,
            status: initialStatus,
            title: input.title
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "create_compare_room",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: room.status,
            coupleId,
            targetId: room.id,
            targetType: "compare_room"
          }
        });

        if (input.initialOfferId) {
          await tx.compareCard.create({
            data: await buildCompareCardCreateData(
              tx,
              {
                offerId: input.initialOfferId,
                offerPriceVersionId: input.offerPriceVersionId
              },
              {
                compareRoomId: room.id,
                now: now(),
                position: 1,
                userId
              }
            )
          });
        }

        const createdRoom = await getRoomWithAccess(tx, userId, room.id);
        const refreshedRoom = await refreshRoomStatus(tx, createdRoom, {
          action: "refresh_compare_room_after_create",
          actorCoupleMemberId: member.id,
          actorUserId: userId,
          now: now()
        });

        return toCompareRoomDetail(refreshedRoom, userId);
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId,
        eventName: "compare_room_created",
        payload: {
          hasInitialOffer: Boolean(input.initialOfferId),
          roomId: result.compareRoom.id,
          status: result.compareRoom.status
        },
        userId
      });

      if (input.initialOfferId) {
        await recordAnalyticsEventSafely(prisma, {
          coupleId,
          eventName: "offer_compared",
          payload: {
            offerId: input.initialOfferId,
            roomId: result.compareRoom.id
          },
          userId
        });
      }

      return result;
    },

    async getDecisionLogs(userId: string, compareRoomId: string) {
      const room = await getRoomWithAccess(prisma, userId, compareRoomId);
      const targetIds = [
        room.id,
        ...room.cards.map((card) => card.id),
        ...room.approvals.map((approval) => approval.id),
        ...room.comments.map((comment) => comment.id)
      ];
      const logs = await prisma.decisionLog.findMany({
        include: {
          actorCoupleMember: true,
          actorUser: true
        },
        orderBy: {
          createdAt: "desc"
        },
        where: {
          OR: [
            {
              coupleId: room.coupleId,
              targetId: {
                in: targetIds
              }
            },
            {
              targetId: room.id,
              targetType: "compare_room"
            }
          ]
        }
      });

      return {
        logs: logs.map((log) => ({
          action: log.action,
          actorDisplayName:
            log.actorCoupleMember?.displayLabel ?? log.actorUser?.displayName ?? "시스템",
          afterStatus: log.afterStatus,
          beforeStatus: log.beforeStatus,
          createdAt: log.createdAt,
          id: log.id,
          targetId: log.targetId,
          targetType: log.targetType
        }))
      };
    },

    async getRoom(userId: string, compareRoomId: string) {
      const room = await getRoomWithAccess(prisma, userId, compareRoomId);

      return toCompareRoomDetail(room, userId);
    },

    async listRooms(userId: string, coupleId: string, query: ListCompareRoomsQuery) {
      await assertActiveMember(prisma, userId, coupleId);

      const rooms = await prisma.compareRoom.findMany({
        include: compareRoomInclude,
        orderBy: {
          updatedAt: "desc"
        },
        take: query.limit ?? defaultLimit,
        where: {
          coupleId,
          deletedAt: null,
          status: query.status ?? {
            not: "archived"
          }
        }
      });

      return {
        compareRooms: rooms.map((room) => toCompareRoomSummary(room, userId))
      };
    },

    async removeCard(userId: string, compareCardId: string) {
      return prisma.$transaction(async (tx) => {
        const card = await tx.compareCard.findFirst({
          include: {
            compareRoom: {
              include: compareRoomInclude
            }
          },
          where: {
            id: compareCardId,
            removedAt: null
          }
        });

        if (!card) {
          throw new ApiError("NOT_FOUND", "비교 카드를 찾을 수 없습니다.");
        }

        const member = await assertActiveMember(tx, userId, card.compareRoom.coupleId);

        if (!canMutateRoom(card.compareRoom)) {
          throw new ApiError("CONFLICT", "현재 상태에서는 비교 카드를 제거할 수 없습니다.");
        }

        const removed = await tx.compareCard.update({
          data: {
            removedAt: now()
          },
          where: {
            id: card.id
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "remove_compare_card",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: "removed",
            beforeStatus: "active",
            coupleId: card.compareRoom.coupleId,
            targetId: card.id,
            targetType: "compare_card"
          }
        });

        const room = await getRoomWithAccess(tx, userId, card.compareRoomId);
        const refreshedRoom = await refreshRoomStatus(tx, room, {
          action: "refresh_compare_room_after_card_remove",
          actorCoupleMemberId: member.id,
          actorUserId: userId,
          now: now()
        });

        return {
          compareCardId: removed.id,
          removedAt: removed.removedAt,
          ...toCompareRoomDetail(refreshedRoom, userId)
        };
      });
    },

    async submitApproval(userId: string, compareRoomId: string, input: SubmitApprovalInput) {
      const result = await prisma.$transaction(async (tx) => {
        const room = await getRoomWithAccess(tx, userId, compareRoomId);
        const member = await assertActiveMember(tx, userId, room.coupleId);
        const readiness = getCompareRoomReadiness({
          activeCardCount: room.cards.length,
          activeMemberCount: room.couple.members.length
        });

        if (!canMutateRoom(room) && room.status !== "rejected") {
          throw new ApiError("CONFLICT", "현재 상태에서는 승인 상태를 변경할 수 없습니다.");
        }

        if (!readiness.hasEnoughCards) {
          throw new ApiError(
            "COMPARE_ROOM_NOT_READY",
            "비교방에는 상품이 2개 이상 있어야 승인할 수 있습니다."
          );
        }

        if (!readiness.hasPartner) {
          throw new ApiError("PARTNER_REQUIRED", "배우자 참여 후 공동 승인할 수 있습니다.");
        }

        const existingApproval = await tx.approval.findFirst({
          where: {
            compareCardId: null,
            compareRoomId,
            coupleMemberId: member.id
          }
        });
        const approval = existingApproval
          ? await tx.approval.update({
              data: {
                comment: input.comment,
                decidedAt: now(),
                status: input.status
              },
              where: {
                id: existingApproval.id
              }
            })
          : await tx.approval.create({
              data: {
                comment: input.comment,
                compareCardId: null,
                compareRoomId,
                coupleMemberId: member.id,
                decidedAt: now(),
                status: input.status,
                userId
              }
            });

        await tx.decisionLog.create({
          data: {
            action: "submit_approval",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: approval.status,
            beforeStatus: existingApproval?.status,
            coupleId: room.coupleId,
            targetId: approval.id,
            targetType: "approval"
          }
        });

        const updatedRoom = await getRoomWithAccess(tx, userId, compareRoomId);
        const refreshedRoom = await refreshRoomStatus(tx, updatedRoom, {
          action: "refresh_compare_room_after_approval",
          actorCoupleMemberId: member.id,
          actorUserId: userId,
          now: now()
        });

        return {
          coupleId: room.coupleId,
          response: {
            approvalId: approval.id,
            ...toCompareRoomDetail(refreshedRoom, userId)
          }
        };
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId: result.coupleId,
        eventName: "approval_submitted",
        payload: {
          approvalStatus: input.status,
          roomId: compareRoomId
        },
        userId
      });

      if (result.response.compareRoom.status === "both_approved") {
        await recordAnalyticsEventSafely(prisma, {
          coupleId: result.coupleId,
          eventName: "both_approved",
          payload: {
            roomId: compareRoomId
          },
          userId
        });
      }

      return result.response;
    },

    async updateRoom(userId: string, compareRoomId: string, input: UpdateCompareRoomInput) {
      return prisma.$transaction(async (tx) => {
        const room = await getRoomWithAccess(tx, userId, compareRoomId);
        const member = await assertActiveMember(tx, userId, room.coupleId);

        if (input.status && ["both_approved", "rejected"].includes(input.status)) {
          throw new ApiError("CONFLICT", "승인 결과 상태는 승인 제출로만 변경할 수 있습니다.");
        }

        const nextStatus = input.status ?? room.status;
        const updated = await tx.compareRoom.update({
          data: {
            archivedAt: nextStatus === "archived" ? now() : room.archivedAt,
            status: nextStatus,
            title: input.title
          },
          include: compareRoomInclude,
          where: {
            id: room.id
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "update_compare_room",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: updated.status,
            beforeStatus: room.status,
            coupleId: room.coupleId,
            targetId: room.id,
            targetType: "compare_room"
          }
        });

        return toCompareRoomDetail(updated, userId);
      });
    }
  };
}

export type CompareRoomService = ReturnType<typeof createCompareRoomService>;
