import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegionIndex, listRegionKeys } from "@/lib/index/regionData";

export const revalidate = 86400; // 24h

type Props = { params: Promise<{ region: string }> };

export async function generateStaticParams() {
  return listRegionKeys().map((region) => ({ region }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const data = getRegionIndex(region);
  if (!data) return { title: "지역 인덱스" };
  const title = `${data.shortName} 신혼 결정 인덱스 — 스드메·예식장·인테리어 평균가`;
  const desc = `${data.parent} 신혼부부 평균 결정 가격 인덱스. 비슷한 신혼이 어떤 옵션을 가장 많이 선택했는지 함께 보세요. ${data.hashtag}`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "article" },
    alternates: { canonical: `/index/${region}` },
  };
}

export default async function RegionIndexPage({ params }: Props) {
  const { region } = await params;
  const data = getRegionIndex(region);
  if (!data) notFound();

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[760px] bg-white px-5 pb-24 pt-10">
      <nav className="text-[11px] font-bold tracking-wide text-blue-deepest">
        <Link href="/" className="hover:underline">sinhon.life</Link>
        <span className="mx-1.5 opacity-40">/</span>
        <Link href="/index/incheon" className="hover:underline">지역 인덱스</Link>
        <span className="mx-1.5 opacity-40">/</span>
        <span>{data.shortName}</span>
      </nav>

      <h1 className="mt-3 text-[28px] font-extrabold leading-tight text-ink">
        {data.name}
      </h1>
      <p className="mt-2 text-[14px] font-medium leading-relaxed text-ink-soft">
        {data.bullet}
      </p>
      <p className="mt-1 text-[11px] font-bold tracking-wide text-mute">
        업데이트: {data.updatedAt} · 표본: 신혼생활 사용자 가계부 + 리드 데이터(POC 시드)
      </p>

      <section className="mt-7 flex flex-col gap-3">
        {data.stats.map((s) => (
          <article
            key={s.category}
            className="rounded-[16px] border border-[#E8EFF6] bg-white p-4 shadow-[0_3px_12px_-8px_rgba(20,50,90,0.18)]"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-extrabold text-ink">{s.label}</h2>
              <span className="text-[11px] font-semibold text-mute">표본 {s.sample}</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-[28px] font-extrabold text-ink">
                {s.average.toLocaleString()}
              </span>
              <span className="text-[12px] font-bold text-mute">{s.unit} (평균)</span>
            </div>
            <div className="mt-1 text-[11.5px] font-medium text-mute">
              25~75% 구간 {s.low.toLocaleString()}–{s.high.toLocaleString()} {s.unit}
            </div>
            <div className="mt-3 rounded-[12px] bg-[#EAF3FB] px-3 py-2.5">
              <div className="text-[10.5px] font-bold tracking-wide text-blue-deepest">
                CHOICE SHARE
              </div>
              <div className="mt-0.5 text-[13px] font-bold text-ink">
                {s.topChoiceShare}% 가 선택: {s.topChoiceLabel}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-9 rounded-[16px] border border-[#E8EFF6] bg-white p-4">
        <h3 className="text-[14px] font-extrabold text-ink">우리 부부에게 맞춤 추천 받기</h3>
        <p className="mt-1 text-[12px] font-medium text-mute">
          예산·일정·취향을 알려주면 AI가 카테고리별로 후보를 좁혀 줍니다. 무료, 가입 없이 시작.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.stats.map((s) => (
            <Link
              key={s.category}
              href={`/ai?seed=${s.category}`}
              className="rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{
                background: "linear-gradient(90deg,#2566A8 0%,#3B8BCF 60%,#4F9CDB 100%)",
              }}
            >
              {s.label.split(" ")[0]} AI에게 묻기
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-6 text-[10.5px] font-medium leading-snug text-mute">
        ※ 본 인덱스는 신혼생활 서비스 사용자 가계부·리드 데이터에 기반한 POC 시드 통계예요.
        표본이 충분히 쌓이면 자동 집계로 교체됩니다. 가격은 시기·옵션에 따라 다를 수 있어요.
      </p>

      <section className="mt-9 border-t border-[#E8EFF6] pt-6">
        <h3 className="text-[13px] font-extrabold text-ink">다른 지역 인덱스</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {listRegionKeys()
            .filter((k) => k !== data.key)
            .map((k) => (
              <Link
                key={k}
                href={`/index/${k}`}
                className="rounded-full border border-[#D8E5F0] bg-white px-3 py-1.5 text-[12px] font-bold text-ink-soft"
              >
                #{k}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
