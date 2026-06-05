import { AppFrame, Card } from "@sinhon-os/ui/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "../../lib/api";
import type { ArticleDetail, ArticleResponse } from "../article-types";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ApiEnvelope<T> = {
  data?: T;
};

async function fetchArticle(slug: string): Promise<ArticleDetail | null> {
  const response = await fetch(`${getApiBaseUrl()}/articles/${encodeURIComponent(slug)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const envelope = (await response.json()) as ApiEnvelope<ArticleResponse>;

  return envelope.data?.article ?? null;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    return {
      title: "콘텐츠를 찾을 수 없습니다 | 신혼생활"
    };
  }

  return {
    description: article.seoDescription,
    openGraph: {
      description: article.seoDescription,
      images: article.ogImageUrl ? [{ url: article.ogImageUrl }] : undefined,
      title: article.seoTitle,
      type: "article"
    },
    title: `${article.seoTitle} | 신혼생활`
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <AppFrame
      eyebrow={article.category}
      title={article.title}
      description={article.summary ?? article.seoDescription}
    >
      <article className="article-detail">
        <section className="article-prose" aria-label="본문">
          {article.contentBlocks.map((block) => (
            <p key={`${block.type}-${block.sortOrder}`}>{block.body}</p>
          ))}
        </section>

        <section className="article-cta-grid" aria-label="관련 기능">
          {article.ctaLinks.map((cta) => (
            <Card description={cta.description} key={cta.type} title={cta.label}>
              <Link className="button-link secondary-link" href={cta.href}>
                이동
              </Link>
            </Card>
          ))}
        </section>

        <section className="article-faq" aria-label="FAQ">
          <h2>FAQ</h2>
          {article.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      </article>
    </AppFrame>
  );
}
