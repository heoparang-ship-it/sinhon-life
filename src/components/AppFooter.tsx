"use client";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function AppFooter() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/ai")) return null;
  return <Footer />;
}
