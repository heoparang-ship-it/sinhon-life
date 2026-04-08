/**
 * 크롤링 원본 → Claude Sonnet으로 구조화 마크다운 변환
 *
 * 사용법: npx tsx scripts/structurize.ts
 * 입력: knowledge/raw/*.json
 * 출력: knowledge/structured/*.md
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";

const RAW_DIR = path.resolve("knowledge/raw");
const STRUCTURED_DIR = path.resolve("knowledge/structured");

const STRUCTURE_PROMPT = `당신은 정부 정책 정보를 구조화하는 전문가입니다.
아래 웹페이지에서 추출한 텍스트를 읽고, 신혼부부/출산 가구에 관련된 정책 정보만 추출하여 아래 형식의 마크다운으로 변환해주세요.

출력 형식:
---
title: [정책명]
category: [housing/finance/baby/tax 중 하나]
eligibility: [신청 자격 조건]
benefits: [혜택 내용]
amount: [지원 금액/금리 등 수치]
deadline: [신청 기한 또는 "상시"]
how_to_apply: [신청 방법 및 사이트]
source_url: [원본 URL]
updated: [크롤링 날짜]
---

[정책에 대한 상세 설명을 자연스러운 한국어로 3~5 문단으로 작성]

규칙:
- 관련 없는 내용(네비게이션, 광고, 푸터 등)은 제거
- 수치(금액, 금리, 기간)는 정확하게 보존
- 2026년 기준 정보로 작성
- 불확실한 정보는 포함하지 말 것`;

async function structurizeFile(rawFilePath: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 필요");

  const rawData = JSON.parse(fs.readFileSync(rawFilePath, "utf-8"));
  const { title, sourceUrl, extractedText, crawledAt } = rawData;

  if (!extractedText || extractedText.length < 100) {
    console.warn(`  텍스트 부족, 건너뜀: ${title}`);
    return null;
  }

  // 텍스트가 너무 길면 앞부분만 사용 (토큰 절약)
  const truncatedText = extractedText.substring(0, 8000);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: STRUCTURE_PROMPT,
      messages: [
        {
          role: "user",
          content: `페이지 제목: ${title}\n원본 URL: ${sourceUrl}\n크롤링 날짜: ${crawledAt}\n\n추출된 텍스트:\n${truncatedText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error(`  Sonnet API 에러: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? null;
}

async function main() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error("knowledge/raw/ 디렉토리가 없습니다. 먼저 크롤링을 실행하세요.");
    process.exit(1);
  }

  const rawFiles = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".json"));
  if (rawFiles.length === 0) {
    console.log("구조화할 파일이 없습니다.");
    return;
  }

  fs.mkdirSync(STRUCTURED_DIR, { recursive: true });

  console.log(`${rawFiles.length}개 파일을 구조화합니다...`);

  for (const file of rawFiles) {
    const filePath = path.join(RAW_DIR, file);
    console.log(`  처리 중: ${file}`);

    const structured = await structurizeFile(filePath);
    if (structured) {
      const outName = file.replace(".json", ".md");
      fs.writeFileSync(path.join(STRUCTURED_DIR, outName), structured, "utf-8");
      console.log(`  저장 완료: ${outName}`);
    }

    // API rate limit 방지
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("구조화 완료!");
}

main().catch((err) => {
  console.error("구조화 실패:", err);
  process.exit(1);
});
