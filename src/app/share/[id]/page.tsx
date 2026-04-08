import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { POLICIES } from "@/lib/constants";

interface Props { params: { id: string } }

export function generateStaticParams() {
  return POLICIES.map((p) => ({ id: p.slug }));
}

export function generateMetadata({ params }: Props) {
  const policy = POLICIES.find((p) => p.slug === params.id);
  if (!policy) return {};
  return {
    title: `${policy.title} | 신혼생활 결과카드`,
    description: policy.summary,
    openGraph: { title: `${policy.title} | 신혼생활`, description: policy.summary, url: `https://sinhon.life/share/${params.id}` },
  };
}

export default function ShareCardPage({ params }: Props) {
  const policy = POLICIES.find((p) => p.slug === params.id);
  if (!policy) notFound();

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-br from-coral to-coral-600 p-6 text-white">
          <p className="text-xs font-medium opacity-80">신혼생활 정책 카드</p>
          <h1 className="text-xl font-bold mt-2 leading-tight">{policy.title}</h1>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-warm-text-secondary leading-relaxed">{policy.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {policy.tags.map((tag) => <span key={tag} className="text-xs bg-coral-50 text-coral-700 px-2.5 py-1 rounded-full">#{tag}</span>)}
          </div>
          <div className="border-t border-warm-border pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-coral flex items-center justify-center"><span className="text-white text-[10px] font-bold">신</span></div>
              <span className="text-xs font-medium text-warm-text-secondary">sinhon.life</span>
            </div>
            <span className="text-[10px] text-warm-text-muted">{policy.updatedAt}</span>
          </div>
        </div>
      </div>
      <div className="w-full max-w-sm mt-6 space-y-3">
        <Link href={`/policy/${policy.slug}`} className="flex items-center justify-center gap-2 w-full bg-coral text-white py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform">자세히 보기</Link>
        <Link href="/chat" className="flex items-center justify-center gap-2 w-full bg-white border border-coral text-coral py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"><MessageCircle size={16} />AI에게 더 물어보기</Link>
      </div>
    </div>
  );
}
