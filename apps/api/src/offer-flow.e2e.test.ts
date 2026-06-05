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
  user: {
    id: string;
  };
};

type VendorResponse = {
  vendor: {
    id: string;
    name: string;
    status: string;
    verificationStatus: string;
  };
};

type OfferResponse = {
  offer: {
    currentPriceVersion: PriceVersion | null;
    id: string;
    priceVersions?: Array<PriceVersion | null>;
    status: string;
    title: string;
  };
};

type PriceVersion = {
  basePrice: number | null;
  estimatedTotalPrice: number | null;
  id: string;
  includedItems: Array<{
    key: string;
    label: string;
  }>;
  requiredOptions: Array<{
    amount?: number;
    includedInEstimatedTotal?: boolean;
    key: string;
    label: string;
    pricingType: string;
  }>;
  validityStatus: string;
  validUntil: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
  version: number;
};

type OfferListResponse = {
  offers: Array<OfferResponse["offer"]>;
};

type PriceVersionResponse = {
  priceVersion: PriceVersion | null;
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

describeWithDatabase("offer API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const coupleIds = new Set<string>();
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
    coupleDisplayName: string;
    displayName: string;
    email: string;
  }) {
    const { payload, response } = await request<RegisterResponse>("/auth/register", {
      body: {
        coupleDisplayName: input.coupleDisplayName,
        displayName: input.displayName,
        email: input.email,
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

  async function cleanupRecords() {
    const couples = [...coupleIds];
    const offers = [...offerIds];
    const priceVersions = [...priceVersionIds];
    const users = [...userIds];
    const vendors = [...vendorIds];

    if (users.length || offers.length || priceVersions.length || vendors.length || couples.length) {
      await prisma.decisionLog.deleteMany({
        where: {
          OR: [
            { actorUserId: { in: users } },
            { coupleId: { in: couples } },
            { targetId: { in: offers } },
            { targetId: { in: priceVersions } },
            { targetId: { in: vendors } }
          ]
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

    if (couples.length) {
      await prisma.coupleInvitation.deleteMany({
        where: {
          coupleId: { in: couples }
        }
      });
      await prisma.coupleMember.deleteMany({
        where: {
          coupleId: { in: couples }
        }
      });
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

    coupleIds.clear();
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

  it("rejects admin offer changes from a non-admin user", async () => {
    const user = await registerUser({
      coupleDisplayName: "일반 커플",
      displayName: "민지",
      email: uniqueEmail("offer-non-admin")
    });

    const rejected = await request<VendorResponse>("/admin/vendors", {
      body: {
        category: "studio",
        name: "권한 없는 스튜디오",
        status: "active",
        verificationStatus: "verified"
      },
      method: "POST",
      token: user.accessToken
    });

    expect(rejected.response.status).toBe(403);
    expect(rejected.payload.error?.code).toBe("FORBIDDEN");
  });

  it("creates versioned offer prices and hides expired or unverified prices by default", async () => {
    const owner = await registerUser({
      coupleDisplayName: "상품 커플",
      displayName: "민지",
      email: uniqueEmail("offer-owner")
    });
    await promoteUserToAdmin(owner);

    const createdVendor = await request<VendorResponse>("/admin/vendors", {
      body: {
        category: "studio",
        description: "상품 API 테스트 파트너입니다.",
        name: `테스트 스튜디오 ${Date.now()}`,
        region: "서울",
        status: "active",
        verificationStatus: "verified",
        verifiedAt: "2026-06-01T00:00:00.000Z"
      },
      method: "POST",
      token: owner.accessToken
    });

    expect(createdVendor.response.status).toBe(201);
    const vendor = expectData(createdVendor.payload).vendor;
    vendorIds.add(vendor.id);

    const createdOffer = await request<OfferResponse>(`/admin/vendors/${vendor.id}/offers`, {
      body: {
        category: "studio",
        description: "본식 전 스튜디오 촬영 패키지입니다.",
        displayOrder: 1,
        region: "서울",
        status: "active",
        summary: "스튜디오 촬영과 기본 보정이 포함된 테스트 상품입니다.",
        title: "본식 전 스튜디오 패키지"
      },
      method: "POST",
      token: owner.accessToken
    });

    expect(createdOffer.response.status).toBe(201);
    const offer = expectData(createdOffer.payload).offer;
    offerIds.add(offer.id);

    const adminOfferList = await request<OfferListResponse>("/admin/offers?limit=50", {
      token: owner.accessToken
    });
    expect(expectData(adminOfferList.payload).offers.map((item) => item.id)).toContain(offer.id);

    const verifiedPrice = await request<PriceVersionResponse>(
      `/admin/offers/${offer.id}/price-versions`,
      {
        body: {
          additionalCostNote: "주말 촬영 시 추가 비용이 있을 수 있습니다.",
          basePrice: 1_500_000,
          cancellationPolicySummary: "예약 전 상담 단계에서는 취소 수수료가 없습니다.",
          includedItems: [
            {
              key: "studio_session",
              label: "스튜디오 촬영"
            }
          ],
          optionalOptions: [
            {
              amount: 250_000,
              key: "album_upgrade",
              label: "앨범 업그레이드",
              pricingType: "fixed"
            }
          ],
          requiredOptions: [
            {
              amount: 300_000,
              key: "weekend_fee",
              label: "주말 추가 비용",
              pricingType: "fixed"
            },
            {
              includedInEstimatedTotal: true,
              key: "assistant_fee",
              label: "헬퍼비",
              maxAmount: 150_000,
              minAmount: 100_000,
              pricingType: "range"
            }
          ],
          sourceType: "admin_test",
          sourceUrl: "https://example.com/offers/test-studio",
          validFrom: "2026-06-01T00:00:00.000Z",
          validUntil: "2026-09-01T00:00:00.000Z",
          verificationStatus: "verified",
          verifiedAt: "2026-06-02T00:00:00.000Z"
        },
        method: "POST",
        token: owner.accessToken
      }
    );

    const verifiedVersion = expectData(verifiedPrice.payload).priceVersion;
    expect(verifiedVersion).toMatchObject({
      basePrice: 1_500_000,
      estimatedTotalPrice: 1_950_000,
      verificationStatus: "verified",
      version: 1
    });
    priceVersionIds.add(verifiedVersion!.id);

    const unverifiedPrice = await request<PriceVersionResponse>(
      `/admin/offers/${offer.id}/price-versions`,
      {
        body: {
          basePrice: 1_200_000,
          includedItems: [
            {
              key: "studio_session",
              label: "스튜디오 촬영"
            }
          ],
          sourceType: "partner_input",
          validUntil: "2026-10-01T00:00:00.000Z",
          verificationStatus: "unverified"
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    const unverifiedVersion = expectData(unverifiedPrice.payload).priceVersion;
    expect(unverifiedVersion?.version).toBe(2);
    priceVersionIds.add(unverifiedVersion!.id);

    const expiredPrice = await request<PriceVersionResponse>(
      `/admin/offers/${offer.id}/price-versions`,
      {
        body: {
          basePrice: 2_000_000,
          includedItems: [
            {
              key: "studio_session",
              label: "스튜디오 촬영"
            }
          ],
          sourceType: "admin_test",
          validUntil: "2026-06-01T00:00:00.000Z",
          verificationStatus: "verified",
          verifiedAt: "2026-05-01T00:00:00.000Z"
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    const expiredVersion = expectData(expiredPrice.payload).priceVersion;
    expect(expiredVersion?.validityStatus).toBe("expired");
    priceVersionIds.add(expiredVersion!.id);

    const listed = await request<OfferListResponse>(
      `/offers?category=studio&budgetRange=1m_3m&vendorId=${vendor.id}`,
      {
        token: owner.accessToken
      }
    );
    const listedOffers = expectData(listed.payload).offers;
    expect(listedOffers).toHaveLength(1);
    expect(listedOffers[0]!.currentPriceVersion).toMatchObject({
      estimatedTotalPrice: 1_950_000,
      verificationStatus: "verified",
      version: 1
    });

    const currentPrice = await request<PriceVersionResponse>(
      `/offers/${offer.id}/price-versions/current`,
      {
        token: owner.accessToken
      }
    );
    expect(expectData(currentPrice.payload).priceVersion).toMatchObject({
      version: 1
    });

    const includeUnverified = await request<OfferListResponse>(
      `/offers?category=studio&includeUnverified=true&vendorId=${vendor.id}`,
      {
        token: owner.accessToken
      }
    );
    expect(expectData(includeUnverified.payload).offers[0]!.currentPriceVersion).toMatchObject({
      verificationStatus: "unverified",
      version: 2
    });

    const detail = await request<OfferResponse>(`/offers/${offer.id}`, {
      token: owner.accessToken
    });
    const offerDetail = expectData(detail.payload).offer;
    expect(offerDetail.priceVersions).toHaveLength(3);
    expect(offerDetail.currentPriceVersion?.requiredOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          includedInEstimatedTotal: true,
          key: "weekend_fee",
          label: "주말 추가 비용"
        })
      ])
    );

    const verifiedByAdmin = await request<PriceVersionResponse>(
      `/admin/offer-price-versions/${unverifiedVersion!.id}`,
      {
        body: {
          verificationStatus: "verified",
          verifiedAt: "2026-06-03T00:00:00.000Z"
        },
        method: "PATCH",
        token: owner.accessToken
      }
    );
    expect(expectData(verifiedByAdmin.payload).priceVersion).toMatchObject({
      id: unverifiedVersion!.id,
      verificationStatus: "verified"
    });

    await expect(
      prisma.decisionLog.count({
        where: {
          action: "update_offer_price_version",
          actorUserId: owner.user.id,
          targetId: unverifiedVersion!.id
        }
      })
    ).resolves.toBe(1);
  });
});
