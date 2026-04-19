import Link from "next/link";
import { CheckSquare, Wallet, Sparkles } from "lucide-react";

// Merges AI chat entry + checklist + budget into one coherent "도구" block so the
// homepage has a single AI/utility anchor instead of scattered CTAs.
export default function AIHub() {
  return (
    <div className="mx-5 mb-8 space-y-3">
      <Link
        href="/chat"
        className="block p-5 rounded-xl bg-mint-200 relative overflow-hidden border border-paper-line active:scale-[0.99] transition"
      >
        <span
          aria-hidden
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-honey-300 opacity-60"
        />
        <span
          aria-hidden
          className="absolute right-6 -bottom-6 w-20 h-20 rounded-full bg-coral-200 opacity-70"
        />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono uppercase tracking-[0.15em] text-mint-700 font-bold">
            <Sparkles size={12} />
            AI톡 · beta
          </div>
          <h3 className="font-serif text-[22px] font-semibold text-ink tracking-tightest leading-snug mb-2 wb-keep">
            정부지원, 부부심리 <span className="italic">뭐든 물어봐요</span>
          </h3>
          <p className="text-[12.5px] text-ink-soft leading-relaxed mb-3 wb-keep">
            맥락을 기억하는 전용 AI · 24시간
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink text-honey-300 text-[12.5px] font-bold rounded-full">
            AI톡 시작하기 →
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/checklist"
          className="p-4 rounded-xl bg-paper-surface border border-paper-line active:scale-[0.98] transition"
        >
          <div className="w-9 h-9 rounded-full bg-coral-100 flex items-center justify-center text-coral-700 mb-2.5">
            <CheckSquare size={18} strokeWidth={1.9} />
          </div>
          <div className="font-serif text-[15.5px] font-semibold text-ink tracking-tight leading-snug">
            결혼 체크리스트
          </div>
          <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
            9그룹 95항목 · 메모까지
          </p>
        </Link>

        <Link
          href="/budget"
          className="p-4 rounded-xl bg-paper-surface border border-paper-line active:scale-[0.98] transition"
        >
          <div className="w-9 h-9 rounded-full bg-mint-100 flex items-center justify-center text-mint-700 mb-2.5">
            <Wallet size={18} strokeWidth={1.9} />
          </div>
          <div className="font-serif text-[15.5px] font-semibold text-ink tracking-tight leading-snug">
            부부 가계부
          </div>
          <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
            카테고리별로 접어 보기
          </p>
        </Link>
      </div>
    </div>
  );
}
