import Link from "next/link";
import Placeholder from "@/components/design/Placeholder";
import type { Policy } from "@/lib/constants";

export default function FeaturedCard({ policy }: { policy: Policy }) {
  return (
    <Link href={`/policy/${policy.slug}`} className="block px-5 pb-7 group">
      <div className="rounded-xl overflow-hidden relative border border-paper-line shadow-sm transition group-active:scale-[0.99]">
        <Placeholder
          label="feature · 2026 spring"
          tone="warm"
          aspect="16/9"
          rounded="rounded-none"
        />
        <div className="absolute top-3.5 left-3.5 bg-honey-300 text-ink px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
          특집 · {policy.highlight ?? "추천"}
        </div>
      </div>
      <div className="pt-3.5">
        <h3 className="text-[18px] font-bold text-ink tracking-tightest leading-snug mb-1.5 wb-keep">
          {policy.title}
        </h3>
        <div className="text-[12px] text-ink-muted font-mono">
          feature · {policy.category}
        </div>
      </div>
    </Link>
  );
}
