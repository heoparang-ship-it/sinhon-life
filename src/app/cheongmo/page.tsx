import Link from "next/link";
import type { Metadata } from "next";
import { PLACES, type CheongmoPlace } from "@/lib/cheongmo/data";

export const metadata: Metadata = {
  title: "전국 청모 지도 — 청첩장 모임 장소 추천 | 신혼생활",
  description:
    "친구·직장 동료·부모님까지, 누구에게 청첩장을 전하느냐에 따라 좋은 장소는 달라져요. 지역·분위기·가격별 청모 추천 장소.",
};

const REGIONS: { key: CheongmoPlace["region1"]; label: string }[] = [
  { key: "인천", label: "인천" },
  { key: "서울", label: "서울" },
  { key: "경기", label: "경기" },
];

export default function CheongmoHomePage() {
  const incheon = PLACES.filter((p) => p.region1 === "인천");
  const seoul = PLACES.filter((p) => p.region1 === "서울");

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-[#F7FAFD] pb-24">
      <header className="px-5 pt-7">
        <p className="text-[12px] font-bold text-[#3B8BCF]">전국 청모 지도</p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-snug text-ink">
          청첩장 모임,
          <br />
          어디서 하지?
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#586B7D]">
          친구·회사 동료·부모님까지, 누구에게 전하느냐에 따라 좋은 장소는 달라져요.
          지역·분위기·가격별로 골라보세요.
        </p>
      </header>

      <nav className="mt-5 flex gap-2 overflow-x-auto px-5">
        {REGIONS.map((r) => (
          <span
            key={r.key}
            className="shrink-0 rounded-full border border-[#DCE6F0] bg-white px-4 py-1.5 text-[12.5px] font-bold text-[#2566A8]"
          >
            {r.label}
          </span>
        ))}
        <span className="shrink-0 rounded-full bg-[#EEF4FB] px-4 py-1.5 text-[12.5px] font-bold text-[#7A8B9C]">
          전체 {PLACES.length}곳
        </span>
      </nav>

      <RegionSection title="인천 청모 추천" places={incheon} />
      <RegionSection title="서울 청모 추천" places={seoul} />

      <section className="mx-5 mt-8 rounded-2xl border border-[#DCE6F0] bg-white p-5">
        <p className="text-[13px] font-extrabold text-ink">우리 매장도 청모 장소로 등록하고 싶다면?</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#586B7D]">
          예비부부에게 청첩장 모임 장소로 소개해보세요. 무료 입점 가능해요.
        </p>
        <Link
          href="/cheongmo/partner"
          className="mt-3 inline-flex rounded-full bg-[#2566A8] px-4 py-2 text-[12.5px] font-bold text-white"
        >
          무료 입점 신청
        </Link>
      </section>

      <p className="mt-6 px-5 text-[11px] leading-relaxed text-[#9AA8B6]">
        ⓘ 표시된 장소는 사장님 큐레이션 표본이에요. 실제 영업·예약 조건은 네이버지도/카카오맵 등
        링크에서 최종 확인해요. 입점·정정 요청은 무료로 받아요.
      </p>
    </main>
  );
}

function RegionSection({ title, places }: { title: string; places: CheongmoPlace[] }) {
  if (places.length === 0) return null;
  return (
    <section className="mt-7">
      <h2 className="px-5 text-[15px] font-extrabold text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 px-5">
        {places.map((p) => (
          <PlaceCard key={p.id} place={p} />
        ))}
      </div>
    </section>
  );
}

function PlaceCard({ place }: { place: CheongmoPlace }) {
  const tags = [...place.useCaseTags.slice(0, 1), ...place.moodTags.slice(0, 2)];
  return (
    <Link
      href={`/cheongmo/place/${place.slug}`}
      className="block rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-[0_1px_2px_rgba(26,36,51,0.04),0_8px_18px_rgba(26,36,51,0.04)] transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#7A8B9C]">
          {place.region1} {place.area} · {place.category}
        </p>
        <p className="text-[11px] font-extrabold text-[#3B8BCF]">청모 적합도 {place.score.toFixed(1)}</p>
      </div>
      <p className="mt-1.5 text-[15px] font-extrabold text-ink">{place.name}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-[#586B7D]">{place.shortDesc}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-full bg-[#EEF4FB] px-2.5 py-1 text-[11px] font-bold text-[#2566A8]">
            #{t}
          </span>
        ))}
        <span className="rounded-full bg-[#F4F7FA] px-2.5 py-1 text-[11px] font-bold text-[#7A8B9C]">
          {place.priceRange}
        </span>
      </div>
    </Link>
  );
}
