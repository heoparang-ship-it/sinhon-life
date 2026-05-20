"use client";
import { useEffect, useMemo, useState } from "react";
import { MicroLabel } from "@/components/ui/MicroLabel";
import {
  CHECKLIST_SEED,
  formatOffset,
  readDoneMap,
  writeDoneMap,
  type ChecklistGroup,
  type ChecklistItem,
} from "@/lib/checklist/seed";
import { fetchRemoteDoneMap, pushChecklistItem } from "@/lib/checklist/sync";
import { useSession } from "@/lib/supabase/useSession";

export function ChecklistScreen() {
  const session = useSession();
  const userId = session.user?.id ?? null;
  const isAuthed = session.status === "authenticated";

  const [mounted, setMounted] = useState(false);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDoneMap(readDoneMap());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) writeDoneMap(doneMap);
  }, [doneMap, mounted]);

  // 로그인 시 원격 데이터로 덮어쓰기
  useEffect(() => {
    if (!isAuthed || !userId) return;
    let cancelled = false;
    fetchRemoteDoneMap(userId).then((remote) => {
      if (!cancelled && remote) setDoneMap(remote);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthed, userId]);

  const stats = useMemo(() => {
    const total = CHECKLIST_SEED.reduce((sum, g) => sum + g.items.length, 0);
    const done = CHECKLIST_SEED.reduce(
      (sum, g) => sum + g.items.filter((it) => doneMap[it.id]).length,
      0,
    );
    return { total, done, rate: total ? Math.round((done / total) * 100) : 0 };
  }, [doneMap]);

  const toggle = (id: string) => {
    setDoneMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (isAuthed && userId) {
        void pushChecklistItem(userId, id, next[id]);
      }
      return next;
    });
  };
  const toggleGroup = (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!mounted) {
    return <div className="pt-16 px-7 text-sm text-mute">불러오는 중…</div>;
  }

  return (
    <main className="min-h-[100dvh] pb-[140px] bg-white">
      <div className="bg-hero-sky pt-12 pb-10 px-7 rounded-b-[28px] text-on-blue">
        <MicroLabel className="text-on-blue-faint">Wedding Checklist · 02</MicroLabel>
        <h1 className="mt-4 text-[26px] font-bold tracking-tightest leading-[1.15]">
          결혼 준비,<br />
          <span className="text-on-blue-mute font-medium">함께 체크해요.</span>
        </h1>

        <div className="mt-6 p-5 rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_18px_40px_-18px_rgba(20,40,80,0.30)]">
          <div className="flex items-center justify-between">
            <MicroLabel>Progress</MicroLabel>
            <span className="text-[11px] text-faint">9그룹 {stats.total}개 항목</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[32px] font-bold tabular-nums text-ink tracking-tightest">
              {stats.rate}
            </span>
            <span className="text-base font-semibold text-mute">%</span>
            <span className="ml-auto text-[12.5px] text-mute tabular-nums">
              {stats.done} / {stats.total}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-pill-idle overflow-hidden">
            <div
              className="h-full rounded-full bg-pill-active"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </div>
      </div>

      <section className="px-7 mt-7">
        <MicroLabel>Groups</MicroLabel>
        <div className="mt-3 space-y-3">
          {CHECKLIST_SEED.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              doneMap={doneMap}
              open={!!openGroups[group.id]}
              onToggleGroup={() => toggleGroup(group.id)}
              onToggleItem={toggle}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function GroupCard({
  group,
  doneMap,
  open,
  onToggleGroup,
  onToggleItem,
}: {
  group: ChecklistGroup;
  doneMap: Record<string, boolean>;
  open: boolean;
  onToggleGroup: () => void;
  onToggleItem: (id: string) => void;
}) {
  const doneCount = group.items.filter((it) => doneMap[it.id]).length;
  const rate = group.items.length ? Math.round((doneCount / group.items.length) * 100) : 0;
  return (
    <div className="rounded-2xl bg-white border border-hairline shadow-[0_8px_24px_-22px_rgba(20,40,80,0.20)] overflow-hidden">
      <button
        type="button"
        onClick={onToggleGroup}
        className="w-full px-4 py-4 flex items-center gap-3 text-left"
      >
        <span className="text-2xl">{group.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-ink tracking-tight">{group.title}</div>
          <div className="mt-0.5 text-[11px] text-mute">
            {group.when} · {doneCount}/{group.items.length} 완료
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-bold text-ink-soft tabular-nums">{rate}%</div>
          <span className="text-faint text-sm">{open ? "▾" : "▸"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-hairline">
          {group.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              done={!!doneMap[item.id]}
              onToggle={() => onToggleItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  done,
  onToggle,
}: {
  item: ChecklistItem;
  done: boolean;
  onToggle: () => void;
}) {
  const whoColor =
    item.who === "신랑"
      ? "bg-[rgba(74,155,224,0.10)] text-blue-accent"
      : item.who === "신부"
        ? "bg-[rgba(240,124,155,0.10)] text-[#D45F84]"
        : "bg-paper text-mute";
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center gap-3 border-t border-hairline first:border-t-0 text-left"
    >
      <span
        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          done ? "border-blue-accent bg-blue-accent" : "border-faint bg-white"
        }`}
      >
        {done && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span
        className={`flex-1 text-[13.5px] tracking-tight ${
          done ? "line-through text-faint" : "text-ink"
        }`}
      >
        {item.name}
      </span>
      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${whoColor}`}>
        {item.who}
      </span>
      {item.offsetDays != null && (
        <span className="text-[10px] text-faint tabular-nums">{formatOffset(item.offsetDays)}</span>
      )}
    </button>
  );
}
