import { Pinecone } from "@pinecone-database/pinecone";

const INDEX_NAME = "sinhon-policies";

let pineconeClient: Pinecone | null = null;

function getPinecone(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) throw new Error("PINECONE_API_KEY 환경변수가 설정되지 않았습니다.");
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
}

export interface RetrievedContext {
  id: string;
  text: string;
  title: string;
  category: string;
  score: number;
}

/**
 * Pinecone integrated index에서 질문과 관련된 문서를 검색합니다.
 * integrated index이므로 텍스트 쿼리를 보내면 서버 측에서 자동 임베딩됩니다.
 */
export async function retrieveContext(
  query: string,
  topK: number = 5
): Promise<RetrievedContext[]> {
  const pc = getPinecone();
  const index = pc.index(INDEX_NAME);

  const results = await index.searchRecords({
    query: { topK, inputs: { text: query } },
    fields: ["title", "category", "chunk_text"],
  });

  if (!results.result?.hits) return [];

  return results.result.hits.map((hit) => {
    const fields = (hit.fields ?? {}) as Record<string, unknown>;
    return {
      id: hit._id,
      text: (fields.chunk_text as string) ?? "",
      title: (fields.title as string) ?? "",
      category: (fields.category as string) ?? "",
      score: hit._score ?? 0,
    };
  });
}

/**
 * 검색된 문서들을 시스템 프롬프트에 주입할 컨텍스트 문자열로 변환합니다.
 */
export function buildContextString(contexts: RetrievedContext[]): string {
  if (contexts.length === 0) return "관련 참고 자료가 없습니다.";

  return contexts
    .map(
      (ctx, i) =>
        `[참고자료 ${i + 1}] ${ctx.title} (${ctx.category})\n${ctx.text}`
    )
    .join("\n\n");
}
