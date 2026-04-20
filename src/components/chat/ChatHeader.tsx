import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ChatHeader() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-coral-500 to-mint-500 px-5 pt-3.5 pb-5">
      <span
        aria-hidden
        className="absolute -top-5 -right-5 w-32 h-32 rounded-full"
        style={{ background: "radial-gradient(circle, #FBD38DAA 0%, transparent 70%)" }}
      />
      <div className="relative flex items-center gap-3">
        <Link href="/" aria-label="뒤로가기" className="text-white/90 active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white to-honey-300 flex items-center justify-center text-[22px] shadow-md">
          ✨
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-[20px] font-semibold text-white tracking-tightest">
              AI톡
            </span>
            <span className="text-[10px] font-mono font-bold text-white/90 uppercase tracking-widest">
              beta
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-200 animate-pulse" />
            <span className="text-[11px] text-white/90 font-medium">
              무엇이든 물어보세요 · 24시간
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
