"use client";

import { useState } from "react";
import { Check, ChevronDown, Plus, StickyNote, Trash2 } from "lucide-react";
import {
  type ChecklistGroup,
  type Assignee,
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
  memoMap,
  defaultOpen = false,
  onToggle,
  onRemove,
  onCycleWho,
  onAddCustom,
  onOpenMemo,
}: {
  group: ChecklistGroup;
  doneMap: Record<string, boolean>;
  memoMap: Record<string, string>;
  defaultOpen?: boolean;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onCycleWho: (itemId: string, current: Assignee) => void;
  onAddCustom: (groupId: string, data: { name: string; who: Assignee }) => void;
  onOpenMemo: (itemId: string, itemName: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
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
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3.5 flex items-center gap-2.5 active:bg-paper transition text-left"
      >
        <div className="text-[18px]" aria-hidden>
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-bold text-ink tracking-tight">{group.title}</div>
          <div className="text-[11px] text-ink-muted mt-px">
            {completed}/{total} 완료
          </div>
        </div>
        <span className="text-[11px] text-white bg-mint-500 px-2 py-0.5 rounded-full font-mono font-bold">
          {pct}%
        </span>
        <ChevronDown
          size={18}
          className={`text-ink-muted transition-transform shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="border-t border-paper-line">
            {group.items.map((it, idx) => {
              const isDone = !!doneMap[it.id];
              const hasMemo = !!memoMap[it.id];
              return (
                <div
                  key={it.id}
                  className={`px-4 py-3 flex items-center gap-2.5 ${
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
                        isDone
                          ? "border-coral-500 bg-coral-500 text-white"
                          : "border-paper-line"
                      }`}
                      aria-checked={isDone}
                      role="checkbox"
                    >
                      {isDone && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>

                  <button
                    onClick={() => onOpenMemo(it.id, it.name)}
                    className={`flex-1 text-left text-[13.5px] tracking-tight min-w-0 active:opacity-60 transition ${
                      isDone ? "line-through text-ink-muted" : "text-ink"
                    }`}
                  >
                    <span className="block truncate">
                      {it.name}
                      {it.custom && (
                        <span className="ml-1.5 text-[9.5px] font-mono text-coral-700">+</span>
                      )}
                    </span>
                    {hasMemo && (
                      <span className="block text-[10.5px] text-ink-muted mt-0.5 truncate">
                        📝 {memoMap[it.id]}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenMemo(it.id, it.name)}
                    aria-label="메모"
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition active:scale-90 ${
                      hasMemo
                        ? "text-coral-700 bg-coral-50"
                        : "text-ink-muted hover:bg-paper"
                    }`}
                  >
                    <StickyNote size={15} strokeWidth={hasMemo ? 2.2 : 1.7} />
                  </button>

                  <button
                    onClick={() => onCycleWho(it.id, it.who)}
                    className={`text-[10.5px] px-2 py-0.5 rounded-full font-bold shrink-0 active:scale-95 transition ${
                      assigneeStyle[it.who]
                    }`}
                    aria-label={`담당 · 현재 ${it.who}`}
                  >
                    {it.who}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`"${it.name}" 항목을 삭제할까요?`)) onRemove(it.id);
                    }}
                    aria-label="항목 삭제"
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-coral-700 hover:bg-coral-50 active:scale-90 transition"
                  >
                    <Trash2 size={14} strokeWidth={1.9} />
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
              className="w-full py-2.5 text-[12.5px] font-medium text-coral-700 border-t border-paper-line flex items-center justify-center gap-1.5 active:bg-paper transition"
            >
              <Plus size={14} strokeWidth={2} />
              이 그룹에 항목 추가
            </button>
          )}
        </>
      )}
    </div>
  );
}
