"use client";

import { Check } from "lucide-react";
import {
  type ChecklistGroup,
  type Assignee,
  formatOffset,
} from "@/lib/design/checklist";

const assigneeStyle: Record<Assignee, string> = {
  함께: "bg-honey-100 text-honey-800",
  신랑: "bg-mint-200 text-mint-700",
  신부: "bg-coral-200 text-coral-700",
};

export default function ChecklistGroupCard({
  group,
  doneMap,
  onToggle,
}: {
  group: ChecklistGroup;
  doneMap: Record<string, boolean>;
  onToggle: (itemId: string) => void;
}) {
  const completed = group.items.filter((i) => doneMap[i.id]).length;
  const total = group.items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-paper-surface border border-paper-line rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-paper-line">
        <div className="text-[18px]" aria-hidden>
          {group.icon}
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-ink tracking-tight">{group.title}</div>
          <div className="text-[11px] text-ink-muted mt-px">
            {completed}/{total} · {group.when}
          </div>
        </div>
        <span className="text-[11px] text-white bg-mint-500 px-2 py-0.5 rounded-full font-mono font-bold">
          {pct}%
        </span>
      </div>
      <div>
        {group.items.map((it, idx) => {
          const isDone = !!doneMap[it.id];
          return (
            <button
              key={it.id}
              onClick={() => onToggle(it.id)}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left active:bg-paper transition ${
                idx !== 0 ? "border-t border-paper-line" : ""
              }`}
            >
              <span
                className={`shrink-0 w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center ${
                  isDone ? "border-coral-500 bg-coral-500 text-white" : "border-paper-line"
                }`}
                aria-checked={isDone}
                role="checkbox"
              >
                {isDone && <Check size={12} strokeWidth={3} />}
              </span>
              <span
                className={`flex-1 text-[13.5px] tracking-tight ${
                  isDone ? "line-through text-ink-muted" : "text-ink"
                }`}
              >
                {it.name}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${assigneeStyle[it.who]}`}
              >
                {it.who}
              </span>
              {it.offsetDays !== undefined && (
                <span className="text-[10.5px] text-ink-muted font-mono min-w-[30px] text-right">
                  {formatOffset(it.offsetDays)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
