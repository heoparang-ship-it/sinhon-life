import Link from "next/link";
import { MicroLabel } from "@/components/ui/MicroLabel";

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] pb-[140px] bg-white">
      {/* — Hero 블루 영역 — */}
      <div className="bg-hero-sky pt-12 pb-10 px-7 rounded-b-[28px] text-on-blue">
        <MicroLabel className="text-on-blue-faint">Newlywed Platform · 01</MicroLabel>
        <h1 className="mt-4 text-[30px] font-bold tracking-tightest leading-[1.15]">
          결혼은 1억,<br />
          <span className="text-on-blue-mute font-medium">신혼생활은 함께 시작.</span>
        </h1>
        <p className="mt-3 text-[13px] text-on-blue-mute leading-relaxed">
          예산·체크리스트·정책 알리미를 부부가 같이 쓰는<br />
          신혼부부 전용 플랫폼이에요.
        </p>
      </div>

      {/* — 메인 CTA 3종 — */}
      <section className="px-7 mt-6">
        <MicroLabel>Main</MicroLabel>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <NavCard
            href="/budget"
            title="가계부"
            desc="9개 카테고리로 부부가 함께 쓰는 결혼 가계부"
            accent="#3B8BCF"
          />
          <NavCard
            href="/archive"
            title="신혼 아카이브"
            desc="신혼이 챙겨보는 인스타 피드 모음"
            accent="#F07C9B"
          />
          <NavCard
            href="/my"
            title="MY"
            desc="프로필·로그인·설정"
            accent="#77C7C0"
          />
        </div>
      </section>

      {/* — 1억원 가이드 — */}
      <section className="px-7 mt-8">
        <MicroLabel>Guide</MicroLabel>
        <div className="mt-3 p-5 rounded-2xl bg-paper border border-hairline">
          <div className="text-base font-bold text-ink tracking-tight">1억원 결혼 가이드</div>
          <p className="mt-2 text-[13px] text-mute leading-relaxed">
            예식·스드메·예복·예물예단·혼수가전·신혼집·신혼여행·본식현금까지<br />
            평균 1억 안에 신혼을 시작하는 9개 영역 가이드.
          </p>
          <Link
            href="/budget"
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-blue-accent"
          >
            가계부에서 예산 설정하기 →
          </Link>
        </div>
      </section>
    </main>
  );
}

function NavCard({
  href,
  title,
  desc,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="block p-5 rounded-2xl bg-white border border-hairline shadow-[0_8px_24px_-18px_rgba(20,40,80,0.20)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1 h-9 rounded-full" style={{ background: accent }} />
          <span className="text-[17px] font-bold text-ink tracking-tight">{title}</span>
        </div>
        <span className="text-faint">›</span>
      </div>
      <p className="mt-2 ml-4 text-[12.5px] text-mute leading-relaxed">{desc}</p>
    </Link>
  );
}
