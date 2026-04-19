import Link from "next/link";

export default function AIBanner() {
  return (
    <Link
      href="/chat"
      className="block mx-5 mb-8 p-6 rounded-xl bg-mint-200 relative overflow-hidden border border-paper-line"
    >
      <span
        aria-hidden
        className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-honey-300 opacity-60"
      />
      <span
        aria-hidden
        className="absolute right-8 -bottom-8 w-24 h-24 rounded-full bg-coral-200 opacity-70"
      />
      <div className="relative">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-mint-700 mb-2.5 font-bold">
          AI톡 · beta
        </div>
        <h3 className="font-serif text-[22px] font-semibold text-ink tracking-tightest leading-snug mb-3 wb-keep">
          정부지원, 부부심리
          <br />
          <span className="italic">뭐든 물어봐요</span>
        </h3>
        <p className="text-[12.5px] text-ink-soft leading-relaxed mb-4 wb-keep">
          맥락을 기억하는 전용 AI · 24시간
        </p>
        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink text-honey-300 text-[12.5px] font-bold rounded-full">
          AI톡 시작하기 →
        </span>
      </div>
    </Link>
  );
}
