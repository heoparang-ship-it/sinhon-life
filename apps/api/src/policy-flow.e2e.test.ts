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

type PolicyProgramResponse = {
  policyProgram: {
    activeRuleVersion: {
      id: string;
      version: number;
    } | null;
    id: string;
    name: string;
    status: string;
  };
};

type PolicyRuleVersionResponse = {
  policyRuleVersion: {
    id: string;
    policyProgramId: string;
    status: string;
    version: number;
  };
};

type EligibilityResult = {
  disclaimer: string;
  id: string;
  missingInputs: Array<{
    key: string;
    label: string;
  }>;
  policyProgram: {
    id: string;
    name: string;
  };
  requiredDocuments: Array<{
    key: string;
    label: string;
    required: boolean;
  }>;
  resultReason: string;
  resultStatus: string;
};

type PolicyCheckResponse = {
  disclaimer: string;
  eligibilityResults: EligibilityResult[];
};

type EligibilityResultResponse = {
  eligibilityResult: EligibilityResult;
};

type EligibilityResultListResponse = {
  eligibilityResults: EligibilityResult[];
};

type TaskListResponse = {
  tasks: Array<{
    id: string;
    sourceId: string;
    sourceType: string;
    status: string;
    title: string;
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

describeWithDatabase("policy API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const coupleIds = new Set<string>();
  const eligibilityResultIds = new Set<string>();
  const policyProgramIds = new Set<string>();
  const policyRuleVersionIds = new Set<string>();
  const taskIds = new Set<string>();
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

  async function cleanupRecords() {
    const couples = [...coupleIds];
    const eligibilityResults = [...eligibilityResultIds];
    const policyPrograms = [...policyProgramIds];
    const policyRuleVersions = [...policyRuleVersionIds];
    const tasks = [...taskIds];
    const users = [...userIds];

    if (
      users.length ||
      couples.length ||
      eligibilityResults.length ||
      policyPrograms.length ||
      policyRuleVersions.length
    ) {
      await prisma.decisionLog.deleteMany({
        where: {
          OR: [
            { actorUserId: { in: users } },
            { coupleId: { in: couples } },
            { targetId: { in: couples } },
            { targetId: { in: policyPrograms } },
            { targetId: { in: policyRuleVersions } }
          ]
        }
      });
    }

    if (users.length || couples.length) {
      await prisma.notification.deleteMany({
        where: {
          OR: [{ userId: { in: users } }, { coupleId: { in: couples } }]
        }
      });
    }

    if (eligibilityResults.length || couples.length) {
      await prisma.document.deleteMany({
        where: {
          OR: [
            { coupleId: { in: couples } },
            { sourceId: { in: eligibilityResults }, sourceType: "eligibility_result" }
          ]
        }
      });
    }

    if (tasks.length || eligibilityResults.length) {
      await prisma.task.deleteMany({
        where: {
          OR: [
            { id: { in: tasks } },
            { sourceId: { in: eligibilityResults }, sourceType: "eligibility_result" }
          ]
        }
      });
    }

    if (eligibilityResults.length || couples.length || policyPrograms.length) {
      await prisma.eligibilityResult.deleteMany({
        where: {
          OR: [
            { id: { in: eligibilityResults } },
            { coupleId: { in: couples } },
            { policyProgramId: { in: policyPrograms } }
          ]
        }
      });
    }

    if (policyRuleVersions.length || policyPrograms.length) {
      await prisma.policyRuleVersion.deleteMany({
        where: {
          OR: [{ id: { in: policyRuleVersions } }, { policyProgramId: { in: policyPrograms } }]
        }
      });
    }

    if (policyPrograms.length) {
      await prisma.policyProgram.deleteMany({
        where: {
          id: { in: policyPrograms }
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
    eligibilityResultIds.clear();
    policyProgramIds.clear();
    policyRuleVersionIds.clear();
    taskIds.clear();
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
          now: () => new Date("2026-06-05T00:00:00.000Z"),
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

  it("registers a policy rule version, evaluates it, and creates document tasks", async () => {
    const owner = await registerUser({
      coupleDisplayName: "정책 커플",
      displayName: "민지",
      email: uniqueEmail("policy-owner")
    });
    await promoteUserToAdmin(owner);
    await completeOnboarding(owner);

    const category = `policy_test_${Date.now()}`;
    const createdProgram = await request<PolicyProgramResponse>("/admin/policy-programs", {
      body: {
        applicationEndAt: "2026-12-31T00:00:00.000Z",
        applicationStartAt: "2026-01-01T00:00:00.000Z",
        category,
        cautionText: "테스트용 샘플 정책입니다.",
        name: "서울 신혼 전세 준비 지원",
        providerName: "테스트시",
        region: "서울",
        requiredDocumentsSummary: [
          {
            key: "lease_contract",
            label: "임대차계약서",
            required: true
          }
        ],
        sourceUpdatedAt: "2026-06-01T00:00:00.000Z",
        sourceUrl: "https://example.com/policies/e2e-housing",
        status: "active",
        summary: "서울 전세 준비 신혼 커플의 조건을 확인하는 테스트 정책입니다.",
        verifiedAt: "2026-06-02T00:00:00.000Z"
      },
      method: "POST",
      token: owner.accessToken
    });

    expect(createdProgram.response.status).toBe(201);
    const program = expectData(createdProgram.payload).policyProgram;
    policyProgramIds.add(program.id);
    expect(program.status).toBe("active");

    const createdRule = await request<PolicyRuleVersionResponse>(
      `/admin/policy-programs/${program.id}/rule-versions`,
      {
        body: {
          effectiveFrom: "2026-01-01T00:00:00.000Z",
          effectiveTo: "2026-12-31T00:00:00.000Z",
          eligibilityCriteria: {
            conditions: [
              {
                inputKey: "preferredResidenceRegion",
                label: "희망 거주 지역",
                operator: "in",
                reason: "희망 거주 지역이 서울이어야 합니다.",
                value: ["서울"]
              },
              {
                inputKey: "housingType",
                label: "주거 형태",
                operator: "equals",
                reason: "전세 준비 가구를 대상으로 합니다.",
                value: "rental_jeonse"
              },
              {
                inputKey: "totalBudgetRange",
                label: "총 예산 구간",
                operator: "range_in",
                reason: "총 예산 구간이 테스트 정책 범위에 들어갑니다.",
                value: ["100m_200m"]
              }
            ],
            mode: "all",
            sample: false
          },
          requiredDocuments: [
            {
              key: "lease_contract",
              label: "임대차계약서",
              required: true
            }
          ],
          requiredInputs: [
            {
              key: "preferredResidenceRegion",
              label: "희망 거주 지역"
            },
            {
              key: "housingType",
              label: "주거 형태"
            },
            {
              key: "totalBudgetRange",
              label: "총 예산 구간"
            }
          ],
          resultReasonTemplate: {
            likely_eligible: "입력한 지역, 주거 형태, 예산 구간이 저장된 정책 룰과 맞습니다."
          },
          ruleSummary: "서울 전세 준비 및 예산 구간을 확인합니다.",
          sourceUpdatedAt: "2026-06-01T00:00:00.000Z",
          sourceUrl: "https://example.com/policies/e2e-housing/rules",
          status: "active",
          verifiedAt: "2026-06-02T00:00:00.000Z"
        },
        method: "POST",
        token: owner.accessToken
      }
    );

    expect(createdRule.response.status).toBe(201);
    const ruleVersion = expectData(createdRule.payload).policyRuleVersion;
    policyRuleVersionIds.add(ruleVersion.id);
    expect(ruleVersion.version).toBe(1);

    const listedPrograms = await request<{
      policyPrograms: PolicyProgramResponse["policyProgram"][];
    }>(`/policy-programs?category=${category}&region=${encodeURIComponent("서울")}`, {
      token: owner.accessToken
    });
    expect(expectData(listedPrograms.payload).policyPrograms).toHaveLength(1);

    const checked = await request<PolicyCheckResponse>(
      `/couples/${owner.couple.id}/policy-checks`,
      {
        body: {
          policyProgramIds: [program.id]
        },
        method: "POST",
        token: owner.accessToken
      }
    );

    expect(checked.response.status).toBe(201);
    const checkResult = expectData(checked.payload);
    expect(checkResult.disclaimer).toContain("가능성 안내");
    expect(checkResult.eligibilityResults).toHaveLength(1);
    const eligibilityResult = checkResult.eligibilityResults[0];
    eligibilityResultIds.add(eligibilityResult.id);
    expect(eligibilityResult.resultStatus).toBe("likely_eligible");
    expect(eligibilityResult.requiredDocuments).toEqual([
      {
        key: "lease_contract",
        label: "임대차계약서",
        required: true
      }
    ]);
    expect(eligibilityResult.resultReason).not.toMatch(/확정|승인|보장|대출 가능/);

    const detail = await request<EligibilityResultResponse>(
      `/eligibility-results/${eligibilityResult.id}`,
      {
        token: owner.accessToken
      }
    );
    expect(expectData(detail.payload).eligibilityResult.resultStatus).toBe("likely_eligible");

    const resultList = await request<EligibilityResultListResponse>(
      `/couples/${owner.couple.id}/eligibility-results`,
      {
        token: owner.accessToken
      }
    );
    expect(expectData(resultList.payload).eligibilityResults).toHaveLength(1);

    const tasks = await request<TaskListResponse>(
      `/eligibility-results/${eligibilityResult.id}/tasks`,
      {
        body: {
          dueInDays: 7
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    const taskResult = expectData(tasks.payload);
    taskResult.tasks.forEach((task) => taskIds.add(task.id));
    expect(taskResult.tasks).toHaveLength(1);
    expect(taskResult.tasks[0]).toMatchObject({
      sourceId: eligibilityResult.id,
      sourceType: "eligibility_result",
      status: "open",
      title: "서류 준비: 임대차계약서"
    });

    await expect(
      prisma.document.count({
        where: {
          coupleId: owner.couple.id,
          sourceId: eligibilityResult.id,
          sourceType: "eligibility_result"
        }
      })
    ).resolves.toBe(1);

    await expect(
      prisma.notification.count({
        where: {
          coupleId: owner.couple.id,
          type: "task_due"
        }
      })
    ).resolves.toBeGreaterThanOrEqual(1);
  });

  it("rejects resident registration number-like policy check input", async () => {
    const owner = await registerUser({
      coupleDisplayName: "민감정보 커플",
      displayName: "민지",
      email: uniqueEmail("policy-sensitive")
    });
    await completeOnboarding(owner);

    const rejected = await request<PolicyCheckResponse>(
      `/couples/${owner.couple.id}/policy-checks`,
      {
        body: {
          additionalInputs: {
            jumin: "900101-1234567"
          }
        },
        method: "POST",
        token: owner.accessToken
      }
    );

    expect(rejected.response.status).toBe(400);
    expect(rejected.payload.error?.code).toBe("VALIDATION_ERROR");
  });
});
