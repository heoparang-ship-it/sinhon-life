import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

const INDEX_NAME = "sinhon-policies";

function getPinecone() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) throw new Error("PINECONE_API_KEY 미설정");
  return new Pinecone({ apiKey });
}

// 지식 목록 조회 (Pinecone 검색)
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") || "신혼부부 정책 혜택";
    const topK = parseInt(req.nextUrl.searchParams.get("topK") || "20");

    const pc = getPinecone();
    const index = pc.index(INDEX_NAME);

    const results = await index.searchRecords({
      query: { topK, inputs: { text: query } },
      fields: ["title", "category", "chunk_text", "source", "tags"],
    });

    const records = (results.result?.hits || []).map((hit) => {
      const fields = (hit.fields ?? {}) as Record<string, unknown>;
      return {
        id: hit._id,
        score: hit._score,
        title: fields.title || "",
        category: fields.category || "",
        text: (fields.chunk_text as string)?.substring(0, 200) || "",
        source: fields.source || "",
        tags: fields.tags || "",
      };
    });

    return NextResponse.json({ records, total: records.length });
  } catch (error) {
    console.error("Knowledge GET error:", error);
    return NextResponse.json({ error: "지식 조회 실패" }, { status: 500 });
  }
}

// 수동 지식 추가
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, content, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용은 필수입니다" }, { status: 400 });
    }

    const pc = getPinecone();
    const index = pc.index(INDEX_NAME);

    const slug = title
      .replace(/[^가-힣a-zA-Z0-9]/g, "_")
      .substring(0, 30)
      .toLowerCase();
    const id = `manual_${slug}_${Date.now()}`;

    await index.upsertRecords({
      records: [
        {
          _id: id,
          chunk_text: content,
          title,
          category: category || "housing",
          tags: tags || "",
          source: "manual-admin",
        },
      ],
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Knowledge POST error:", error);
    return NextResponse.json({ error: "지식 추가 실패" }, { status: 500 });
  }
}
