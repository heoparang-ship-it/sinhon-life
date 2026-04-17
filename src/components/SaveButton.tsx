"use client";

import { useEffect, useState } from "react";
import { isItemSaved, removeItem, saveItem } from "@/lib/storage";

interface SaveButtonProps {
  id: string;
}

export default function SaveButton({ id }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setSaved(isItemSaved(id));
    setReady(true);
  }, [id]);

  const toggle = () => {
    setPop(true);
    setTimeout(() => setPop(false), 300);

    if (saved) {
      removeItem(id);
      setSaved(false);
    } else {
      saveItem(id);
      setSaved(true);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={!ready}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
        !ready ? "opacity-40" : ""
      } ${pop ? "scale-125" : ""}`}
      aria-label={saved ? "저장 취소" : "저장하기"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={saved ? "#F97066" : "none"}
        stroke={saved ? "#F97066" : "#A0AEC0"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
