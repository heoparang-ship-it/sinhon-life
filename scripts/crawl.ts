/**
 * 크롤링 오케스트레이터
 * 모든 크롤러 실행 → 원본 저장 → 구조화 → Pinecone 업서트
 *
 * 사용법:
 *   npx tsx scripts/crawl.ts              # 크롤링 + 원본 저장만
 *   npx tsx scripts/crawl.ts --full       # 크롤링 + 구조화 + 업서트까지
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";
import type { CrawlResult } from "./crawlers/base.js";
import { bokjiroCrawler } from "./crawlers/bokjiro.js";
import { applyhomeCrawler } from "./crawlers/applyhome.js";
import { nhufCrawler } from "./crawlers/nhuf.js";
import { ntsCrawler } from "./crawlers/nts.js";
import { gov24Crawler } from "./crawlers/gov24.js";

const RAW_DIR = path.resolve("knowledge/raw");
const ALL_CRAWLERS = [
  bokjiroCrawler,
  applyhomeCrawler,
  nhufCrawler,
  ntsCrawler,
  gov24Crawler,
];

function saveRawResult(result: CrawlResult) {
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const slug = `${result.source}_${result.title
    .replace(/[^가-힣a-zA-Z0-9]/g, "_")
    .substring(0, 50)}`;

  const filePath = path.join(RAW_DIR, `${slug}.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        source: result.source,
        sourceUrl: result.sourceUrl,
        title: result.title,
        extractedText: result.extractedText,
        crawledAt: result.crawledAt,
      },
      null,
      2
    ),
    "utf-8"
  );
}

async function main() {
  const fullMode = process.argv.includes("--full");

  console.log("=== 신혼생활 정책 크롤링 시작 ===\n");

  let totalResults = 0;

  for (const crawler of ALL_CRAWLERS) {
    console.log(`[${crawler.name}] 크롤링 중...`);
    try {
      const results = await crawler.crawl();
      console.log(`[${crawler.name}] ${results.length}개 페이지 수집 완료`);

      for (const result of results) {
        saveRawResult(result);
        totalResults++;
      }
    } catch (err) {
      console.error(`[${crawler.name}] 크롤러 실패:`, err);
    }

    // 크롤러 간 딜레이
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n총 ${totalResults}개 페이지 수집 → knowledge/raw/ 저장 완료`);

  if (fullMode) {
    const { execFileSync } = await import("child_process");

    console.log("\n=== 구조화 단계 시작 ===\n");
    execFileSync("npx", ["tsx", "scripts/structurize.ts"], { stdio: "inherit" });

    console.log("\n=== Pinecone 업서트 단계 시작 ===\n");
    execFileSync("npx", ["tsx", "scripts/embed-and-upsert.ts"], { stdio: "inherit" });
  } else {
    console.log("\n구조화 및 업서트는 --full 플래그로 실행하세요:");
    console.log("  npx tsx scripts/crawl.ts --full");
    console.log("\n또는 단계별로:");
    console.log("  npx tsx scripts/structurize.ts");
    console.log("  npx tsx scripts/embed-and-upsert.ts");
  }
}

main().catch((err) => {
  console.error("크롤링 실패:", err);
  process.exit(1);
});
