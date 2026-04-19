"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function EditProfileModal({
  open,
  initialNames,
  initialMarriageDate,
  onClose,
  onSave,
}: {
  open: boolean;
  initialNames: string;
  initialMarriageDate: string;
  onClose: () => void;
  onSave: (data: { names: string; marriageDate: string }) => void;
}) {
  const [names, setNames] = useState(initialNames);
  const [date, setDate] = useState(initialMarriageDate);

  useEffect(() => {
    if (open) {
      setNames(initialNames);
      setDate(initialMarriageDate);
    }
  }, [open, initialNames, initialMarriageDate]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      names: names.trim() || initialNames,
      marriageDate: date || "",
    });
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
          <h3 className="font-serif text-[20px] font-medium tracking-tight">우리 소개 수정</h3>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-ink-muted">
            <X size={20} />
          </button>
        </div>

        <label className="block">
          <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
            우리 이름 (· 으로 구분)
          </span>
          <input
            type="text"
            value={names}
            onChange={(e) => setNames(e.target.value)}
            placeholder="지훈·서연"
            className="w-full mt-1 bg-paper rounded-xl px-3.5 py-2.5 text-[14px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
          />
        </label>

        <label className="block">
          <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">결혼일</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 bg-paper rounded-xl px-3.5 py-2.5 text-[14px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
          />
          <p className="text-[11px] text-ink-muted mt-1.5">
            홈의 기념일 카운터와 MY 히어로에 반영돼요.
          </p>
        </label>

        <button
          type="submit"
          className="w-full py-3 bg-coral-500 text-white rounded-full font-bold text-[14px] active:scale-95 transition"
        >
          저장
        </button>
      </form>
    </div>
  );
}
