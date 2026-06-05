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
import { createWorkspaceService } from "./workspace-service.js";

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

type MemberResponse = {
  members: Array<{
    displayLabel: string;
    id: string;
  }>;
};

type DocumentResponse = {
  document: {
    attachmentFileLabel: string | null;
    hasAttachment: boolean;
    id: string;
    status: string;
    title: string;
  };
};

type DocumentListResponse = {
  documents: DocumentResponse["document"][];
};

type TaskResponse = {
  task: {
    assignedCoupleMemberId: string | null;
    completedAt: string | null;
    id: string;
    status: string;
    title: string;
  };
};

type NotificationListResponse = {
  notifications: Array<{
    id: string;
    status: string;
    title: string;
    type: string;
  }>;
};

type NotificationResponse = {
  notification: {
    id: string;
    status: string;
  };
};

function expectData<T>(payload: ApiPayload<T>): T {
  if (!payload.data) {
    throw new Error(`Expected data payload, received ${JSON.stringify(payload.error)}`);
  }

  return payload.data;
}

function uniqueEmail(label: string) {
  const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "workspace";

  return `${safeLabel}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

describeWithDatabase("workspace API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const coupleIds = new Set<string>();
  const documentIds = new Set<string>();
  const notificationIds = new Set<string>();
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

  async function cleanupRecords() {
    const couples = [...coupleIds];
    const documents = [...documentIds];
    const notifications = [...notificationIds];
    const tasks = [...taskIds];
    const users = [...userIds];

    if (notifications.length || couples.length || users.length) {
      await prisma.notification.deleteMany({
        where: {
          OR: [
            { id: { in: notifications } },
            { coupleId: { in: couples } },
            { userId: { in: users } }
          ]
        }
      });
    }

    if (documents.length || couples.length) {
      await prisma.document.deleteMany({
        where: {
          OR: [{ id: { in: documents } }, { coupleId: { in: couples } }]
        }
      });
    }

    if (tasks.length || couples.length) {
      await prisma.task.deleteMany({
        where: {
          OR: [{ id: { in: tasks } }, { coupleId: { in: couples } }]
        }
      });
    }

    if (users.length || couples.length) {
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
    documentIds.clear();
    notificationIds.clear();
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
        leadRequestService: createLeadRequestService({
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
        }),
        workspaceService: createWorkspaceService({
          now: () => new Date("2026-06-05T00:00:00.000Z"),
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

  it("checks document permission and stores attachment selection without exposing filenames", async () => {
    const owner = await registerUser("문서소유자");
    const outsider = await registerUser("외부사용자");
    const members = await request<MemberResponse>(`/couples/${owner.couple.id}/members`, {
      token: owner.accessToken
    });
    const ownerMemberId = expectData(members.payload).members[0]!.id;

    const created = await request<DocumentResponse>(`/couples/${owner.couple.id}/documents`, {
      body: {
        documentType: "policy_document",
        dueAt: "2026-06-20T00:00:00.000Z",
        ownerCoupleMemberId: ownerMemberId,
        title: "혼인관계증명서"
      },
      method: "POST",
      token: owner.accessToken
    });
    expect(created.response.status).toBe(201);
    const document = expectData(created.payload).document;
    documentIds.add(document.id);
    expect(document.status).toBe("needed");

    const forbidden = await request<DocumentResponse>(`/documents/${document.id}`, {
      body: {
        status: "ready"
      },
      method: "PATCH",
      token: outsider.accessToken
    });
    expect(forbidden.response.status).toBe(403);

    const attached = await request<{ document: DocumentResponse["document"] }>(
      `/documents/${document.id}/attachments/presign`,
      {
        body: {
          contentType: "application/pdf",
          fileName: "민감한-원본파일명.pdf",
          size: 12_345
        },
        method: "POST",
        token: owner.accessToken
      }
    );
    const attachedDocument = expectData(attached.payload).document;
    expect(attachedDocument).toMatchObject({
      attachmentFileLabel: "첨부 선택됨",
      hasAttachment: true,
      status: "attached"
    });
    expect(JSON.stringify(attached.payload)).not.toContain("민감한-원본파일명");

    const listed = await request<DocumentListResponse>(`/couples/${owner.couple.id}/documents`, {
      token: owner.accessToken
    });
    expect(expectData(listed.payload).documents.map((item) => item.id)).toContain(document.id);
  });

  it("creates and completes tasks while saving due notifications", async () => {
    const owner = await registerUser("할일소유자");
    const members = await request<MemberResponse>(`/couples/${owner.couple.id}/members`, {
      token: owner.accessToken
    });
    const ownerMemberId = expectData(members.payload).members[0]!.id;

    const created = await request<TaskResponse>(`/couples/${owner.couple.id}/tasks`, {
      body: {
        assignedCoupleMemberId: ownerMemberId,
        description: "방문 전 필요한 서류를 확인합니다.",
        dueAt: "2026-06-15T00:00:00.000Z",
        title: "주민센터 방문 예약"
      },
      method: "POST",
      token: owner.accessToken
    });
    expect(created.response.status).toBe(201);
    const task = expectData(created.payload).task;
    taskIds.add(task.id);
    expect(task).toMatchObject({
      assignedCoupleMemberId: ownerMemberId,
      status: "open"
    });

    const completed = await request<TaskResponse>(`/tasks/${task.id}/complete`, {
      body: {
        completed: true
      },
      method: "POST",
      token: owner.accessToken
    });
    const completedTask = expectData(completed.payload).task;
    expect(completedTask.status).toBe("done");
    expect(completedTask.completedAt).toBeTruthy();

    const notifications = await request<NotificationListResponse>("/notifications", {
      token: owner.accessToken
    });
    const notificationList = expectData(notifications.payload).notifications;
    notificationList.forEach((notification) => notificationIds.add(notification.id));
    expect(notificationList.some((notification) => notification.type === "task_due")).toBe(true);

    const firstNotification = notificationList[0]!;
    const read = await request<NotificationResponse>(
      `/notifications/${firstNotification.id}/read`,
      {
        body: {
          read: true
        },
        method: "PATCH",
        token: owner.accessToken
      }
    );
    expect(expectData(read.payload).notification.status).toBe("read");
  });
});
