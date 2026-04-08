/**
 * 크롤러 공통 인터페이스 및 유틸리티
 */

export interface CrawlResult {
  source: string;       // 크롤러 이름 (e.g., "bokjiro")
  sourceUrl: string;    // 원본 URL
  title: string;        // 페이지 제목
  rawHtml: string;      // 원본 HTML
  extractedText: string; // 추출된 텍스트
  crawledAt: string;    // ISO 날짜
}

export interface Crawler {
  name: string;
  crawl(): Promise<CrawlResult[]>;
}

/**
 * fetch 래퍼 — 타임아웃 및 User-Agent 설정
 */
export async function fetchPage(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SinhonLifeBot/1.0; +https://sinhon.life)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * HTML 텍스트에서 불필요한 공백/태그 정리
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
