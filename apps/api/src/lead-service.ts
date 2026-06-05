import { createHash } from "node:crypto";
import type {
  CreateLeadRequestInput,
  ListLeadRequestsQuery,
  UpdateLeadStatusInput
} from "@sinhon-os/schemas";
import type { Prisma, SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";
import { sealSensitive, unsealSensitive } from "./sensitive-data.js";

type LeadRequestStore = Pick<
  SinhonPrismaClient,
  | "compareCard"
  | "compareRoom"
  | "coupleMember"
  | "decisionLog"
  | "leadRequest"
  | "leadStatusHistory"
  | "user"
>;

type LeadRequestServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type JsonInputValue =
  | boolean
  | number
  | string
  | JsonInputValue[]
  | { [key: string]: JsonInputValue | null };

const defaultLimit = 20;
const activeLeadStatuses = ["submitted", "viewed", "accepted", "contacted", "booked"] as const;

const compareRoomForLeadInclude = {
  cards: {
    include: {
      offer: {
        include: {
          vendor: true
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
  couple: {
    include: {
      members: {
        include: {
          user: true
        },
        where: {
          status: "active"
        }
      }
    }
  }
} satisfies Prisma.CompareRoomInclude;

const leadRequestInclude = {
  compareCard: {
    include: {
      offer: {
        include: {
          vendor: true
        }
      }
    }
  },
  compareRoom: true,
  histories: {
    orderBy: {
      createdAt: "asc" as const
    }
  },
  offer: true,
  submittedBy: true,
  vendor: true
} satisfies Prisma.LeadRequestInclude;

type CompareRoomForLead = Prisma.CompareRoomGetPayload<{
  include: typeof compareRoomForLeadInclude;
}>;
type CompareCardForLead = CompareRoomForLead["cards"][number];
type LeadRequestWithRelations = Prisma.LeadRequestGetPayload<{
  include: typeof leadRequestInclude;
}>;

function toInputJson(value: unknown): JsonInputValue {
  return JSON.parse(JSON.stringify(value)) as JsonInputValue;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function hashSensitive(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function maskName(value: string | null) {
  if (!value) return null;
  if (value.length <= 1) return "*";
  if (value.length === 2) return `${value[0]}*`;

  return `${value[0]}${"*".repeat(value.length - 2)}${value.at(-1)}`;
}

function maskPhone(value: string | null) {
  if (!value) return null;
  const digits = normalizePhone(value);
  if (digits.length < 4) return "****";

  return `${"*".repeat(Math.max(digits.length - 4, 4))}${digits.slice(-4)}`;
}

function previewMessage(value: string | null) {
  if (!value) return null;

  return value.length > 80 ? `${value.slice(0, 80)}...` : value;
}

function getSnapshotValidUntil(card: CompareCardForLead) {
  const summary = card.snapshotPriceSummary;

  if (typeof summary !== "object" || summary === null || Array.isArray(summary)) {
    return null;
  }

  const validUntil = (summary as Record<string, unknown>).validUntil;

  if (!validUntil) return null;

  const date = new Date(String(validUntil));

  return Number.isNaN(date.getTime()) ? null : date;
}

function assertSnapshotStillValid(card: CompareCardForLead, now: Date) {
  const validUntil = getSnapshotValidUntil(card);

  if (validUntil && validUntil.getTime() < now.getTime()) {
    throw new ApiError("PRICE_VERSION_EXPIRED", "유효기간이 지난 가격은 상담 신청할 수 없습니다.");
  }
}

function selectLeadCard(room: CompareRoomForLead, input: CreateLeadRequestInput) {
  if (!room.cards.length) {
    throw new ApiError("COMPARE_ROOM_NOT_READY", "상담 신청할 비교 카드가 없습니다.");
  }

  if (input.compareCardId) {
    const selected = room.cards.find((card) => card.id === input.compareCardId);

    if (!selected) {
      throw new ApiError("NOT_FOUND", "상담 신청할 비교 카드를 찾을 수 없습니다.");
    }

    return selected;
  }

  if (room.cards.length === 1) {
    return room.cards[0]!;
  }

  throw new ApiError("VALIDATION_ERROR", "상담 신청할 상품을 선택해 주세요.", {
    compareCardId: ["상담 신청할 상품을 선택해 주세요."]
  });
}

function toHistoryResponse(history: LeadRequestWithRelations["histories"][number]) {
  return {
    changedByRole: history.changedByRole,
    createdAt: history.createdAt,
    fromStatus: history.fromStatus,
    id: history.id,
    reason: history.reason,
    toStatus: history.toStatus
  };
}

function toLeadRequestResponse(lead: LeadRequestWithRelations) {
  const contactName = unsealSensitive(lead.contactNameEncrypted);
  const contactPhone = unsealSensitive(lead.contactPhoneEncrypted);
  const message = unsealSensitive(lead.messageEncrypted);

  return {
    compareCard: lead.compareCard
      ? {
          id: lead.compareCard.id,
          offerId: lead.compareCard.offerId,
          snapshotTitle: lead.compareCard.snapshotTitle
        }
      : null,
    compareCardId: lead.compareCardId,
    compareRoom: {
      id: lead.compareRoom.id,
      status: lead.compareRoom.status,
      title: lead.compareRoom.title
    },
    compareRoomId: lead.compareRoomId,
    contactNameMasked: maskName(contactName),
    contactPhoneMasked: maskPhone(contactPhone),
    createdAt: lead.createdAt,
    expiresAt: lead.expiresAt,
    histories: lead.histories.map(toHistoryResponse),
    id: lead.id,
    messagePreview: previewMessage(message),
    offer: lead.offer
      ? {
          category: lead.offer.category,
          id: lead.offer.id,
          title: lead.offer.title
        }
      : null,
    offerId: lead.offerId,
    offerPriceVersionId: lead.offerPriceVersionId,
    preferredContactDates: lead.preferredContactDates ?? [],
    preferredContactMethod: lead.preferredContactMethod,
    status: lead.status,
    submittedAt: lead.submittedAt,
    submittedBy: {
      displayName: lead.submittedBy.displayName,
      id: lead.submittedBy.id
    },
    vendor: {
      category: lead.vendor.category,
      id: lead.vendor.id,
      name: lead.vendor.name,
      region: lead.vendor.region
    }
  };
}

function toPartnerLeadResponse(lead: LeadRequestWithRelations) {
  const response = toLeadRequestResponse(lead);

  return {
    ...response,
    compareRoom: undefined,
    submittedBy: undefined
  };
}

async function assertActiveMember(store: LeadRequestStore, userId: string, coupleId: string) {
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

async function getLeadWithAccess(store: LeadRequestStore, userId: string, leadRequestId: string) {
  const lead = await store.leadRequest.findFirst({
    include: leadRequestInclude,
    where: {
      deletedAt: null,
      id: leadRequestId
    }
  });

  if (!lead) {
    throw new ApiError("NOT_FOUND", "상담 신청을 찾을 수 없습니다.");
  }

  await assertActiveMember(store, userId, lead.coupleId);

  return lead;
}

function createLeadWhere(query: ListLeadRequestsQuery): Prisma.LeadRequestWhereInput {
  return {
    deletedAt: null,
    status: query.status,
    submittedAt: {
      gte: query.submittedFrom ? new Date(query.submittedFrom) : undefined,
      lte: query.submittedTo ? new Date(query.submittedTo) : undefined
    },
    vendorId: query.vendorId
  };
}

export function createLeadRequestService({
  now = () => new Date(),
  prisma
}: LeadRequestServiceOptions) {
  return {
    async createLeadRequest(userId: string, compareRoomId: string, input: CreateLeadRequestInput) {
      const result = await prisma.$transaction(async (tx) => {
        const room = await tx.compareRoom.findFirst({
          include: compareRoomForLeadInclude,
          where: {
            deletedAt: null,
            id: compareRoomId
          }
        });

        if (!room) {
          throw new ApiError("NOT_FOUND", "비교방을 찾을 수 없습니다.");
        }

        const member = await assertActiveMember(tx, userId, room.coupleId);

        if (room.status !== "both_approved") {
          throw new ApiError(
            "APPROVAL_REQUIRED",
            "둘 다 승인된 비교방에서만 상담 신청할 수 있습니다."
          );
        }

        if (!input.privacyConsent) {
          throw new ApiError("CONSENT_REQUIRED", "개인정보 제공 동의가 필요합니다.");
        }

        const selectedCard = selectLeadCard(room, input);
        assertSnapshotStillValid(selectedCard, now());

        const duplicated = await tx.leadRequest.findFirst({
          where: {
            compareCardId: selectedCard.id,
            compareRoomId: room.id,
            deletedAt: null,
            status: {
              in: [...activeLeadStatuses]
            }
          }
        });

        if (duplicated) {
          throw new ApiError("CONFLICT", "이미 접수된 상담 신청이 있습니다.");
        }

        const submittedAt = now();
        const lead = await tx.leadRequest.create({
          data: {
            compareCardId: selectedCard.id,
            compareRoomId: room.id,
            consentGivenAt: submittedAt,
            contactNameEncrypted: sealSensitive(input.contactName),
            contactPhoneEncrypted: sealSensitive(input.contactPhone),
            contactPhoneHash: hashSensitive(normalizePhone(input.contactPhone)),
            coupleId: room.coupleId,
            expiresAt: new Date(submittedAt.getTime() + 30 * 24 * 60 * 60 * 1000),
            messageEncrypted: sealSensitive(input.message),
            offerId: selectedCard.offerId,
            offerPriceVersionId: selectedCard.offerPriceVersionId,
            preferredContactDates: toInputJson(input.preferredContactDates),
            preferredContactMethod: input.preferredContactMethod,
            status: "submitted",
            submittedAt,
            submittedByUserId: userId,
            vendorId: selectedCard.offer.vendorId
          },
          include: leadRequestInclude
        });

        await tx.leadStatusHistory.create({
          data: {
            changedByRole: "user",
            changedByUserId: userId,
            leadRequestId: lead.id,
            toStatus: "submitted"
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "create_lead_request",
            actorCoupleMemberId: member.id,
            actorUserId: userId,
            afterStatus: "submitted",
            coupleId: room.coupleId,
            metadata: {
              compareCardId: selectedCard.id,
              offerId: selectedCard.offerId,
              vendorId: selectedCard.offer.vendorId
            },
            targetId: lead.id,
            targetType: "lead_request"
          }
        });

        return {
          coupleId: room.coupleId,
          response: {
            leadRequest: toLeadRequestResponse(lead)
          }
        };
      });

      await recordAnalyticsEventSafely(prisma, {
        coupleId: result.coupleId,
        eventName: "lead_submitted",
        payload: {
          leadRequestId: result.response.leadRequest.id,
          offerId: result.response.leadRequest.offerId,
          vendorId: result.response.leadRequest.vendor.id
        },
        userId
      });

      return result.response;
    },

    async getLeadRequest(userId: string, leadRequestId: string) {
      const lead = await getLeadWithAccess(prisma, userId, leadRequestId);

      return {
        leadRequest: toLeadRequestResponse(lead)
      };
    },

    async getPartnerLeadRequest(userId: string, leadRequestId: string) {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          status: {
            in: ["active", "admin"]
          }
        }
      });

      if (!user) {
        throw new ApiError("UNAUTHENTICATED", "로그인이 필요합니다.");
      }

      const lead = await prisma.leadRequest.findFirst({
        include: leadRequestInclude,
        where: {
          deletedAt: null,
          id: leadRequestId
        }
      });

      if (!lead) {
        throw new ApiError("NOT_FOUND", "상담 신청을 찾을 수 없습니다.");
      }

      return {
        leadRequest: toPartnerLeadResponse(lead)
      };
    },

    async listAdminLeadRequests(userId: string, query: ListLeadRequestsQuery) {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          status: {
            in: ["active", "admin"]
          }
        }
      });

      if (!user) {
        throw new ApiError("UNAUTHENTICATED", "로그인이 필요합니다.");
      }

      const leads = await prisma.leadRequest.findMany({
        include: leadRequestInclude,
        orderBy: {
          submittedAt: "desc"
        },
        take: query.limit ?? defaultLimit,
        where: createLeadWhere(query)
      });

      return {
        leadRequests: leads.map(toLeadRequestResponse)
      };
    },

    async listCoupleLeadRequests(userId: string, coupleId: string, query: ListLeadRequestsQuery) {
      await assertActiveMember(prisma, userId, coupleId);

      const leads = await prisma.leadRequest.findMany({
        include: leadRequestInclude,
        orderBy: {
          submittedAt: "desc"
        },
        take: query.limit ?? defaultLimit,
        where: {
          ...createLeadWhere(query),
          coupleId
        }
      });

      return {
        leadRequests: leads.map(toLeadRequestResponse)
      };
    },

    async updateLeadStatus(userId: string, leadRequestId: string, input: UpdateLeadStatusInput) {
      return prisma.$transaction(async (tx) => {
        const actor = await tx.user.findFirst({
          where: {
            id: userId,
            status: {
              in: ["active", "admin"]
            }
          }
        });

        if (!actor) {
          throw new ApiError("UNAUTHENTICATED", "로그인이 필요합니다.");
        }

        const currentLead = await tx.leadRequest.findFirst({
          where: {
            deletedAt: null,
            id: leadRequestId
          }
        });

        if (!currentLead) {
          throw new ApiError("NOT_FOUND", "상담 신청을 찾을 수 없습니다.");
        }

        if (currentLead.status === input.status) {
          throw new ApiError("CONFLICT", "이미 같은 리드 상태입니다.");
        }

        const updated = await tx.leadRequest.update({
          data: {
            status: input.status
          },
          include: leadRequestInclude,
          where: {
            id: leadRequestId
          }
        });

        const history = await tx.leadStatusHistory.create({
          data: {
            changedByRole: "admin",
            changedByUserId: userId,
            fromStatus: currentLead.status,
            leadRequestId,
            reason: input.reason,
            toStatus: input.status
          }
        });

        await tx.decisionLog.create({
          data: {
            action: "update_lead_status",
            actorUserId: userId,
            afterStatus: input.status,
            beforeStatus: currentLead.status,
            coupleId: currentLead.coupleId,
            reason: input.reason,
            targetId: leadRequestId,
            targetType: "lead_request"
          }
        });

        return {
          history: toHistoryResponse(history),
          leadRequest: toLeadRequestResponse(updated)
        };
      });
    }
  };
}

export type LeadRequestService = ReturnType<typeof createLeadRequestService>;
