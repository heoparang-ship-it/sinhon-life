"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname() || "/";
  // 광고 랜딩(/lp/*)·지원금 진단(/support)에서는 탭바 숨김 — 단일 전환 경로 보호
  if (pathname.startsWith("/lp/") || pathname.startsWith("/support")) return null;
  const homeActive = pathname === "/";
  const myActive =
    pathname === "/my" || pathname.startsWith("/my/") || pathname === "/budget" || pathname.startsWith("/budget/");

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-30 mx-auto flex h-[82px] max-w-[480px] items-start justify-around border-t border-[#EEF2F6] bg-white/95 pt-[11px] backdrop-blur-md lg:absolute"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      {/* 홈 */}
      <Link href="/" className="flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap">
        <Image
          src="/icons/14_tab_home.png"
          alt="홈"
          width={26}
          height={26}
          className={`h-[26px] w-[26px] object-contain transition-opacity ${homeActive ? "opacity-100" : "opacity-45"}`}
        />
        <span className={`text-[11.5px] font-bold ${homeActive ? "text-blue-accent" : "text-[#A9B4C0]"}`}>홈</span>
      </Link>

      {/* 가운데 떠있는 AI톡 */}
      <Link
        href="/ai"
        className="flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap"
        aria-label="AI톡"
      >
        <span
          className="-mt-[28px] mb-1 grid h-[60px] w-[60px] place-items-center rounded-full"
          style={{
            background: "linear-gradient(150deg,#4F9CDB,#2F77BE)",
            boxShadow: "0 12px 24px rgba(47,119,190,0.42), 0 0 0 5px #fff",
          }}
        >
          <Image
            src="/icons/03_ai_talk.png"
            alt="AI톡"
            width={34}
            height={34}
            className="h-[34px] w-[34px] object-contain"
          />
        </span>
        <span className="text-[11.5px] font-bold text-blue-accent">AI톡</span>
      </Link>

      {/* MY */}
      <Link href="/my" className="flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap">
        <Image
          src="/icons/15_tab_my.png"
          alt="MY"
          width={26}
          height={26}
          className={`h-[26px] w-[26px] object-contain transition-opacity ${myActive ? "opacity-100" : "opacity-45"}`}
        />
        <span className={`text-[11.5px] font-bold ${myActive ? "text-blue-accent" : "text-[#A9B4C0]"}`}>MY</span>
      </Link>
    </nav>
  );
}
