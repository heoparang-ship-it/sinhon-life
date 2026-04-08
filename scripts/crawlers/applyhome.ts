/**
 * 청약홈 (applyhome.co.kr) 크롤러
 * 신혼부부 특별공급/신생아 특공 관련 정보 수집
 */

import * as cheerio from "cheerio";
import { Crawler, CrawlResult, fetchPage, cleanText } from "./base.js";

const URLS = [
  {
    url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancListView.do",
    title: "아파트 청약 공고 목록",
  },
  {
    url: "https://www.applyhome.co.kr/co/coa/selectSpSuplyGuide.do",
    title: "특별공급 안내",
  },
];

export const applyhomeCrawler: Crawler = {
  name: "applyhome",
  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const { url, title } of URLS) {
      try {
        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const contentArea =
          $(".content_area").text() ||
          $(".sub_content").text() ||
          $("#contents").text() ||
          $("main").text() ||
          $("body").text();

        const extractedText = cleanText(contentArea);

        if (extractedText.length > 50) {
          results.push({
            source: "applyhome",
            sourceUrl: url,
            title,
            rawHtml: html.substring(0, 50000),
            extractedText,
            crawledAt: new Date().toISOString(),
          });
        }

        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.warn(`[applyhome] ${title} 크롤링 실패:`, err);
      }
    }

    return results;
  },
};
