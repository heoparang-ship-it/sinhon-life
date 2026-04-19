"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
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

const WHO_OPTIONS: Assignee[] = ["함께", "신랑", "신부"];

export default function ChecklistGroupCard({
  group,
  doneMap,
  onToggle,
  onRemove,
  onCycleWho,
  onAddCustom,
}: {
  group: ChecklistGroup;
  doneMap: Record<string, boolean>;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onCycleWho: (itemId: string, current: Assignee) => void;
  onAddCustom: (groupId: string, data: { name: string; who: Assignee }) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWho, setNewWho] = useState<Assignee>("함께");

  const completed = group.items.filter((i) => doneMap[i.id]).length;
  const total = group.items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddCustom(group.id, { name: trimmed, who: newWho });
    setNewName("");
    setNewWho("함께");
    setAddOpen(false);
  };

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
            <div
              key={it.id}
              className={`px-4 py-3 flex items-center gap-3 ${
                idx !== 0 ? "border-t border-paper-line" : ""
              }`}
            >
              <button
                onClick={() => onToggle(it.id)}
                className="shrink-0"
                aria-label={isDone ? "완료 해제" : "완료 표시"}
              >
                <span
                  className={`block w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center ${
                    isDone ? "border-coral-500 bg-coral-500 text-white" : "border-paper-line"
                  }`}
                  aria-checked={isDone}
                  role="checkbox"
                >
                  {isDone && <Check size={12} strokeWidth={3} />}
                </span>
              </button>

              <button
                onClick={() => onToggle(it.id)}
                className={`flex-1 text-left text-[13.5px] tracking-tight active:opacity-60 transition ${
                  isDone ? "line-through text-ink-muted" : "text-ink"
                }`}
              >
                {it.name}
                {it.custom && (
                  <span className="ml-1.5 text-[9.5px] font-mono text-coral-700">+</span>
                )}
              </button>

              <button
                onClick={() => onCycleWho(it.id, it.who)}
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold active:scale-95 transition ${
                  assigneeStyle[it.who]
                }`}
                aria-label={`담당자 변경 (현재 ${it.who})`}
              >
                {it.who}
              </button>

              {it.offsetDays !== undefined && (
                <span className="text-[10.5px] text-ink-muted font-mono min-w-[30px] text-right">
                  {formatOffset(it.offsetDays)}
                </span>
              )}

              <button
                onClick={() => onRemove(it.id)}
                aria-label="항목 삭제"
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-ink-muted active:bg-paper active:text-coral-700 transition"
              >
                <Minus size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {addOpen ? (
        <form
          onSubmit={submitAdd}
          className="border-t border-paper-line p-3 space-y-2.5 bg-paper/50"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`${group.title}에 항목 추가`}
            className="w-full bg-paper-surface rounded-xl px-3.5 py-2.5 text-[13.5px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {WHO_OPTIONS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setNewWho(w)}
                  className={`text-[11px] px-2 py-1 rounded-full font-bold transition ${
                    newWho === w
                      ? assigneeStyle[w]
                      : "bg-paper-surface text-ink-muted border border-paper-line"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => {
                setAddOpen(false);
                setNewName("");
              }}
              className="text-[12px] text-ink-muted px-3 py-1.5"
            >
              취소
            </button>
            <button
              type="submit"
              className="text-[12px] font-bold text-white bg-coral-500 px-3 py-1.5 rounded-full active:scale-95 transition"
            >
              추가
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAddOpen(true)}
          className="w-full py-2.5 text-[12.5px] font-medium text-ink-muted border-t border-paper-line flex items-center justify-center gap-1.5 active:bg-paper transition"
        >
          <Plus size={13} />
          항목 추가
        </button>
      )}
    </div>
  );
}
