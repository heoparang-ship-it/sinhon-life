"use client";

import { Card, EmptyState, ErrorState, LoadingState } from "@sinhon-os/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, ApiClientError } from "../lib/api";
import type { ArticleListResponse, ArticleSummary } from "./article-types";

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

export function ArticlesClient() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await apiRequest<ArticleListResponse>("/articles?limit=20");
        setArticles(response.articles);
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiClientError
            ? caughtError
            : new ApiClientError({
                code: "NETWORK_ERROR",
                fields: {},
                message: "콘텐츠를 불러오지 못했습니다."
              })
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadArticles();
  }, []);

  if (isLoading) {
    return <LoadingState description="공개된 가이드를 불러오고 있습니다." />;
  }

  if (error) {
    return <ErrorState title="확인이 필요합니다" description={error.error.message} />;
  }

  if (!articles.length) {
    return (
      <EmptyState
        title="공개된 글이 없습니다"
        description="운영 CMS에서 글을 공개하면 이 목록에 표시됩니다."
      />
    );
  }

  return (
    <section className="article-grid" aria-label="콘텐츠 목록">
      {articles.map((article) => (
        <ArticleCard article={article} key={article.id} />
      ))}
    </section>
  );
}
