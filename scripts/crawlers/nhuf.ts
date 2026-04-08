/**
 * 주택도시기금 (nhuf.molit.go.kr) 크롤러
 * 전세대출/디딤돌/신생아 특례 대출 정보 수집
 */

import * as cheerio from "cheerio";
import { Crawler, CrawlResult, fetchPage, cleanText } from "./base.js";

const URLS = [
  {
    url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020101.jsp",
    title: "버팀목 전세대출",
  },
  {
    url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020301.jsp",
    title: "디딤돌 대출",
  },
  {
    url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020801.jsp",
    title: "신생아 특례 전세대출",
  },
  {
    url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020901.jsp",
    title: "신생아 특례 구입대출",
  },
];

export const nhufCrawler: Crawler = {
  name: "nhuf",
  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const { url, title } of URLS) {
      try {
        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const contentArea =
          $(".content").text() ||
          $(".sub_content").text() ||
          $("#container").text() ||
          $("body").text();

        const extractedText = cleanText(contentArea);

        if (extractedText.length > 50) {
          results.push({
            source: "nhuf",
            sourceUrl: url,
            title,
            rawHtml: html.substring(0, 50000),
            extractedText,
            crawledAt: new Date().toISOString(),
          });
        }

        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.warn(`[nhuf] ${title} 크롤링 실패:`, err);
      }
    }

    return results;
  },
};
