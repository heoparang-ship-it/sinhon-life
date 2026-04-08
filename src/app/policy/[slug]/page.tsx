import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ExternalLink } from "lucide-react";
import { POLICIES, BRAND } from "@/lib/constants";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";

const COLOR_BAR: Record<string, string> = {
  housing: "bg-coral", finance: "bg-mint", baby: "bg-coral-400", tax: "bg-mint-600",
};

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props) {
  const policy = POLICIES.find((p) => p.slug === params.slug);
  if (!policy) return {};
  return { title: `${policy.title} | 신혼생활`, description: policy.summary };
}

export default function PolicyPage({ params }: Props) {
  const policy = POLICIES.find((p) => p.slug === params.slug);
  if (!policy) notFound();

  const paragraphs = policy.content.split(/\n\n+/);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-warm-border/50 sticky top-0 z-10">
        <Link href="/" className="text-warm-text-secondary active:scale-90 transition-transform"><ArrowLeft size={20} /></Link>
        <h1 className="text-sm font-bold truncate flex-1 text-center px-3">{policy.title}</h1>
        <div className="flex items-center gap-1">
          <SaveButton id={policy.slug} />
          <ShareButton title={policy.title} description={policy.summary} slug={policy.slug} />
        </div>
      </header>

      <div className={`h-1.5 ${COLOR_BAR[policy.category] || "bg-coral"}`} />

      <div className="px-5 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-6 rounded-full ${COLOR_BAR[policy.category] || "bg-coral"}`} />
          <div className="flex gap-1.5">
            {policy.tags.map((tag) => (
              <span key={tag} className="text-xs bg-coral-50 text-coral-700 px-2.5 py-1 rounded-full">#{tag}</span>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-extrabold leading-tight tracking-tight">{policy.title}</h2>
        <p className="text-sm text-warm-text-secondary leading-relaxed">{policy.summary}</p>

        <div className="space-y-5 pt-2">
          {paragraphs.map((para, i) => {
            const trimmed = para.trim();
            if (trimmed.length < 30 && !trimmed.includes("원") && !trimmed.includes("%")) {
              return <h3 key={i} className="text-[15px] font-bold text-coral mt-8 first:mt-0">{trimmed}</h3>;
            }
            return <p key={i} className="text-[14px] leading-[1.8] text-warm-text">{trimmed}</p>;
          })}
        </div>

        <p className="text-xs text-warm-text-muted pt-4">마지막 업데이트: {policy.updatedAt}</p>
      </div>

      <div className="px-5 pb-20 space-y-3">
        <Link href="/chat" className="flex items-center justify-center gap-2 w-full bg-coral text-white py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform">
          <MessageCircle size={18} />더 궁금한 건 AI에게 물어보세요
        </Link>
        <a href={BRAND.kakaoLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-mint-50 text-mint-700 py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform">
          <ExternalLink size={16} />카톡 커뮤니티 참여하기
        </a>
      </div>
    </div>
  );
}
