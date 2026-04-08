"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Brain, Store, Users, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/knowledge", icon: Brain, label: "지식 관리" },
  { href: "/admin/vendors", icon: Store, label: "업체 관리" },
  { href: "/admin/users", icon: Users, label: "가입자 DB" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-bold text-lg">신혼생활 관리자</h1>
          </div>
          <span className="text-xs text-gray-400">sinhon.life admin</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* 사이드바 */}
        <nav className="w-52 flex-shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-3.5rem)] py-4 px-2 hidden md:block">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                  isActive
                    ? "bg-coral-50 text-coral font-bold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 탭 바 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
          <div className="flex items-center justify-around h-14">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-1 ${
                    isActive ? "text-coral" : "text-gray-400"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
