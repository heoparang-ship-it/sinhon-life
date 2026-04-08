"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  description: string;
  slug: string;
}

export default function ShareButton({ title, description, slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/share/${slug}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share error:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
      aria-label="공유하기"
    >
      {copied ? (
        <Check size={18} className="text-mint" />
      ) : (
        <Share2 size={18} className="text-warm-text-muted" />
      )}
    </button>
  );
}
