"use client";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function AppFooter() {
  const pathname = usePathname() || "/";
  // 풀스크린 모바일 화면들에선 푸터 숨김 (자체 스크롤 컨테이너 사용)
  if (
    pathname === "/" ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/my") ||
    pathname.startsWith("/checklist") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/index/")
  ) {
    return null;
  }
  return <Footer />;
}
