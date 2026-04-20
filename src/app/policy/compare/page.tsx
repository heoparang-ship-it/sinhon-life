"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { Card, ChipSelect, EmptyState, Badge, Button } from "@/components/ui";
import { POLICIES } from "@/lib/constants";

/**
 * /policy/compare — side-by-side comparison of up to 3 selected policies.
 * V3.1 adds this as an explicit workflow (RFP §4.7).
 */
export default function ComparePage() {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>([]);

  const togglePick = (slug: string) => {
    setPicked((curr) => {
      if (curr.includes(slug)) return curr.filter((s) => s !== slug);
      if (curr.length >= 3) return curr; // cap at 3
      return [...curr, slug];
    });
  };

  const selected = useMemo(
    () => picked.map((s) => POLICIES.find((p) => p.slug === s)!).filter(Boolean),
    [picked],
  );

  return (
    <main className="min-h-screen bg-paper pb-[120px]">
      <div className="sticky top-0 z-nav bg-paper/95 backdrop-blur border-b border-paper-line">
        <div className="flex items-center gap-xs px-md py-sm">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로"
            className="p-xs -ml-xs rounded-full hover:bg-paper-line/60"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
          </button>
          <div className="flex-1">
            <h1 className="text-subtitle font-semibold text-ink">정책 비교</h1>
            <p className="text-caption text-ink-soft">최대 3개까지 골라 나란히 볼 수 있어요</p>
          </div>
          <Badge tone="coral">{picked.length}/3</Badge>
        </div>
      </div>

      {/* Picker */}
      <section className="px-md py-md">
        <h2 className="text-caption font-medium text-ink-soft mb-xs">비교할 정책 선택</h2>
        <div className="flex flex-wrap gap-2xs">
          {POLICIES.slice(0, 12).map((p) => (
            <ChipSelect
              key={p.slug}
              selected={picked.includes(p.slug)}
              onClick={() => togglePick(p.slug)}
              size="sm"
            >
              {p.title.length > 14 ? p.title.slice(0, 14) + "…" : p.title}
            </ChipSelect>
          ))}
        </div>
      </section>

      {/* Empty */}
      {selected.length === 0 ? (
        <EmptyState
          flavor="first-time"
          title="비교할 정책을 골라주세요"
          body="위 칩에서 2~3개를 선택하면 요약·태그·핵심 혜택을 표로 볼 수 있어요."
        />
      ) : (
        <section className="px-md">
          <div className="grid gap-sm" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
            {selected.map((p) => (
              <Card key={p.slug} className="p-sm">
                <div className="mb-xs">
                  {p.highlight && (
                    <Badge tone="honey" className="mb-2xs">{p.highlight}</Badge>
                  )}
                  <h3 className="text-body-lg font-semibold text-ink leading-tight">
                    {p.title}
                  </h3>
                </div>
                <p className="text-caption text-ink-soft line-clamp-4">{p.summary}</p>
              </Card>
            ))}
          </div>

          <h2 className="text-caption font-medium text-ink-soft mt-lg mb-xs">핵심 태그</h2>
          <div className="grid gap-sm" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
            {selected.map((p) => (
              <div key={p.slug} className="flex flex-wrap gap-2xs">
                {(p.tags ?? []).slice(0, 4).map((t) => (
                  <Badge key={t} tone="mint">{t}</Badge>
                ))}
              </div>
            ))}
          </div>

          <h2 className="text-caption font-medium text-ink-soft mt-lg mb-xs">자세히 보기</h2>
          <div className="grid gap-sm" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
            {selected.map((p) => (
              <Button key={p.slug} variant="secondary" size="sm" onClick={() => router.push(`/policy/${p.slug}`)}>
                상세 →
              </Button>
            ))}
          </div>
        </section>
      )}

      {picked.length > 0 && (
        <div className="fixed bottom-[84px] left-0 right-0 px-md">
          <div className="mx-auto max-w-screen-sm flex items-center justify-between rounded-pill bg-ink text-white px-md py-xs shadow-lg">
            <span className="text-caption">{picked.length}개 선택됨</span>
            <button
              type="button"
              onClick={() => setPicked([])}
              className="text-caption flex items-center gap-3xs hover:opacity-80"
            >
              <X className="h-3.5 w-3.5" /> 초기화
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
