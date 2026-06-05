import type { CreateArticleInput, ListArticlesQuery, UpdateArticleInput } from "@sinhon-os/schemas";
import type { SinhonPrismaClient } from "@sinhon-os/database";
import { ApiError } from "./api-errors.js";
import { recordAnalyticsEventSafely } from "./analytics-service.js";

type ContentStore = Pick<SinhonPrismaClient, "article" | "decisionLog">;

type ContentServiceOptions = {
  now?: () => Date;
  prisma: SinhonPrismaClient;
};

type ArticleRecord = NonNullable<Awaited<ReturnType<SinhonPrismaClient["article"]["findFirst"]>>>;

const defaultLimit = 10;

const faqByCategory: Record<string, Array<{ answer: string; question: string }>> = {
  budget: [
    {
      question: "예산표는 언제부터 만들면 좋나요?",
      answer:
        "예식장과 주거 방향을 정하기 전, 고정비와 선택비를 먼저 나누면 과지출을 줄일 수 있습니다."
    },
    {
      question: "샘플 금액을 그대로 써도 되나요?",
      answer:
        "샘플은 비교 출발점입니다. 실제 견적이나 정책 조건이 확인되면 시나리오에 직접 반영해 주세요."
    }
  ],
  housing: [
    {
      question: "주거 정책은 어떤 기준으로 확인하나요?",
      answer:
        "지역, 주거 형태, 예산 구간, 입주 예정일처럼 신청 조건에 자주 쓰이는 항목을 우선 확인합니다."
    },
    {
      question: "정책 가능성이 높으면 바로 신청 가능한가요?",
      answer:
        "신혼생활 결과는 준비용 판단입니다. 신청 전에는 반드시 공식 공고와 접수 기간을 확인해야 합니다."
    }
  ],
  wedding: [
    {
      question: "파트너 상품은 무엇을 기준으로 비교하나요?",
      answer:
        "검증 상태, 포함 항목, 필수 옵션, 유효기간을 함께 보고 둘 다 승인한 선택지만 상담 신청으로 넘깁니다."
    },
    {
      question: "견적이 바뀌면 어떻게 하나요?",
      answer:
        "운영자가 가격 버전을 새로 등록하고 검증 상태를 바꾸면 최신 카드가 비교 흐름에 반영됩니다."
    }
  ]
};

const fallbackFaq = [
  {
    question: "이 글과 연결된 기능은 어디에서 볼 수 있나요?",
    answer: "글 하단의 정책 톡과 인스타 아카이브 CTA를 통해 바로 이어서 확인할 수 있습니다."
  },
  {
    question: "작성 중인 글도 공개되나요?",
    answer: "아니요. published 상태이고 발행 시간이 지난 글만 공개 목록과 상세에 노출됩니다."
  }
];

function toDateTime(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

function getSeoDescription(article: ArticleRecord) {
  return (
    article.seoDescription ??
    article.summary ??
    article.body.replace(/\s+/g, " ").trim().slice(0, 150)
  );
}

function getFaq(category: string) {
  return faqByCategory[category] ?? fallbackFaq;
}

function getContentBlocks(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((body, index) => ({
      body,
      sortOrder: index + 1,
      type: "paragraph" as const
    }));
}

function getCtaLinks(article: ArticleRecord) {
  const categoryLabel =
    article.category === "housing" ? "주거" : article.category === "wedding" ? "예식" : "예산";

  return [
    {
      description: `${categoryLabel} 조건을 버튼으로 고르고 받을 수 있는 정책 가능성을 확인합니다.`,
      href: "/policies",
      label: "정책 톡 열기",
      type: "policy" as const
    },
    {
      description: "신혼생활 공식 인스타 피드와 릴스를 모아 봅니다.",
      href: "/archive",
      label: "아카이브 보기",
      type: "archive" as const
    }
  ];
}

function toArticleSummary(article: ArticleRecord) {
  return {
    category: article.category,
    id: article.id,
    ogImageUrl: article.ogImageUrl,
    publishedAt: article.publishedAt,
    seoDescription: getSeoDescription(article),
    seoTitle: article.seoTitle ?? article.title,
    slug: article.slug,
    status: article.status,
    summary: article.summary,
    title: article.title
  };
}

function toArticleDetail(article: ArticleRecord) {
  return {
    ...toArticleSummary(article),
    body: article.body,
    contentBlocks: getContentBlocks(article.body),
    ctaLinks: getCtaLinks(article),
    faq: getFaq(article.category)
  };
}

function publicArticleWhere(now: Date) {
  return {
    deletedAt: null,
    publishedAt: {
      lte: now
    },
    status: "published"
  };
}

function buildArticleCreateData(input: CreateArticleInput, now: Date) {
  const publishedAt = input.status === "published" ? (toDateTime(input.publishedAt) ?? now) : null;

  return {
    body: input.body,
    category: input.category,
    ogImageUrl: input.ogImageUrl,
    publishedAt,
    seoDescription: input.seoDescription,
    seoTitle: input.seoTitle,
    slug: input.slug,
    status: input.status,
    summary: input.summary,
    title: input.title
  };
}

function buildArticleUpdateData(input: UpdateArticleInput, article: ArticleRecord, now: Date) {
  const nextStatus = input.status ?? article.status;
  const publishedAt =
    nextStatus === "published"
      ? (toDateTime(input.publishedAt) ?? article.publishedAt ?? now)
      : input.status === "draft" || input.status === "archived"
        ? null
        : (toDateTime(input.publishedAt) ?? article.publishedAt);

  return {
    body: input.body,
    category: input.category,
    ogImageUrl: input.ogImageUrl,
    publishedAt,
    seoDescription: input.seoDescription,
    seoTitle: input.seoTitle,
    slug: input.slug,
    status: input.status,
    summary: input.summary,
    title: input.title
  };
}

async function assertUniqueSlug(store: ContentStore, slug: string, articleId?: string) {
  const existingArticle = await store.article.findFirst({
    where: {
      slug,
      ...(articleId
        ? {
            id: {
              not: articleId
            }
          }
        : {})
    }
  });

  if (existingArticle) {
    throw new ApiError("CONFLICT", "이미 사용 중인 글 slug입니다.");
  }
}

export function createContentService({ now = () => new Date(), prisma }: ContentServiceOptions) {
  return {
    async createArticle(userId: string, input: CreateArticleInput) {
      await assertUniqueSlug(prisma, input.slug);

      const article = await prisma.article.create({
        data: {
          ...buildArticleCreateData(input, now()),
          authorUserId: userId
        }
      });

      await prisma.decisionLog.create({
        data: {
          action: "create_article",
          actorUserId: userId,
          afterStatus: article.status,
          targetId: article.id,
          targetType: "article"
        }
      });

      return {
        article: toArticleDetail(article)
      };
    },

    async getPublishedArticle(slug: string) {
      const article = await prisma.article.findFirst({
        where: {
          ...publicArticleWhere(now()),
          slug
        }
      });

      if (!article) {
        throw new ApiError("NOT_FOUND", "공개된 글을 찾을 수 없습니다.");
      }

      await recordAnalyticsEventSafely(prisma, {
        eventName: "content_viewed",
        payload: {
          category: article.category,
          slug: article.slug
        }
      });

      return {
        article: toArticleDetail(article)
      };
    },

    async listAdminArticles(_userId: string, query: ListArticlesQuery) {
      const articles = await prisma.article.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: query.limit ?? defaultLimit,
        where: {
          category: query.category,
          deletedAt: null,
          status: query.status ?? (query.includeDrafts ? undefined : "published")
        }
      });

      return {
        articles: articles.map(toArticleSummary)
      };
    },

    async listPublishedArticles(query: ListArticlesQuery) {
      const articles = await prisma.article.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: query.limit ?? defaultLimit,
        where: {
          ...publicArticleWhere(now()),
          category: query.category
        }
      });

      return {
        articles: articles.map(toArticleSummary)
      };
    },

    async publishArticle(userId: string, articleId: string, publish: boolean) {
      const article = await prisma.article.findFirst({
        where: {
          deletedAt: null,
          id: articleId
        }
      });

      if (!article) {
        throw new ApiError("NOT_FOUND", "글을 찾을 수 없습니다.");
      }

      const updatedArticle = await prisma.article.update({
        data: {
          publishedAt: publish ? (article.publishedAt ?? now()) : null,
          status: publish ? "published" : "draft"
        },
        where: {
          id: articleId
        }
      });

      await prisma.decisionLog.create({
        data: {
          action: publish ? "publish_article" : "unpublish_article",
          actorUserId: userId,
          afterStatus: updatedArticle.status,
          beforeStatus: article.status,
          targetId: article.id,
          targetType: "article"
        }
      });

      return {
        article: toArticleDetail(updatedArticle)
      };
    },

    async updateArticle(userId: string, articleId: string, input: UpdateArticleInput) {
      const article = await prisma.article.findFirst({
        where: {
          deletedAt: null,
          id: articleId
        }
      });

      if (!article) {
        throw new ApiError("NOT_FOUND", "글을 찾을 수 없습니다.");
      }

      if (input.slug && input.slug !== article.slug) {
        await assertUniqueSlug(prisma, input.slug, articleId);
      }

      const updatedArticle = await prisma.article.update({
        data: buildArticleUpdateData(input, article, now()),
        where: {
          id: articleId
        }
      });

      await prisma.decisionLog.create({
        data: {
          action: "update_article",
          actorUserId: userId,
          afterStatus: updatedArticle.status,
          beforeStatus: article.status,
          targetId: article.id,
          targetType: "article"
        }
      });

      return {
        article: toArticleDetail(updatedArticle)
      };
    }
  };
}

export type ContentService = ReturnType<typeof createContentService>;
