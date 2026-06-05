import type { Server } from "node:http";
import { createServer } from "node:http";
import { createPrismaClient, type SinhonPrismaClient } from "@sinhon-os/database";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createAuthService } from "./auth-service.js";
import { createContentService } from "./content-service.js";
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

type ArticleSummary = {
  ctaLinks?: Array<{
    href: string;
    type: string;
  }>;
  faq?: Array<{
    answer: string;
    question: string;
  }>;
  id: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: string;
  title: string;
};

type ArticleResponse = {
  article: ArticleSummary;
};

type ArticleListResponse = {
  articles: ArticleSummary[];
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

function uniqueSlug(label: string) {
  return `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

describeWithDatabase("content API", () => {
  let baseUrl: string;
  let prisma: SinhonPrismaClient;
  let server: Server;
  const articleIds = new Set<string>();
  const coupleIds = new Set<string>();
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
    const articles = [...articleIds];
    const couples = [...coupleIds];
    const users = [...userIds];

    if (users.length || articles.length || couples.length) {
      await prisma.decisionLog.deleteMany({
        where: {
          OR: [
            { actorUserId: { in: users } },
            { coupleId: { in: couples } },
            { targetId: { in: articles } }
          ]
        }
      });
    }

    if (articles.length) {
      await prisma.article.deleteMany({
        where: {
          id: { in: articles }
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

    articleIds.clear();
    coupleIds.clear();
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
        contentService: createContentService({
          prisma
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

  it("keeps drafts private and exposes published articles with SEO, FAQ, and CTA links", async () => {
    const admin = await registerUser("content-admin");
    await promoteUserToAdmin(admin);
    const slug = uniqueSlug("content-guide");

    const { payload: createPayload, response: createResponse } = await request<ArticleResponse>(
      "/admin/articles",
      {
        body: {
          body: "예산표는 고정비와 선택비를 나누는 것부터 시작합니다.\n\n그 다음 정책과 파트너 상품을 확인합니다.",
          category: "budget",
          ogImageUrl: "https://example.com/og/content-guide.png",
          seoDescription: "신혼 예산 콘텐츠의 SEO 설명입니다.",
          seoTitle: "신혼 예산 콘텐츠 SEO",
          slug,
          status: "draft",
          summary: "콘텐츠 요약입니다.",
          title: "신혼 예산 콘텐츠"
        },
        method: "POST",
        token: admin.accessToken
      }
    );

    expect(createResponse.status).toBe(201);
    const draft = expectData(createPayload).article;
    articleIds.add(draft.id);
    expect(draft.status).toBe("draft");

    const { payload: hiddenListPayload } = await request<ArticleListResponse>("/articles?limit=50");
    expect(expectData(hiddenListPayload).articles.some((article) => article.slug === slug)).toBe(
      false
    );

    const { response: hiddenDetailResponse } = await request<ArticleResponse>(`/articles/${slug}`);
    expect(hiddenDetailResponse.status).toBe(404);

    const { payload: publishPayload, response: publishResponse } = await request<ArticleResponse>(
      `/admin/articles/${draft.id}/publish`,
      {
        body: {
          publish: true
        },
        method: "POST",
        token: admin.accessToken
      }
    );
    expect(publishResponse.status).toBe(200);
    expect(expectData(publishPayload).article.status).toBe("published");

    const { payload: publicListPayload } = await request<ArticleListResponse>("/articles?limit=50");
    expect(expectData(publicListPayload).articles.some((article) => article.slug === slug)).toBe(
      true
    );

    const { payload: detailPayload, response: detailResponse } = await request<ArticleResponse>(
      `/articles/${slug}`
    );
    expect(detailResponse.status).toBe(200);
    const detail = expectData(detailPayload).article;

    expect(detail.seoTitle).toBe("신혼 예산 콘텐츠 SEO");
    expect(detail.seoDescription).toBe("신혼 예산 콘텐츠의 SEO 설명입니다.");
    expect(detail.faq?.length).toBeGreaterThan(0);
    expect(detail.ctaLinks?.map((cta) => cta.href).sort()).toEqual([
      "/offers",
      "/policies",
      "/scenarios"
    ]);
  });

  it("blocks non-admin users from CMS mutations", async () => {
    const user = await registerUser("content-user");
    const { response } = await request<ArticleResponse>("/admin/articles", {
      body: {
        body: "초안",
        category: "budget",
        slug: uniqueSlug("blocked-content"),
        title: "권한 없는 초안"
      },
      method: "POST",
      token: user.accessToken
    });

    expect(response.status).toBe(403);
  });
});
