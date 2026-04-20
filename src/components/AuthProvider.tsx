"use client";

// NextAuth SessionProvider — 클라이언트 컴포넌트 wrapper
// layout.tsx (서버 컴포넌트)에서 직접 SessionProvider 사용 불가하여 분리

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
