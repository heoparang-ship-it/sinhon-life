import type { Metadata } from "next";
import Link from "next/link";
import { MicroLabel } from "@/components/ui/MicroLabel";

export const metadata: Metadata = {
  title: "MY · 신혼생활",
};

export default function MyPage() {
  return (
    <main className="min-h-[100dvh] pb-[140px] bg-white">
      <div className="bg-hero-sky pt-12 pb-10 px-7 rounded-b-[28px] text-on-blue">
        <MicroLabel className="text-on-blue-faint">MY · 05</MicroLabel>
        <h1 className="mt-4 text-[26px] font-bold tracking-tightest">내 정보</h1>
        <p className="mt-2 text-[13px] text-on-blue-mute">
          카카오 로그인은 곧 추가될 예정입니다.
        </p>
      </div>

      <section className="px-7 mt-6">
        <MicroLabel>준비 중</MicroLabel>
        <div className="mt-3 p-5 rounded-2xl bg-paper border border-hairline">
          <div className="text-sm font-bold text-ink">로그인이 곧 열려요</div>
          <p className="mt-2 text-[12.5px] text-mute leading-relaxed">
            카카오 로그인으로 가계부·체크리스트가 폰을 바꿔도 그대로 유지됩니다.
            지금은 브라우저에 임시로 저장됩니다.
          </p>
          <Link
            href="/budget"
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-blue-accent"
          >
            가계부 사용하기 →
          </Link>
        </div>
      </section>
    </main>
  );
}
