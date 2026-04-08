/**
 * 국세청 (nts.go.kr) 크롤러
 * 신혼부부 관련 세금 혜택 정보 수집
 */

import * as cheerio from "cheerio";
import { Crawler, CrawlResult, fetchPage, cleanText } from "./base.js";

const URLS = [
  {
    url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2304&cntntsId=7700",
    title: "연말정산 안내",
  },
  {
    url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2351&cntntsId=7738",
    title: "증여세 안내",
  },
];

export const ntsCrawler: Crawler = {
  name: "nts",
  async crawl(): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const { url, title } of URLS) {
      try {
        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const contentArea =
          $(".cnt_area").text() ||
          $(".content_area").text() ||
          $("#contents").text() ||
          $("body").text();

        const extractedText = cleanText(contentArea);

        if (extractedText.length > 50) {
          results.push({
            source: "nts",
            sourceUrl: url,
            title,
            rawHtml: html.substring(0, 50000),
            extractedText,
            crawledAt: new Date().toISOString(),
          });
        }

        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.warn(`[nts] ${title} 크롤링 실패:`, err);
      }
    }

    return results;
  },
};
