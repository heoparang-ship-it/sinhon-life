import { AppFrame, Card, EmptyState, ErrorState } from "@sinhon-os/ui/server";
import Link from "next/link";
import type { ArticleListResponse, ArticleSummary } from "./article-types";

type ApiEnvelope<T> = {
  data?: T;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export const dynamic = "force-dynamic";

async function fetchArticles() {
  try {
    const response = await fetch(`${API_BASE_URL}/articles?limit=20`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        articles: [],
        error: "콘텐츠를 불러오지 못했습니다."
      };
    }

    const envelope = (await response.json()) as ApiEnvelope<ArticleListResponse>;

    return {
      articles: envelope.data?.articles ?? [],
      error: null
    };
  } catch {
    return {
      articles: [],
      error: "콘텐츠를 불러오지 못했습니다."
    };
  }
}

const categoryLabels: Record<string, string> = {
  budget: "예산",
  housing: "주거",
  wedding: "예식"
};

function formatDate(value: string | null) {
  if (!value) return "발행일 미기록";

  return new Date(value).toLocaleDateString("ko-KR");
}

function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Card title={article.title} description={article.summary ?? article.seoDescription}>
      <div className="article-card-body">
        <span className="article-badge">
          {categoryLabels[article.category] ?? article.category}
        </span>
        <small>{formatDate(article.publishedAt)}</small>
      </div>
      <Link className="button-link secondary-link" href={`/articles/${article.slug}`}>
        상세 보기
      </Link>
    </Card>
  );
}

export default async function ArticlesPage() {
  const { articles, error } = await fetchArticles();

  return (
    <AppFrame
      eyebrow="가이드"
      title="신혼 준비 콘텐츠"
      description="예산, 주거, 예식 선택을 실제 기능으로 이어서 확인할 수 있는 운영 가이드입니다."
    >
      {error ? <ErrorState title="확인이 필요합니다" description={error} /> : null}
      {!error && !articles.length ? (
        <EmptyState
          title="공개된 글이 없습니다"
          description="운영 CMS에서 글을 공개하면 이 목록에 표시됩니다."
        />
      ) : null}
      {articles.length ? (
        <section className="article-grid" aria-label="콘텐츠 목록">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </section>
      ) : null}
    </AppFrame>
  );
}
