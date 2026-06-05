import type { Server } from "node:http";
import { createServer } from "node:http";
import { createPrismaClient, type SinhonPrismaClient } from "@sinhon-os/database";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createAnalyticsService } from "./analytics-service.js";
import { createAuthService } from "./auth-service.js";
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

type AnalyticsEventResponse = {
  accepted: boolean;
  event: {
    eventName: string;
    id: string;
  };
};

type FunnelResponse = {
  funnel: Array<{
    count: number;
    eventName: string;
    step: number;
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

describeWithDatabase("analytics API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const coupleIds = new Set<string>();
  const eventIds = new Set<string>();
  const userIds = new Set<string>();

  async function request<T>(
    path: string,
    options: { body?: unknown; method?: "GET" | "POST"; token?: string } = {}
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

  async function registerUser(label: string) {
    const { payload, response } = await request<RegisterResponse>("/auth/register", {
      body: {
        coupleDisplayName: `${label} 커플`,
        displayName: label,
        email: uniqueEmail(label),
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
    const events = [...eventIds];
    const users = [...userIds];

    if (events.length || users.length || couples.length) {
      await prisma.eventLog.deleteMany({
        where: {
          OR: [{ id: { in: events } }, { userId: { in: users } }, { coupleId: { in: couples } }]
        }
      });
      await prisma.decisionLog.deleteMany({
        where: {
          OR: [{ actorUserId: { in: users } }, { coupleId: { in: couples } }]
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
    eventIds.clear();
    userIds.clear();
  }

  beforeAll(async () => {
    prisma = createPrismaClient({ databaseUrl: databaseUrl! });
    server = createServer(
      createApp({
        analyticsService: createAnalyticsService({
          prisma
        }),
        authService: createAuthService({
          authTokenSecret: TEST_SECRET,
          prisma,
          webBaseUrl: TEST_WEB_BASE_URL
        })
      })
    );
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected test server address.");
    }

    baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  });

  afterEach(async () => {
    await cleanupRecords();
  });

  afterAll(async () => {
    await cleanupRecords();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await prisma.$disconnect();
  });

  it("saves anonymous analytics events", async () => {
    const { payload, response } = await request<AnalyticsEventResponse>("/analytics/events", {
      body: {
        anonymousId: "anon-test-1",
        eventName: "calculator_started",
        payload: {
          entry: "calculators"
        }
      },
      method: "POST"
    });

    expect(response.status).toBe(201);
    const data = expectData(payload);
    eventIds.add(data.event.id);
    expect(data.accepted).toBe(true);
    expect(data.event.eventName).toBe("calculator_started");
  });

  it("blocks direct personal data in payload", async () => {
    const { payload, response } = await request<AnalyticsEventResponse>("/analytics/events", {
      body: {
        eventName: "lead_submitted",
        payload: {
          contactPhone: "010-1234-5678"
        }
      },
      method: "POST"
    });

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
    expect(payload.error?.fields.payload).toContain("contactPhone");
  });

  it("returns admin funnel counts", async () => {
    const admin = await registerUser("analytics-admin");
    await promoteUserToAdmin(admin);

    const { payload: eventPayload } = await request<AnalyticsEventResponse>("/analytics/events", {
      body: {
        coupleId: admin.couple.id,
        eventName: "lead_submitted",
        payload: {
          source: "test"
        }
      },
      method: "POST",
      token: admin.accessToken
    });
    eventIds.add(expectData(eventPayload).event.id);

    const { payload, response } = await request<FunnelResponse>("/admin/analytics/funnel", {
      token: admin.accessToken
    });

    expect(response.status).toBe(200);
    const leadMetric = expectData(payload).funnel.find(
      (metric) => metric.eventName === "lead_submitted"
    );
    expect(leadMetric?.count).toBeGreaterThanOrEqual(1);
  });
});
