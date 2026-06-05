import type { Server } from "node:http";
import { createServer } from "node:http";
import { createPrismaClient, type SinhonPrismaClient } from "@sinhon-os/database";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createAuthService } from "./auth-service.js";
import { createCompareRoomService } from "./compare-room-service.js";
import { createLeadRequestService } from "./lead-service.js";
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
  cardId?: string;
  cards: Array<{
    id: string;
    offerId: string;
  }>;
  compareRoom: {
    id: string;
    status: string;
  };
};

type LeadRequestPayload = {
  history?: {
    fromStatus: string | null;
    toStatus: string;
  };
  leadRequest: {
    contactPhoneMasked: string | null;
    histories: Array<{
      fromStatus: string | null;
      toStatus: string;
    }>;
    id: string;
    status: string;
    vendor: {
      name: string;
    };
  };
};

type LeadRequestListPayload = {
  leadRequests: LeadRequestPayload["leadRequest"][];
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

describeWithDatabase("lead request API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const compareCardIds = new Set<string>();
  const compareRoomIds = new Set<string>();
  const coupleIds = new Set<string>();
  const invitationIds = new Set<string>();
  const leadRequestIds = new Set<string>();
  const offerIds = new Set<string>();
  const priceVersionIds = new Set<string>();
  const userIds = new Set<string>();
  const vendorIds = new Set<string>();

  async function request<T>(
    path: string,
    options: { body?: unknown; method?: "GET" | "PATCH" | "POST"; token?: string } = {}
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
        name: `리드 테스트 스튜디오 ${Date.now()}-${index}`,
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
        description: "상담 신청 API 테스트 상품입니다.",
        displayOrder: index,
        region: "서울",
        status: "active",
        summary: "상담 신청으로 연결할 테스트 상품입니다.",
        title: `리드용 스튜디오 패키지 ${index}`
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
    const leads = [...leadRequestIds];
    const offers = [...offerIds];
    const priceVersions = [...priceVersionIds];
    const users = [...userIds];
    const vendors = [...vendorIds];

    if (
      users.length ||
      rooms.length ||
      cards.length ||
      leads.length ||
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
            { targetId: { in: leads } },
            { targetId: { in: offers } },
            { targetId: { in: vendors } }
          ]
        }
      });
    }

    if (leads.length || rooms.length || cards.length) {
      await prisma.leadStatusHistory.deleteMany({
        where: {
          leadRequest: {
            OR: [
              { id: { in: leads } },
              { compareRoomId: { in: rooms } },
              { compareCardId: { in: cards } }
            ]
          }
        }
      });
      await prisma.leadRequest.deleteMany({
        where: {
          OR: [
            { id: { in: leads } },
            { compareRoomId: { in: rooms } },
            { compareCardId: { in: cards } }
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
    leadRequestIds.clear();
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
        leadRequestService: createLeadRequestService({
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

  it("creates a lead only after both approvals, requires consent, and records status history", async () => {
    const owner = await registerUser({
      coupleDisplayName: "리드 커플",
      displayName: "민지",
      email: uniqueEmail("lead-owner")
    });
    await promoteUserToAdmin(owner);

    const invitation = await createInvitation(owner);
    const partner = await registerUser({
      displayName: "준호",
      email: uniqueEmail("lead-partner"),
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
          title: "상담 신청 비교"
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    const roomPayload = expectData(createdRoom.payload);
    const room = roomPayload.compareRoom;
    const firstCardId = roomPayload.cards[0]!.id;
    compareRoomIds.add(room.id);
    compareCardIds.add(firstCardId);

    const addedCard = await request<CompareRoomPayload>(`/compare-rooms/${room.id}/cards`, {
      body: {
        offerId: secondOffer.offerId,
        offerPriceVersionId: secondOffer.priceVersionId
      },
      method: "POST",
      token: owner.accessToken
    });
    const secondCardId = expectData(addedCard.payload).cardId!;
    compareCardIds.add(secondCardId);

    const beforeApproval = await request<LeadRequestPayload>(
      `/compare-rooms/${room.id}/lead-requests`,
      {
        body: {
          compareCardId: firstCardId,
          contactName: "민지",
          contactPhone: "010-1234-5678",
          preferredContactDates: [{ date: "2026-06-10", window: "afternoon" }],
          preferredContactMethod: "phone",
          privacyConsent: true
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    expect(beforeApproval.response.status).toBe(409);
    expect(beforeApproval.payload.error?.code).toBe("APPROVAL_REQUIRED");

    await request(`/compare-rooms/${room.id}/approvals/me`, {
      body: {
        status: "approved"
      },
      method: "POST",
      token: owner.accessToken
    });
    const partnerApproval = await request<CompareRoomPayload>(
      `/compare-rooms/${room.id}/approvals/me`,
      {
        body: {
          status: "approved"
        },
        method: "POST",
        token: partner.accessToken
      }
    );
    expect(expectData(partnerApproval.payload).compareRoom.status).toBe("both_approved");

    const withoutConsent = await request<LeadRequestPayload>(
      `/compare-rooms/${room.id}/lead-requests`,
      {
        body: {
          compareCardId: firstCardId,
          contactName: "민지",
          contactPhone: "010-1234-5678",
          preferredContactDates: [{ date: "2026-06-10", window: "afternoon" }],
          preferredContactMethod: "phone",
          privacyConsent: false
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    expect(withoutConsent.response.status).toBe(409);
    expect(withoutConsent.payload.error?.code).toBe("CONSENT_REQUIRED");

    const createdLead = await request<LeadRequestPayload>(
      `/compare-rooms/${room.id}/lead-requests`,
      {
        body: {
          compareCardId: firstCardId,
          contactName: "민지",
          contactPhone: "010-1234-5678",
          message: "주말 상담 가능 여부를 확인하고 싶습니다.",
          preferredContactDates: [{ date: "2026-06-10", window: "afternoon" }],
          preferredContactMethod: "phone",
          privacyConsent: true
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    expect(createdLead.response.status).toBe(201);
    const lead = expectData(createdLead.payload).leadRequest;
    leadRequestIds.add(lead.id);
    expect(lead).toMatchObject({
      contactPhoneMasked: expect.stringContaining("5678"),
      status: "submitted"
    });

    const adminWithoutToken = await request<LeadRequestListPayload>("/admin/lead-requests");
    expect(adminWithoutToken.response.status).toBe(401);

    const adminList = await request<LeadRequestListPayload>("/admin/lead-requests", {
      token: owner.accessToken
    });
    expect(expectData(adminList.payload).leadRequests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: lead.id,
          status: "submitted"
        })
      ])
    );

    const updated = await request<LeadRequestPayload>(`/admin/lead-requests/${lead.id}/status`, {
      body: {
        reason: "운영자가 접수 내용을 확인했습니다.",
        status: "viewed"
      },
      method: "PATCH",
      token: owner.accessToken
    });
    expect(expectData(updated.payload)).toMatchObject({
      history: {
        fromStatus: "submitted",
        toStatus: "viewed"
      },
      leadRequest: {
        status: "viewed"
      }
    });

    const partnerDetail = await request<LeadRequestPayload>(`/partner/lead-requests/${lead.id}`, {
      token: partner.accessToken
    });
    expect(expectData(partnerDetail.payload).leadRequest).toMatchObject({
      contactPhoneMasked: expect.stringContaining("5678"),
      status: "viewed"
    });
  });
});
