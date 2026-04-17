import Link from "next/link";
import { Home, Compass, MessageCircle, Sparkles } from "lucide-react";
import { POLICIES, HUB_CATEGORIES } from "@/lib/constants";

export default function NotFound() {
  // 인기 정책 4개 (highlight 있는 것 우선)
  const recommended = [...POLICIES]
    .sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-12 pb-6 text-center">
        <p className="text-6xl mb-4" aria-hidden>🔍</p>
        <h1 className="text-xl font-extrabold tracking-tight">페이지를 못 찾았어요</h1>
        <p className="text-[13px] text-warm-text-muted mt-2 leading-relaxed">
          주소가 바뀌었거나 삭제됐을 수 있어요.
          <br />
          대신 이런 정보는 어떠세요?
        </p>
      </div>

      {/* 빠른 이동 버튼 */}
      <div className="px-5 grid grid-cols-3 gap-2 mb-6">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 py-3 bg-coral text-white rounded-xl font-bold text-[12px] active:scale-[0.97] transition-transform shadow-lg shadow-coral/20"
        >
          <Home size={18} />홈으로
        </Link>
        <Link
          href="/explore"
          className="flex flex-col items-center gap-1 py-3 bg-white border border-warm-border text-warm-text rounded-xl font-bold text-[12px] active:scale-[0.97] transition-transform"
        >
          <Compass size={18} />탐색하기
        </Link>
        <Link
          href="/chat"
          className="flex flex-col items-center gap-1 py-3 bg-mint-50 text-mint-700 border border-mint-100 rounded-xl font-bold text-[12px] active:scale-[0.97] transition-transform"
        >
          <MessageCircle size={18} />AI에게 묻기
        </Link>
      </div>

      {/* 인기 꿀정보 추천 */}
      <section className="px-5 space-y-3 mb-6">
        <div className="flex items-center gap-1.5">
          <Sparkles size={15} className="text-coral" />
          <h2 className="text-[14px] font-extrabold">지금 가장 많이 보는 꿀정보</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {recommended.map((p) => (
            <Link
              key={p.slug}
              href={`/policy/${p.slug}`}
              className="bg-white rounded-xl p-3.5 border border-warm-border active:scale-[0.98] transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              {p.highlight && (
                <span className="inline-block text-[9.5px] font-bold text-coral bg-coral-50 px-2 py-0.5 rounded-md mb-1.5">
                  {p.highlight}
                </span>
              )}
              <h3 className="font-bold text-[12.5px] leading-tight line-clamp-2">{p.title}</h3>
              <p className="text-[10.5px] text-warm-text-muted mt-1 line-clamp-2">{p.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 카테고리로 둘러보기 */}
      <section className="px-5 space-y-3">
        <h2 className="text-[13px] font-bold text-warm-text-secondary">
          카테고리로 둘러보기
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {HUB_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="bg-white border border-warm-border rounded-xl p-3 text-center active:scale-[0.97] transition-transform"
            >
              <div className="text-xl" aria-hidden>{c.emoji}</div>
              <p className="text-[11px] font-bold mt-1">{c.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
