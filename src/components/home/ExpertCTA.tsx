import Link from "next/link";

export default function ExpertCTA() {
  return (
    <Link
      href="/chat?topic=expert"
      className="block mx-5 mt-2 p-7 bg-ink text-paper rounded-xl relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-coral-500 opacity-25"
      />
      <div className="relative">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-honey-300 mb-3 font-bold">
          Expert Consult
        </div>
        <h3 className="font-serif text-[22px] font-medium tracking-tightest leading-snug mb-2.5 wb-keep">
          결정이 어려울 땐
          <br />
          <span className="italic text-coral-400">사람이 필요해요</span>
        </h3>
        <p className="text-[12.5px] opacity-80 mb-4 wb-keep">
          세무사 · 주거지원 상담가 · 노무사. 1:1 커피챗 3분부터.
        </p>
        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-coral-500 text-white text-[12.5px] font-bold rounded-full">
          상담 둘러보기 →
        </span>
      </div>
    </Link>
  );
}
