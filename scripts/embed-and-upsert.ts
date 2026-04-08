/**
 * 구조화된 마크다운을 청크 분할 → Pinecone integrated index에 업서트
 *
 * 사용법: npx tsx scripts/embed-and-upsert.ts
 * 입력: knowledge/structured/*.md
 * 필요 환경변수: PINECONE_API_KEY
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";
import { Pinecone } from "@pinecone-database/pinecone";

const INDEX_NAME = "sinhon-policies";
const STRUCTURED_DIR = path.resolve("knowledge/structured");
const CHUNK_SIZE = 500;
const BATCH_SIZE = 10;

interface PolicyFrontmatter {
  title: string;
  category: string;
  source_url: string;
  updated: string;
}

function parseFrontmatter(content: string): {
  frontmatter: PolicyFrontmatter;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: { title: "Unknown", category: "housing", source_url: "", updated: "" },
      body: content,
    };
  }

  const fmLines = match[1].split("\n");
  const fm: Record<string, string> = {};
  for (const line of fmLines) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fm[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
    }
  }

  return {
    frontmatter: {
      title: fm.title || "Unknown",
      category: fm.category || "housing",
      source_url: fm.source_url || "",
      updated: fm.updated || "",
    },
    body: match[2].trim(),
  };
}

function chunkText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function main() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.error("PINECONE_API_KEY가 설정되지 않았습니다.");
    process.exit(1);
  }

  if (!fs.existsSync(STRUCTURED_DIR)) {
    console.error("knowledge/structured/ 디렉토리가 없습니다.");
    process.exit(1);
  }

  const files = fs.readdirSync(STRUCTURED_DIR).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.log("업서트할 파일이 없습니다.");
    return;
  }

  const pc = new Pinecone({ apiKey });
  const index = pc.index(INDEX_NAME);

  const records: {
    _id: string;
    chunk_text: string;
    title: string;
    category: string;
    source: string;
    updated_at: string;
  }[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(STRUCTURED_DIR, file), "utf-8");
    const { frontmatter, body } = parseFrontmatter(content);
    const slug = file.replace(".md", "");
    const chunks = chunkText(body, CHUNK_SIZE);

    for (let i = 0; i < chunks.length; i++) {
      records.push({
        _id: `crawled_${slug}_chunk_${i}`,
        chunk_text: chunks[i],
        title: frontmatter.title,
        category: frontmatter.category,
        source: frontmatter.source_url,
        updated_at: frontmatter.updated,
      });
    }
  }

  console.log(`총 ${records.length}개 레코드를 Pinecone에 업서트합니다...`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await index.upsertRecords(batch);
    console.log(
      `  업서트 완료: ${Math.min(i + BATCH_SIZE, records.length)}/${records.length}`
    );
  }

  console.log("임베딩 + 업서트 완료!");
}

main().catch((err) => {
  console.error("업서트 실패:", err);
  process.exit(1);
});
