/**
 * 복지로 (bokjiro.go.kr) 크롤러
 * 신혼부부/출산 관련 복지 정책 수집
 */

import * as cheerio from "cheerio";
import { Crawler, CrawlResult, fetchPage, cleanText } from "./base.js";

const URLS = [
  {
    url: "https://www.bokjiro.go.kr/ssis-teu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004558",
    title: "신혼부부 전세임대",
  },
  {
    url: "https://www.bokjiro.go.kr/ssis-teu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004559",
    title: "행복주택 신혼부부",
  },
  {
    url: "https://www.bokjiro.go.kr/ssis-teu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003957",
    title: "첫만남이용권",
  },
  {
    url: "https://www.bokjiro.go.kr/ssis-teu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004798",
    title: "부모급여",
  },
];

export const bokjiroCrawler: Crawler = {
  name: "bokjiro",
  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const { url, title } of URLS) {
      try {
        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        // 복지로 상세 페이지의 본문 영역 추출
        const contentArea =
          $(".cont_detail").text() ||
          $(".detail_view").text() ||
          $(".wlfareInfoDtl").text() ||
          $("main").text() ||
          $("body").text();

        const extractedText = cleanText(contentArea);

        if (extractedText.length > 50) {
          results.push({
            source: "bokjiro",
            sourceUrl: url,
            title,
            rawHtml: html.substring(0, 50000),
            extractedText,
            crawledAt: new Date().toISOString(),
          });
        }

        // 요청 간 딜레이
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.warn(`[bokjiro] ${title} 크롤링 실패:`, err);
      }
    }

    return results;
  },
};
