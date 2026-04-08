import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

// 관리자 대시보드 통계
export async function GET() {
  try {
    const stats: {
      knowledge: { totalVectors: number; dimension: number } | null;
      vendors: number;
      lastUpdated: string;
    } = {
      knowledge: null,
      vendors: 0,
      lastUpdated: new Date().toISOString(),
    };

    // Pinecone 통계
    if (process.env.PINECONE_API_KEY) {
      const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      const index = pc.index("sinhon-policies");
      const indexStats = await index.describeIndexStats();
      stats.knowledge = {
        totalVectors: indexStats.totalRecordCount ?? 0,
        dimension: indexStats.dimension ?? 0,
      };
    }

    // 업체 수 (constants에서)
    const { VENDORS } = await import("@/lib/constants");
    stats.vendors = VENDORS.length;

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "통계 조회 실패" }, { status: 500 });
  }
}
