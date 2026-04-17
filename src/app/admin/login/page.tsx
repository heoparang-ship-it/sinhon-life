"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, KeyRound, AlertTriangle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";
  const initialError = search.get("e") === "config" ? "ADMIN_PASSWORD 환경변수가 설정되지 않았어요. Amplify 환경변수를 먼저 등록해주세요." : "";

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "비밀번호가 틀렸어요.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("네트워크 오류. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-coral-50 flex items-center justify-center">
            <ShieldCheck size={18} className="text-coral" />
          </div>
          <div>
            <h1 className="font-extrabold text-[16px]">관리자 로그인</h1>
            <p className="text-[11px] text-gray-500">sinhon.life admin</p>
          </div>
        </div>

        <label className="block text-[12px] font-bold text-gray-700 mb-1">
          비밀번호
        </label>
        <div className="relative">
          <KeyRound
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-coral"
            placeholder="ADMIN_PASSWORD"
          />
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-700 text-[12px] rounded-lg p-2.5">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !password}
          className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
            submitting || !password
              ? "bg-gray-200 text-gray-400"
              : "bg-coral text-white shadow-lg shadow-coral/20"
          }`}
        >
          {submitting ? "확인 중…" : "로그인"}
        </button>

        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
          환경변수 <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code>에 등록된 비밀번호를 사용하세요.<br />
          세션은 7일간 유지됩니다.
        </p>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
