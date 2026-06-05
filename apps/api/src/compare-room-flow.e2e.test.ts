import type { Server } from "node:http";
import { createServer } from "node:http";
import { createPrismaClient, type SinhonPrismaClient } from "@sinhon-os/database";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createAuthService } from "./auth-service.js";
import { createCompareRoomService } from "./compare-room-service.js";
import { createOfferService } from "./offer-service.js";
import { createOnboardingService } from "./onboarding-service.js";
import { createPolicyService } from "./policy-service.js";
import { createScenarioService } from "./scenario-service.js";
import { createApp } from "./server.js";

const TEST_SECRET = "test-auth-secret";
const TEST_WEB_BASE_URL = "http://localhost:3000";
const databaseUrl = process.env.DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

type ApiErrorPayload = {
  code: string;
  fields: Record<string, string[]>;
  message: string;
};

type ApiPayload<T> = {
  data?: T;
  error?: ApiErrorPayload;
};

type RegisterResponse = {
  accessToken: string;
  couple: {
    id: string;
  };
  member: {
    id: string;
  };
  user: {
    id: string;
  };
};

type InvitationResponse = {
  invitationId: string;
  token: string;
};

type VendorResponse = {
  vendor: {
    id: string;
  };
};

type OfferResponse = {
  offer: {
    id: string;
  };
};

type PriceVersionResponse = {
  priceVersion: {
    id: string;
  } | null;
};

type CompareRoomPayload = {
  approvals: Array<{
    displayLabel: string;
    isMine: boolean;
    status: string;
  }>;
  cardId?: string;
  cards: Array<{
    id: string;
    offerId: string;
    snapshotPriceSummary: {
      estimatedTotalPrice: number;
      version: number;
    };
    snapshotTitle: string;
  }>;
  comment?: {
    body: string;
    id: string;
  };
  compareRoom: {
    cardCount: number;
    id: string;
    myApprovalStatus: string;
    partnerStatus: string;
    readiness: {
      hasEnoughCards: boolean;
      hasPartner: boolean;
    };
    status: string;
    title: string;
  };
};

type CompareRoomListResponse = {
  compareRooms: CompareRoomPayload["compareRoom"][];
};

type DecisionLogResponse = {
  logs: Array<{
    action: string;
    afterStatus: string | null;
    targetType: string;
  }>;
};

function expectData<T>(payload: ApiPayload<T>): T {
  if (!payload.data) {
    throw new Error(`Expected data payload, received ${JSON.stringify(payload.error)}`);
  }

  return payload.data;
}

function uniqueEmail(label: string) {
  return `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

describeWithDatabase("compare room API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const compareCardIds = new Set<string>();
  const compareRoomIds = new Set<string>();
  const coupleIds = new Set<string>();
  const invitationIds = new Set<string>();
  const offerIds = new Set<string>();
  const priceVersionIds = new Set<string>();
  const userIds = new Set<string>();
  const vendorIds = new Set<string>();

  async function request<T>(
    path: string,
    options: { body?: unknown; method?: "DELETE" | "GET" | "PATCH" | "POST"; token?: string } = {}
  ) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      method: options.method ?? "GET"
    });
    const payload = (await response.json()) as ApiPayload<T>;

    return {
      payload,
      response
    };
  }

  async function registerUser(input: {
    coupleDisplayName?: string;
    displayName: string;
    email: string;
    invitationToken?: string;
  }) {
    const { payload, response } = await request<RegisterResponse>("/auth/register", {
      body: {
        coupleDisplayName: input.coupleDisplayName,
        displayName: input.displayName,
        email: input.email,
        invitationToken: input.invitationToken,
        privacyAccepted: true,
        termsAccepted: true
      },
      method: "POST"
    });

    expect(response.status).toBe(201);
    const data = expectData(payload);

    coupleIds.add(data.couple.id);
    userIds.add(data.user.id);

    return data;
  }

  async function promoteUserToAdmin(user: RegisterResponse) {
    await prisma.user.update({
      data: {
        status: "admin"
      },
      where: {
        id: user.user.id
      }
    });
  }

  async function createInvitation(owner: RegisterResponse) {
    const { payload, response } = await request<InvitationResponse>(
      `/couples/${owner.couple.id}/invitations`,
      {
        body: { expiresInHours: 24 },
        method: "POST",
        token: owner.accessToken
      }
    );

    expect(response.status).toBe(201);
    const data = expectData(payload);

    invitationIds.add(data.invitationId);

    return data;
  }

  async function createOfferFixture(owner: RegisterResponse, index: number) {
    const createdVendor = await request<VendorResponse>("/admin/vendors", {
      body: {
        category: "studio",
        name: `비교 테스트 스튜디오 ${Date.now()}-${index}`,
        region: "서울",
        status: "active",
        verificationStatus: "verified",
        verifiedAt: "2026-06-01T00:00:00.000Z"
      },
      method: "POST",
      token: owner.accessToken
    });
    const vendor = expectData(createdVendor.payload).vendor;
    vendorIds.add(vendor.id);

    const createdOffer = await request<OfferResponse>(`/admin/vendors/${vendor.id}/offers`, {
      body: {
        category: "studio",
        description: "비교방 API 테스트 상품입니다.",
        displayOrder: index,
        region: "서울",
        status: "active",
        summary: "비교방에 담을 테스트 상품입니다.",
        title: `비교용 스튜디오 패키지 ${index}`
      },
      method: "POST",
      token: owner.accessToken
    });
    const offer = expectData(createdOffer.payload).offer;
    offerIds.add(offer.id);

    const createdPrice = await request<PriceVersionResponse>(
      `/admin/offers/${offer.id}/price-versions`,
      {
        body: {
          basePrice: 1_000_000 + index * 100_000,
          includedItems: [
            {
              key: "studio_session",
              label: "스튜디오 촬영"
            }
          ],
          requiredOptions: [
            {
              amount: 100_000,
              key: "weekend_fee",
              label: "주말 추가 비용",
              pricingType: "fixed"
            }
          ],
          sourceType: "admin_test",
          validUntil: "2026-09-01T00:00:00.000Z",
          verificationStatus: "verified",
          verifiedAt: "2026-06-02T00:00:00.000Z"
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    const priceVersion = expectData(createdPrice.payload).priceVersion;
    priceVersionIds.add(priceVersion!.id);

    return {
      offerId: offer.id,
      priceVersionId: priceVersion!.id
    };
  }

  async function cleanupRecords() {
    const cards = [...compareCardIds];
    const rooms = [...compareRoomIds];
    const couples = [...coupleIds];
    const invitations = [...invitationIds];
    const offers = [...offerIds];
    const priceVersions = [...priceVersionIds];
    const users = [...userIds];
    const vendors = [...vendorIds];

    if (
      users.length ||
      rooms.length ||
      cards.length ||
      offers.length ||
      vendors.length ||
      couples.length
    ) {
      await prisma.decisionLog.deleteMany({
        where: {
          OR: [
            { actorUserId: { in: users } },
            { coupleId: { in: couples } },
            { targetId: { in: rooms } },
            { targetId: { in: cards } },
            { targetId: { in: offers } },
            { targetId: { in: vendors } }
          ]
        }
      });
    }

    if (rooms.length || cards.length) {
      await prisma.compareComment.deleteMany({
        where: {
          OR: [{ compareRoomId: { in: rooms } }, { compareCardId: { in: cards } }]
        }
      });
      await prisma.approval.deleteMany({
        where: {
          OR: [{ compareRoomId: { in: rooms } }, { compareCardId: { in: cards } }]
        }
      });
      await prisma.compareCard.deleteMany({
        where: {
          OR: [{ id: { in: cards } }, { compareRoomId: { in: rooms } }]
        }
      });
      await prisma.compareRoom.deleteMany({
        where: {
          id: { in: rooms }
        }
      });
    }

    if (priceVersions.length || offers.length) {
      await prisma.offerPriceVersion.deleteMany({
        where: {
          OR: [{ id: { in: priceVersions } }, { offerId: { in: offers } }]
        }
      });
    }

    if (offers.length || vendors.length) {
      await prisma.offer.deleteMany({
        where: {
          OR: [{ id: { in: offers } }, { vendorId: { in: vendors } }]
        }
      });
    }

    if (vendors.length) {
      await prisma.vendor.deleteMany({
        where: {
          id: { in: vendors }
        }
      });
    }

    if (invitations.length || users.length || couples.length) {
      await prisma.coupleInvitation.deleteMany({
        where: {
          OR: [
            { id: { in: invitations } },
            { coupleId: { in: couples } },
            { invitedByUserId: { in: users } },
            { invitedUserId: { in: users } },
            { acceptedByUserId: { in: users } }
          ]
        }
      });
    }

    if (users.length || couples.length) {
      await prisma.coupleMember.deleteMany({
        where: {
          OR: [{ userId: { in: users } }, { coupleId: { in: couples } }]
        }
      });
    }

    if (couples.length) {
      await prisma.couple.deleteMany({
        where: {
          id: { in: couples }
        }
      });
    }

    if (users.length) {
      await prisma.user.deleteMany({
        where: {
          id: { in: users }
        }
      });
    }

    compareCardIds.clear();
    compareRoomIds.clear();
    coupleIds.clear();
    invitationIds.clear();
    offerIds.clear();
    priceVersionIds.clear();
    userIds.clear();
    vendorIds.clear();
  }

  beforeAll(async () => {
    prisma = createPrismaClient({ databaseUrl: databaseUrl! });
    server = createServer(
      createApp({
        authService: createAuthService({
          authTokenSecret: TEST_SECRET,
          prisma,
          webBaseUrl: TEST_WEB_BASE_URL
        }),
        compareRoomService: createCompareRoomService({
          now: () => new Date("2026-06-05T00:00:00.000Z"),
          prisma
        }),
        offerService: createOfferService({
          now: () => new Date("2026-06-05T00:00:00.000Z"),
          prisma
        }),
        onboardingService: createOnboardingService({
          prisma
        }),
        policyService: createPolicyService({
          prisma
        }),
        scenarioService: createScenarioService({
          prisma
        })
      })
    );

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Failed to bind API test server.");
    }

    baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  });

  afterEach(async () => {
    await cleanupRecords();
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    await prisma.$disconnect();
  });

  it("creates a compare room, records comments, and reaches both_approved after both members approve", async () => {
    const owner = await registerUser({
      coupleDisplayName: "비교 커플",
      displayName: "민지",
      email: uniqueEmail("compare-owner")
    });
    await promoteUserToAdmin(owner);

    const invitation = await createInvitation(owner);
    const partner = await registerUser({
      displayName: "준호",
      email: uniqueEmail("compare-partner"),
      invitationToken: invitation.token
    });
    const firstOffer = await createOfferFixture(owner, 1);
    const secondOffer = await createOfferFixture(owner, 2);

    const createdRoom = await request<CompareRoomPayload>(
      `/couples/${owner.couple.id}/compare-rooms`,
      {
        body: {
          initialOfferId: firstOffer.offerId,
          offerPriceVersionId: firstOffer.priceVersionId,
          title: "스튜디오 최종 비교"
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    expect(createdRoom.response.status).toBe(201);
    const room = expectData(createdRoom.payload).compareRoom;
    compareRoomIds.add(room.id);
    expect(room).toMatchObject({
      cardCount: 1,
      partnerStatus: "connected",
      status: "shared"
    });
    expect(expectData(createdRoom.payload).cards[0]!.snapshotPriceSummary).toMatchObject({
      estimatedTotalPrice: 1_200_000,
      version: 1
    });
    compareCardIds.add(expectData(createdRoom.payload).cards[0]!.id);

    const addedCard = await request<CompareRoomPayload>(`/compare-rooms/${room.id}/cards`, {
      body: {
        offerId: secondOffer.offerId,
        offerPriceVersionId: secondOffer.priceVersionId
      },
      method: "POST",
      token: owner.accessToken
    });
    expect(addedCard.response.status).toBe(201);
    const roomWithTwoCards = expectData(addedCard.payload);
    compareCardIds.add(roomWithTwoCards.cardId!);
    expect(roomWithTwoCards.compareRoom).toMatchObject({
      cardCount: 2,
      status: "shared"
    });
    expect(roomWithTwoCards.compareRoom.readiness).toEqual({
      hasEnoughCards: true,
      hasPartner: true
    });

    const commented = await request<CompareRoomPayload>(`/compare-rooms/${room.id}/comments`, {
      body: {
        body: "주말 비용 포함 기준으로 다시 보자."
      },
      method: "POST",
      token: owner.accessToken
    });
    expect(commented.response.status).toBe(201);
    expect(expectData(commented.payload).comment).toMatchObject({
      body: "주말 비용 포함 기준으로 다시 보자."
    });

    const ownerApproval = await request<CompareRoomPayload>(
      `/compare-rooms/${room.id}/approvals/me`,
      {
        body: {
          comment: "예상 총액 기준으로 괜찮습니다.",
          status: "approved"
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    expect(ownerApproval.response.status).toBe(200);
    expect(expectData(ownerApproval.payload).compareRoom.status).toBe("shared");

    const partnerApproval = await request<CompareRoomPayload>(
      `/compare-rooms/${room.id}/approvals/me`,
      {
        body: {
          comment: "나도 승인합니다.",
          status: "approved"
        },
        method: "POST",
        token: partner.accessToken
      }
    );
    expect(partnerApproval.response.status).toBe(200);
    const approvedRoom = expectData(partnerApproval.payload);
    expect(approvedRoom.compareRoom).toMatchObject({
      myApprovalStatus: "approved",
      status: "both_approved"
    });
    expect(approvedRoom.approvals).toHaveLength(2);

    const listedRooms = await request<CompareRoomListResponse>(
      `/couples/${owner.couple.id}/compare-rooms`,
      {
        token: owner.accessToken
      }
    );
    expect(expectData(listedRooms.payload).compareRooms[0]).toMatchObject({
      cardCount: 2,
      status: "both_approved"
    });

    const logs = await request<DecisionLogResponse>(`/compare-rooms/${room.id}/decision-logs`, {
      token: owner.accessToken
    });
    expect(expectData(logs.payload).logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "submit_approval",
          targetType: "approval"
        }),
        expect.objectContaining({
          action: "refresh_compare_room_after_approval",
          afterStatus: "both_approved"
        })
      ])
    );
  });
});
