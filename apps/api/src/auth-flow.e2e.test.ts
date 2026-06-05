import type { Server } from "node:http";
import { createServer } from "node:http";
import { createPrismaClient, type SinhonPrismaClient } from "@sinhon-os/database";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createAuthService } from "./auth-service.js";
import { createCompareRoomService } from "./compare-room-service.js";
import { createAccessToken, createOpaqueToken, hashIdentifier } from "./local-auth.js";
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

type UserSummary = {
  displayName: string | null;
  id: string;
  status: string;
};

type CoupleSummary = {
  displayName: string;
  id: string;
  lifecycleStatus: string;
  onboardingStatus: string;
};

type MemberSummary = {
  coupleId: string;
  id: string;
  role: string;
  status: string;
  userId: string;
};

type RegisterResponse = {
  accessToken: string;
  couple: CoupleSummary;
  member: MemberSummary;
  nextStep: string;
  user: UserSummary;
};

type InvitationResponse = {
  expiresAt: string;
  invitationId: string;
  inviteUrl: string;
  token: string;
};

type InvitationPreviewResponse = {
  invitation: {
    coupleDisplayName: string;
    expiresAt: string;
    inviterDisplayName: string;
    status: string;
  };
};

type CurrentCoupleResponse = {
  couple: CoupleSummary | null;
  member: MemberSummary | null;
  partnerStatus: "connected" | "waiting_partner" | null;
};

type CurrentUserResponse = {
  currentCoupleId?: string;
  currentMember?: MemberSummary;
  roles: string[];
  user: UserSummary;
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

describeWithDatabase("auth and couple invitation API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const coupleIds = new Set<string>();
  const invitationIds = new Set<string>();
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

  it("registers an owner, creates an invite, and registers the invited partner", async () => {
    const owner = await registerUser({
      coupleDisplayName: "테스트 커플",
      displayName: "민지",
      email: uniqueEmail("owner")
    });
    const invitation = await createInvitation(owner);

    expect(invitation.inviteUrl).toBe(`${TEST_WEB_BASE_URL}/invite/${invitation.token}`);

    const { payload: previewPayload, response: previewResponse } =
      await request<InvitationPreviewResponse>(`/couple-invitations/${invitation.token}`);

    expect(previewResponse.status).toBe(200);
    expect(expectData(previewPayload).invitation).toMatchObject({
      coupleDisplayName: "테스트 커플",
      inviterDisplayName: "민지",
      status: "active"
    });

    const partner = await registerUser({
      displayName: "준호",
      email: uniqueEmail("partner"),
      invitationToken: invitation.token
    });

    expect(partner.couple.id).toBe(owner.couple.id);
    expect(partner.member.role).toBe("partner");
    expect(partner.nextStep).toBe("onboarding");

    const { payload: mePayload, response: meResponse } = await request<CurrentUserResponse>(
      "/auth/me",
      {
        token: partner.accessToken
      }
    );

    expect(meResponse.status).toBe(200);
    expect(expectData(mePayload).roles).toContain("partner");

    const { payload: couplePayload, response: coupleResponse } =
      await request<CurrentCoupleResponse>("/couples/current", {
        token: owner.accessToken
      });

    expect(coupleResponse.status).toBe(200);
    expect(expectData(couplePayload).partnerStatus).toBe("connected");
  });

  it("blocks accepting an invitation when the user already belongs to another couple", async () => {
    const owner = await registerUser({
      coupleDisplayName: "초대하는 커플",
      displayName: "민지",
      email: uniqueEmail("owner-conflict")
    });
    const invitation = await createInvitation(owner);
    const otherOwner = await registerUser({
      coupleDisplayName: "이미 있는 커플",
      displayName: "하린",
      email: uniqueEmail("other-owner")
    });

    const { payload, response } = await request(`/couple-invitations/${invitation.token}/accept`, {
      body: { accept: true },
      method: "POST",
      token: otherOwner.accessToken
    });

    expect(response.status).toBe(409);
    expect(payload.error?.code).toBe("ALREADY_IN_COUPLE");
  });

  it("blocks expired invitation tokens", async () => {
    const owner = await registerUser({
      coupleDisplayName: "만료 테스트 커플",
      displayName: "민지",
      email: uniqueEmail("owner-expired")
    });
    const expiredToken = createOpaqueToken();
    const invitation = await prisma.coupleInvitation.create({
      data: {
        coupleId: owner.couple.id,
        expiresAt: new Date(Date.now() - 60_000),
        invitedByUserId: owner.user.id,
        status: "active",
        tokenHash: hashIdentifier(expiredToken)
      }
    });
    const standaloneUser = await prisma.user.create({
      data: {
        authProvider: "api-test",
        authProviderUserId: `standalone-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        displayName: "초대받은 사람",
        emailHash: hashIdentifier(uniqueEmail("standalone")),
        status: "active"
      }
    });

    invitationIds.add(invitation.id);
    userIds.add(standaloneUser.id);

    const { payload, response } = await request(`/couple-invitations/${expiredToken}/accept`, {
      body: { accept: true },
      method: "POST",
      token: createAccessToken(standaloneUser.id, TEST_SECRET, 60 * 60)
    });

    expect(response.status).toBe(410);
    expect(payload.error?.code).toBe("INVITATION_EXPIRED");
  });
});
