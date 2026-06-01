import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PLACES, getPlaceBySlug } from "@/lib/cheongmo/data";

type RouteParams = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) return { title: "장소를 찾을 수 없어요 | 신혼생활" };
  return {
    title: `${place.name} — 청모 장소 추천 | 신혼생활`,
    description: place.shortDesc,
  };
}

export default async function PlaceDetailPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) notFound();

  const similar = PLACES.filter(
    (p) => p.id !== place.id && (p.region1 === place.region1 || p.category === place.category),
  ).slice(0, 3);

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-[#F7FAFD] pb-28">
      <header className="px-5 pt-6">
        <Link href="/cheongmo" className="text-[12px] font-bold text-[#3B8BCF]">
          ← 청모 지도
        </Link>
        <h1 className="mt-3 text-[22px] font-extrabold leading-snug text-ink">{place.name}</h1>
        <p className="mt-1 text-[12px] font-bold text-[#7A8B9C]">
          {place.region1} {place.region2} · {place.area} · {place.category}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#EEF4FB] px-3 py-1">
          <span className="text-[11.5px] font-extrabold text-[#2566A8]">청모 적합도 {place.score.toFixed(1)}</span>
        </div>
      </header>

      <section className="mt-5 px-5">
        <p className="text-[13.5px] leading-relaxed text-ink">{place.shortDesc}</p>
      </section>

      <Section title="이런 모임에 좋아요">
        <TagRow tags={place.useCaseTags} />
      </Section>

      <Section title="분위기 / 인원">
        <TagRow tags={[...place.moodTags, ...place.capacityTags]} />
      </Section>

      <Section title="좋은 이유">
        <p className="text-[13px] leading-relaxed text-[#3D4C5C]">{place.whyGood}</p>
      </Section>

      {place.caution && (
        <Section title="주의사항">
          <p className="text-[13px] leading-relaxed text-[#3D4C5C]">{place.caution}</p>
        </Section>
      )}

      <Section title="기본 정보">
        <dl className="grid grid-cols-2 gap-y-2 text-[12.5px]">
          <Row k="예상 가격" v={place.priceRange} />
          <Row k="주차" v={place.parking} />
          <Row k="룸" v={place.privateRoom} />
          <Row k="예약" v={place.reservation} />
        </dl>
      </Section>

      <section className="mt-6 px-5">
        <div className="flex flex-col gap-2">
          {place.naverUrl ? (
            <ExternalCta href={place.naverUrl} label="네이버지도에서 보기" tone="primary" />
          ) : (
            <span className="rounded-2xl border border-dashed border-[#DCE6F0] bg-white px-4 py-3 text-center text-[12.5px] font-bold text-[#9AA8B6]">
              지도 링크 준비 중 (큐레이션 표본)
            </span>
          )}
          {place.kakaoUrl && <ExternalCta href={place.kakaoUrl} label="카카오맵에서 보기" tone="ghost" />}
          <Link
            href="/cheongmo/partner"
            className="rounded-2xl border border-[#DCE6F0] bg-white px-4 py-3 text-center text-[12.5px] font-bold text-[#2566A8]"
          >
            예약·문의 연결 요청
          </Link>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="text-[14px] font-extrabold text-ink">비슷한 청모 장소</h2>
          <div className="mt-3 flex flex-col gap-2">
            {similar.map((s) => (
              <Link
                key={s.id}
                href={`/cheongmo/place/${s.slug}`}
                className="rounded-xl border border-[#EEF2F6] bg-white px-3.5 py-3"
              >
                <p className="text-[12.5px] font-extrabold text-ink">{s.name}</p>
                <p className="mt-0.5 text-[11.5px] text-[#7A8B9C]">
                  {s.region1} {s.area} · {s.priceRange}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 px-5">
      <h2 className="text-[13px] font-extrabold text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded-full bg-[#EEF4FB] px-2.5 py-1 text-[11px] font-bold text-[#2566A8]">
          #{t}
        </span>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-[#7A8B9C]">{k}</dt>
      <dd className="font-bold text-ink">{v}</dd>
    </>
  );
}

function ExternalCta({ href, label, tone }: { href: string; label: string; tone: "primary" | "ghost" }) {
  const cls =
    tone === "primary"
      ? "bg-[#2566A8] text-white"
      : "border border-[#DCE6F0] bg-white text-[#2566A8]";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-2xl px-4 py-3 text-center text-[12.5px] font-bold ${cls}`}
    >
      {label}
    </a>
  );
}
