import Link from "next/link";
import Placeholder from "@/components/design/Placeholder";
import type { Policy } from "@/lib/constants";

const categoryToTone: Record<string, "coral" | "mint" | "honey" | "paper"> = {
  baby: "coral",
  housing: "mint",
  tax: "honey",
  finance: "paper",
};

const categoryLabel: Record<string, string> = {
  baby: "Baby",
  housing: "Housing",
  tax: "Tax",
  finance: "Cash",
};

// Stable pseudo-popularity derived from slug so SSR/CSR snapshots match.
function popularityPct(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return 40 + (Math.abs(h) % 40);
}

export default function GuidesRail({ policies }: { policies: Policy[] }) {
  return (
    <div className="overflow-x-auto scrollbar-hide mb-8">
      <div className="flex gap-3.5 px-5 pb-1">
        {policies.map((p) => (
          <Link key={p.slug} href={`/policy/${p.slug}`} className="shrink-0 w-[150px]">
            <div className="aspect-[3/4] overflow-hidden rounded-xl">
              <Placeholder
                label={categoryLabel[p.category] ?? p.category}
                tone={categoryToTone[p.category] ?? "paper"}
                aspect="3/4"
                rounded="rounded-none"
                className="w-full h-full"
              />
            </div>
            <div className="pt-3">
              <div className="text-[13.5px] font-bold text-ink tracking-tight leading-snug mb-1 wb-keep line-clamp-2">
                {p.title}
              </div>
              <div className="text-[10.5px] text-ink-muted font-mono">
                +{popularityPct(p.slug)}% · {p.category}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
