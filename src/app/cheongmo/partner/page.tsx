import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "청모 장소 무료 입점 신청 | 신혼생활",
  description: "예비부부에게 청첩장 모임 장소로 소개되어 보세요. 무료 입점.",
};

export default function CheongmoPartnerPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-[#F7FAFD] pb-24">
      <header className="px-5 pt-6">
        <Link href="/cheongmo" className="text-[12px] font-bold text-[#3B8BCF]">
          ← 청모 지도
        </Link>
        <h1 className="mt-3 text-[22px] font-extrabold leading-snug text-ink">
          청모 장소
          <br />
          무료 입점 신청
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#586B7D]">
          예비부부에게 청첩장 모임 장소로 소개되어 보세요. 기본 정보 등록은 무료예요.
          정보 수정·예약 문의 연결 등 추가 기능은 별도로 안내드려요.
        </p>
      </header>

      <section className="mx-5 mt-6 rounded-2xl border border-dashed border-[#DCE6F0] bg-white p-5">
        <p className="text-[13px] font-extrabold text-ink">신청 폼 준비 중이에요</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#586B7D]">
          빠르게 시작하려면 아래 메일로 매장 정보(상호·지역·룸/주차/예약 여부·네이버 플레이스 URL)를
          보내주세요. 영업일 기준 1~2일 안에 회신드려요.
        </p>
        <a
          href="mailto:heoparang@gmail.com?subject=%5B%EC%B2%AD%EB%AA%A8%5D%20%EB%AC%B4%EB%A3%8C%20%EC%9E%85%EC%A0%90%20%EC%8B%A0%EC%B2%AD"
          className="mt-3 inline-flex rounded-full bg-[#2566A8] px-4 py-2 text-[12.5px] font-bold text-white"
        >
          입점 문의 메일 보내기
        </a>
      </section>

      <p className="mt-6 px-5 text-[11px] leading-relaxed text-[#9AA8B6]">
        ⓘ 본 신청은 청첩장 모임 장소로 추천되는 큐레이션 등록이에요. 운영자 검토 후 등록되며,
        부적합 매장은 등록이 어려울 수 있어요.
      </p>
    </main>
  );
}
