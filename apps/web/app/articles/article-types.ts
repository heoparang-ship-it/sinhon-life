export type ArticleCtaLink = {
  description: string;
  href: string;
  label: string;
  type: "calculator" | "partner" | "policy";
};

export type ArticleFaq = {
  answer: string;
  question: string;
};

export type ArticleContentBlock = {
  body: string;
  sortOrder: number;
  type: "paragraph";
};

export type ArticleSummary = {
  category: string;
  id: string;
  ogImageUrl: string | null;
  publishedAt: string | null;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: string;
  summary: string | null;
  title: string;
};

export type ArticleDetail = ArticleSummary & {
  body: string;
  contentBlocks: ArticleContentBlock[];
  ctaLinks: ArticleCtaLink[];
  faq: ArticleFaq[];
};

export type ArticleListResponse = {
  articles: ArticleSummary[];
};

export type ArticleResponse = {
  article: ArticleDetail;
};
