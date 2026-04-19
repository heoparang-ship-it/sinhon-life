"use client";

export type TabId = "now" | "benefit" | "tour";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "now", label: "NOW" },
  { id: "benefit", label: "혜택" },
  { id: "tour", label: "집들이" },
];

export default function FeedTabs({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="px-5 border-b border-paper-line mb-5">
      <div className="flex gap-5 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`py-3 text-[17px] tracking-tight whitespace-nowrap transition -mb-px ${
                isActive
                  ? "text-ink font-extrabold border-b-[3px] border-ink"
                  : "text-ink-muted font-medium border-b-[3px] border-transparent"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
