import Link from "next/link";

type AccentTone = "coral" | "mint" | "honey";

const dotClass: Record<AccentTone, string> = {
  coral: "bg-coral-500",
  mint: "bg-mint-500",
  honey: "bg-honey-500",
};

export default function SectionTitle({
  title,
  accent,
  href,
  action = "전체보기",
}: {
  title: string;
  accent?: AccentTone;
  href?: string;
  action?: string;
}) {
  const body = (
    <div className="flex items-baseline justify-between px-5 mb-3.5">
      <div className="flex items-baseline gap-1.5">
        <h2 className="text-[18px] font-extrabold text-ink tracking-[-0.01em] wb-keep">
          {title}
        </h2>
        {accent && (
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass[accent]} -translate-y-0.5`}
            aria-hidden
          />
        )}
      </div>
      <span className="text-[18px] text-ink-muted font-light leading-none">›</span>
    </div>
  );

  return href ? (
    <Link href={href} className="block" aria-label={`${title} ${action}`}>
      {body}
    </Link>
  ) : (
    body
  );
}
