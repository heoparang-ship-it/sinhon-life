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

type InvitationResponse = {
  invitationId: string;
  token: string;
};

type OnboardingResponse = {
  couple: {
    id: string;
    onboardingStatus: string;
  };
  coupleInput: {
    isComplete: boolean;
    totalBudgetRange: string | null;
    weddingDate: string | null;
  };
  myProgress: {
    displayLabel: string | null;
    incomeRange: string | null;
    isComplete: boolean;
    onboardingStatus: string;
  };
  partnerProgress: {
    isComplete: boolean;
    onboardingStatus: string;
  } | null;
  partnerStatus: "connected" | "waiting_partner";
  status: string;
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

describeWithDatabase("couple onboarding API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const coupleIds = new Set<string>();
  const invitationIds = new Set<string>();
  const userIds = new Set<string>();

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

  async function savePersonal(coupleId: string, token: string, displayLabel = "민지") {
    const { payload, response } = await request<OnboardingResponse>(
      `/couples/${coupleId}/onboarding/me`,
      {
        body: {
          assetRange: "30m_50m",
          incomeRange: "50m_100m",
          nickname: displayLabel,
          phoneVerified: false,
          visibilityPreference: {
            asset: "private",
            income: "summary"
          },
          workRegion: "서울"
        },
        method: "PATCH",
        token
      }
    );

    expect(response.status).toBe(200);
    return expectData(payload);
  }

  async function saveCouple(coupleId: string, token: string) {
    const { payload, response } = await request<OnboardingResponse>(
      `/couples/${coupleId}/onboarding/couple`,
      {
        body: {
          cashOnHandRange: "30m_50m",
          childrenPlanStatus: "undecided",
          familySupportType: "possible",
          housingType: "rental_jeonse",
          loanConsiderationStatus: "considering",
          moveInPlanAt: "2026-12-01",
          preferredResidenceRegion: "서울",
          preferredWeddingStyle: "standard",
          totalBudgetRange: "100m_200m",
          weddingDate: "2026-10-01",
          weddingRegion: "서울"
        },
        method: "PATCH",
        token
      }
    );

    expect(response.status).toBe(200);
    return expectData(payload);
  }

  async function complete(coupleId: string, token: string) {
    const { payload, response } = await request<OnboardingResponse>(
      `/couples/${coupleId}/onboarding/complete`,
      {
        body: {
          confirm: true
        },
        method: "POST",
        token
      }
    );

    expect(response.status).toBe(200);
    return expectData(payload);
  }

  async function cleanupRecords() {
    const couples = [...coupleIds];
    const invitations = [...invitationIds];
    const users = [...userIds];

    if (users.length || couples.length) {
      await prisma.decisionLog.deleteMany({
        where: {
          OR: [{ actorUserId: { in: users } }, { coupleId: { in: couples } }]
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

    coupleIds.clear();
    invitationIds.clear();
    userIds.clear();
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

  it("saves personal and couple onboarding, then completes after both members finish", async () => {
    const owner = await registerUser({
      coupleDisplayName: "온보딩 테스트 커플",
      displayName: "민지",
      email: uniqueEmail("onboarding-owner")
    });
    const invitation = await createInvitation(owner);
    const partner = await registerUser({
      displayName: "준호",
      email: uniqueEmail("onboarding-partner"),
      invitationToken: invitation.token
    });

    const initial = await savePersonal(owner.couple.id, owner.accessToken);
    expect(initial.myProgress.onboardingStatus).toBe("in_progress");
    expect(initial.partnerStatus).toBe("connected");

    const coupleInput = await saveCouple(owner.couple.id, owner.accessToken);
    expect(coupleInput.coupleInput).toMatchObject({
      isComplete: true,
      totalBudgetRange: "100m_200m",
      weddingDate: "2026-10-01"
    });

    const ownerCompleted = await complete(owner.couple.id, owner.accessToken);
    expect(ownerCompleted.status).toBe("in_progress");
    expect(ownerCompleted.myProgress.isComplete).toBe(true);
    expect(ownerCompleted.partnerProgress?.isComplete).toBe(false);

    await savePersonal(partner.couple.id, partner.accessToken, "준호");
    const partnerCompleted = await complete(partner.couple.id, partner.accessToken);
    expect(partnerCompleted.status).toBe("completed");
    expect(partnerCompleted.couple.onboardingStatus).toBe("completed");
  });

  it("shows waiting partner when the owner completes before inviting a partner", async () => {
    const owner = await registerUser({
      coupleDisplayName: "단독 온보딩 커플",
      displayName: "민지",
      email: uniqueEmail("onboarding-solo")
    });

    await savePersonal(owner.couple.id, owner.accessToken);
    await saveCouple(owner.couple.id, owner.accessToken);
    const completed = await complete(owner.couple.id, owner.accessToken);

    expect(completed.partnerStatus).toBe("waiting_partner");
    expect(completed.status).toBe("in_progress");
    expect(completed.myProgress.isComplete).toBe(true);
  });

  it("blocks onboarding access from users in a different couple", async () => {
    const owner = await registerUser({
      coupleDisplayName: "내 커플",
      displayName: "민지",
      email: uniqueEmail("onboarding-owner-forbidden")
    });
    const otherOwner = await registerUser({
      coupleDisplayName: "다른 커플",
      displayName: "하린",
      email: uniqueEmail("onboarding-other-forbidden")
    });

    const { payload, response } = await request(`/couples/${owner.couple.id}/onboarding/me`, {
      body: {
        nickname: "하린"
      },
      method: "PATCH",
      token: otherOwner.accessToken
    });

    expect(response.status).toBe(403);
    expect(payload.error?.code).toBe("FORBIDDEN");
  });

  it("rejects invalid onboarding range values", async () => {
    const owner = await registerUser({
      coupleDisplayName: "검증 커플",
      displayName: "민지",
      email: uniqueEmail("onboarding-validation")
    });

    const { payload, response } = await request(`/couples/${owner.couple.id}/onboarding/couple`, {
      body: {
        totalBudgetRange: "250000000"
      },
      method: "PATCH",
      token: owner.accessToken
    });

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
  });
});
