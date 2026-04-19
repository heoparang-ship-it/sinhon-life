"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function MemoModal({
  open,
  itemName,
  initialMemo,
  onClose,
  onSave,
}: {
  open: boolean;
  itemName: string;
  initialMemo: string;
  onClose: () => void;
  onSave: (memo: string) => void;
}) {
  const [text, setText] = useState(initialMemo);

  useEffect(() => {
    if (open) setText(initialMemo);
  }, [open, initialMemo]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(text);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm bg-paper-surface rounded-3xl p-5 space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-ink-muted font-bold">
              memo
            </div>
            <h3 className="font-serif text-[18px] font-medium tracking-tight text-ink truncate">
              {itemName}
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-ink-muted shrink-0">
            <X size={20} />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="이 항목에 대한 메모 · 계약서 번호·잔금일·업체 연락처·결정 이유 등을 자유롭게"
          rows={5}
          className="w-full bg-paper rounded-xl px-3.5 py-2.5 text-[13.5px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300 resize-none leading-relaxed"
          autoFocus
        />

        <div className="flex gap-2">
          {initialMemo && (
            <button
              type="button"
              onClick={() => {
                onSave("");
                onClose();
              }}
              className="px-3 py-2.5 text-[12.5px] font-medium text-ink-muted bg-paper rounded-full active:scale-95 transition"
            >
              삭제
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2.5 text-[12.5px] font-medium text-ink-muted"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 text-[12.5px] font-bold text-white bg-coral-500 rounded-full active:scale-95 transition"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
