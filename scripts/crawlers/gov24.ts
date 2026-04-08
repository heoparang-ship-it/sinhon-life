/**
 * 정부24 (gov.kr) 크롤러
 * 출산/신혼부부 관련 정부 서비스 정보 수집
 */

import * as cheerio from "cheerio";
import { Crawler, CrawlResult, fetchPage, cleanText } from "./base.js";

const URLS = [
  {
    url: "https://www.gov.kr/portal/rcvfvrSvc/dtlEx/148000000036",
    title: "첫만남이용권 신청",
  },
  {
    url: "https://www.gov.kr/portal/rcvfvrSvc/dtlEx/148000000045",
    title: "부모급여 신청",
  },
  {
    url: "https://www.gov.kr/portal/rcvfvrSvc/dtlEx/148000000015",
    title: "출산 관련 서비스 통합안내",
  },
];

export const gov24Crawler: Crawler = {
  name: "gov24",
  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const { url, title } of URLS) {
      try {
        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const contentArea =
          $(".cont_detail").text() ||
          $(".detail_area").text() ||
          $(".content").text() ||
          $("#contents").text() ||
          $("body").text();

        const extractedText = cleanText(contentArea);

        if (extractedText.length > 50) {
          results.push({
            source: "gov24",
            sourceUrl: url,
            title,
            rawHtml: html.substring(0, 50000),
            extractedText,
            crawledAt: new Date().toISOString(),
          });
        }

        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.warn(`[gov24] ${title} 크롤링 실패:`, err);
      }
    }

    return results;
  },
};
