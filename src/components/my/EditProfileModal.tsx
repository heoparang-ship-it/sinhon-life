"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function EditProfileModal({
  open,
  initialPartnerA,
  initialPartnerB,
  initialMarriageDate,
  onClose,
  onSave,
}: {
  open: boolean;
  initialPartnerA: string;
  initialPartnerB: string;
  initialMarriageDate: string;
  onClose: () => void;
  onSave: (data: {
    partnerA: string;
    partnerB: string;
    marriageDate: string;
  }) => void;
}) {
  const [partnerA, setPartnerA] = useState(initialPartnerA);
  const [partnerB, setPartnerB] = useState(initialPartnerB);
  const [date, setDate] = useState(initialMarriageDate);

  useEffect(() => {
    if (open) {
      setPartnerA(initialPartnerA);
      setPartnerB(initialPartnerB);
      setDate(initialMarriageDate);
    }
  }, [open, initialPartnerA, initialPartnerB, initialMarriageDate]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      partnerA: partnerA.trim() || initialPartnerA,
      partnerB: partnerB.trim() || initialPartnerB,
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

        <div className="grid grid-cols-2 gap-2.5">
          <label className="block">
            <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
              신랑 이름
            </span>
            <input
              type="text"
              value={partnerA}
              onChange={(e) => setPartnerA(e.target.value)}
              placeholder="신랑"
              className="w-full mt-1 bg-paper rounded-xl px-3.5 py-2.5 text-[14px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
              신부 이름
            </span>
            <input
              type="text"
              value={partnerB}
              onChange={(e) => setPartnerB(e.target.value)}
              placeholder="신부"
              className="w-full mt-1 bg-paper rounded-xl px-3.5 py-2.5 text-[14px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-mint-300"
            />
          </label>
        </div>
        <p className="text-[11px] text-ink-muted -mt-1.5">
          가계부·홈·MY에서 바로 이 이름으로 바뀌어요.
        </p>

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
