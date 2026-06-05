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

type ScenarioResponse = {
  scenario: {
    containsSampleValue: boolean;
    id: string;
    items: Array<{
      amount: number;
      frequency: string;
      label: string;
    }>;
    monthlyAmount: number | null;
    nextActions: string[];
    shortfallAmount: number | null;
    status: string;
    totalAmount: number | null;
    warnings: string[];
  };
};

type ScenarioListResponse = {
  scenarios: Array<{
    id: string;
    status: string;
    title: string;
    totalAmount: number | null;
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

describeWithDatabase("scenario API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const coupleIds = new Set<string>();
  const scenarioIds = new Set<string>();
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

  async function completeOnboarding(user: RegisterResponse) {
    await request(`/couples/${user.couple.id}/onboarding/me`, {
      body: {
        assetRange: "50m_100m",
        incomeRange: "50m_100m",
        nickname: "민지",
        phoneVerified: true,
        visibilityPreference: {
          asset: "summary",
          income: "summary"
        },
        workRegion: "서울"
      },
      method: "PATCH",
      token: user.accessToken
    });
    await request(`/couples/${user.couple.id}/onboarding/couple`, {
      body: {
        cashOnHandRange: "50m_100m",
        childrenPlanStatus: "undecided",
        familySupportType: "possible",
        housingType: "rental_jeonse",
        loanConsiderationStatus: "considering",
        moveInPlanAt: "2027-03-01",
        preferredResidenceRegion: "서울",
        preferredWeddingStyle: "small",
        totalBudgetRange: "100m_200m",
        weddingDate: "2027-05-15",
        weddingRegion: "서울"
      },
      method: "PATCH",
      token: user.accessToken
    });
    const { response } = await request(`/couples/${user.couple.id}/onboarding/complete`, {
      body: {
        confirm: true
      },
      method: "POST",
      token: user.accessToken
    });

    expect(response.status).toBe(200);
  }

  function scenarioBody() {
    return {
      budgetBasis: {
        availableBudgetAmount: 21_000_000
      },
      items: [
        {
          amount: 16_000_000,
          amountType: "user_input",
          category: "wedding",
          frequency: "one_time",
          isRequired: true,
          label: "예식장 예상 비용",
          sortOrder: 10
        },
        {
          amount: 8_000_000,
          amountType: "sample",
          category: "appliance",
          frequency: "one_time",
          isRequired: false,
          label: "가전 샘플",
          sortOrder: 20
        },
        {
          amount: 1_200_000,
          amountType: "user_input",
          category: "housing_monthly",
          frequency: "monthly",
          isRequired: false,
          label: "월 주거비",
          sortOrder: 30
        }
      ],
      title: "봄 예식 기본 시나리오",
      useOnboardingDefaults: true
    };
  }

  async function cleanupRecords() {
    const couples = [...coupleIds];
    const scenarios = [...scenarioIds];
    const users = [...userIds];

    if (users.length || couples.length || scenarios.length) {
      await prisma.decisionLog.deleteMany({
        where: {
          OR: [
            { actorUserId: { in: users } },
            { coupleId: { in: couples } },
            { targetId: { in: scenarios } }
          ]
        }
      });
    }

    if (scenarios.length) {
      await prisma.scenarioItem.deleteMany({
        where: {
          scenarioId: { in: scenarios }
        }
      });
      await prisma.scenario.deleteMany({
        where: {
          id: { in: scenarios }
        }
      });
    }

    if (couples.length) {
      const extraScenarios = await prisma.scenario.findMany({
        select: {
          id: true
        },
        where: {
          coupleId: { in: couples }
        }
      });
      const extraScenarioIds = extraScenarios.map((scenario) => scenario.id);

      if (extraScenarioIds.length) {
        await prisma.scenarioItem.deleteMany({
          where: {
            scenarioId: { in: extraScenarioIds }
          }
        });
        await prisma.scenario.deleteMany({
          where: {
            id: { in: extraScenarioIds }
          }
        });
      }
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
    scenarioIds.clear();
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

  it("creates, lists, reads, evaluates, and archives a scenario", async () => {
    const owner = await registerUser({
      coupleDisplayName: "시나리오 커플",
      displayName: "민지",
      email: uniqueEmail("scenario-owner")
    });
    await completeOnboarding(owner);

    const { payload, response } = await request<ScenarioResponse>(
      `/couples/${owner.couple.id}/scenarios`,
      {
        body: scenarioBody(),
        method: "POST",
        token: owner.accessToken
      }
    );

    expect(response.status).toBe(201);
    const created = expectData(payload).scenario;
    scenarioIds.add(created.id);
    expect(created.totalAmount).toBe(24_000_000);
    expect(created.monthlyAmount).toBe(1_200_000);
    expect(created.shortfallAmount).toBe(3_000_000);
    expect(created.containsSampleValue).toBe(true);
    expect(created.warnings).toEqual(
      expect.arrayContaining([
        "sample_value_used",
        "shortfall_present",
        "monthly_amount_present",
        "loan_considered_needs_review"
      ])
    );
    expect(created.nextActions.length).toBeGreaterThan(0);

    const listed = await request<ScenarioListResponse>(`/couples/${owner.couple.id}/scenarios`, {
      token: owner.accessToken
    });
    expect(expectData(listed.payload).scenarios).toHaveLength(1);

    const detail = await request<ScenarioResponse>(`/scenarios/${created.id}`, {
      token: owner.accessToken
    });
    expect(expectData(detail.payload).scenario.items).toHaveLength(3);

    const evaluated = await request<ScenarioResponse & { warnings: string[] }>(
      `/scenarios/${created.id}/evaluate`,
      {
        body: {},
        method: "POST",
        token: owner.accessToken
      }
    );
    expect(evaluated.response.status).toBe(200);
    expect(expectData(evaluated.payload).warnings).toContain("sample_value_used");

    const archived = await request<{ scenarioId: string; status: string }>(
      `/scenarios/${created.id}/archive`,
      {
        method: "POST",
        token: owner.accessToken
      }
    );
    expect(archived.response.status).toBe(200);
    expect(expectData(archived.payload)).toEqual({
      scenarioId: created.id,
      status: "archived"
    });
  });

  it("blocks scenario creation before onboarding completion", async () => {
    const owner = await registerUser({
      coupleDisplayName: "미완료 커플",
      displayName: "민지",
      email: uniqueEmail("scenario-incomplete")
    });

    const { payload, response } = await request(`/couples/${owner.couple.id}/scenarios`, {
      body: scenarioBody(),
      method: "POST",
      token: owner.accessToken
    });

    expect(response.status).toBe(409);
    expect(payload.error?.code).toBe("ONBOARDING_INCOMPLETE");
  });

  it("blocks scenario access from another couple", async () => {
    const owner = await registerUser({
      coupleDisplayName: "내 시나리오 커플",
      displayName: "민지",
      email: uniqueEmail("scenario-owner-forbidden")
    });
    const other = await registerUser({
      coupleDisplayName: "다른 시나리오 커플",
      displayName: "하린",
      email: uniqueEmail("scenario-other-forbidden")
    });
    await completeOnboarding(owner);

    const created = await request<ScenarioResponse>(`/couples/${owner.couple.id}/scenarios`, {
      body: scenarioBody(),
      method: "POST",
      token: owner.accessToken
    });
    const scenarioId = expectData(created.payload).scenario.id;
    scenarioIds.add(scenarioId);

    const { payload, response } = await request(`/scenarios/${scenarioId}`, {
      token: other.accessToken
    });

    expect(response.status).toBe(403);
    expect(payload.error?.code).toBe("FORBIDDEN");
  });

  it("rejects invalid scenario amounts and categories", async () => {
    const owner = await registerUser({
      coupleDisplayName: "검증 시나리오 커플",
      displayName: "민지",
      email: uniqueEmail("scenario-validation")
    });
    await completeOnboarding(owner);

    const { payload, response } = await request(`/couples/${owner.couple.id}/scenarios`, {
      body: {
        items: [
          {
            amount: -10,
            category: "loan_limit",
            label: "대출 가능 금액"
          }
        ],
        title: "잘못된 시나리오"
      },
      method: "POST",
      token: owner.accessToken
    });

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
  });
});
