"use client";

import { useEffect, useState } from "react";
import Placeholder from "@/components/design/Placeholder";
import { Heart, MessageSquare } from "lucide-react";
import type { HomeTour } from "@/lib/design/home";

const STORAGE_KEY = "sinhon.hometour.likes";

function readLikes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function HomeTours({ tours }: { tours: HomeTour[] }) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLiked(readLikes());
  }, []);

  const toggle = (slug: string) => {
    setLiked((prev) => {
      const next = { ...prev, [slug]: !prev[slug] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="px-5 mb-8 grid grid-cols-2 gap-4">
      {tours.map((h) => {
        const isLiked = !!liked[h.slug];
        return (
          <div key={h.slug} className="group">
            <div className="rounded-xl overflow-hidden">
              <Placeholder label={h.tag} tone={h.tone} aspect="4/5" rounded="rounded-none" />
            </div>
            <div className="pt-2.5">
              <div className="text-[10px] text-ink-muted font-mono tracking-wide mb-1">
                {h.meta}
              </div>
              <div className="text-[13px] font-bold text-ink tracking-tight leading-snug mb-1.5 wb-keep line-clamp-2">
                {h.title}
              </div>
              <div className="flex gap-2.5 text-[11px] text-ink-muted font-mono items-center">
                <button
                  onClick={() => toggle(h.slug)}
                  aria-pressed={isLiked}
                  className={`flex items-center gap-1 transition ${
                    isLiked ? "text-coral-500" : ""
                  }`}
                >
                  <Heart size={12} fill={isLiked ? "currentColor" : "none"} strokeWidth={1.8} />
                  {h.likes}
                </button>
                <span className="flex items-center gap-1">
                  <MessageSquare size={12} strokeWidth={1.8} />
                  {h.comments}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
