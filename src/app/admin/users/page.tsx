"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, TrendingUp, Loader2 } from "lucide-react";

interface Stats {
  totalActive: number;
  totalDeleted: number;
  newThisMonth: number;
  newThisWeek: number;
  newToday: number;
  mau: number;
}

interface RecentUser {
  id: string;
  nickname: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  marketingOptIn: boolean;
}

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-sm font-medium text-gray-600">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function UsersPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { setStats(d.stats); setRecentUsers(d.recentUsers ?? []); })
      .catch(() => setError("DB 미연결 또는 권한 오류"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="font-bold text-amber-800">데이터 로딩 실패</p>
        <p className="text-sm text-amber-600 mt-1">{error ?? "DB 연결 필요 — DATABASE_URL 환경변수를 확인하세요"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">가입자 DB</h2>
        <p className="text-sm text-gray-500 mt-1">카카오 로그인 기반 실시간 통계</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={<UserCheck size={16} className="text-coral" />}
          label="총 활성 회원"
          value={stats.totalActive.toLocaleString()}
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-mint-700" />}
          label="MAU (30일)"
          value={stats.mau.toLocaleString()}
          sub="최근 30일 로그인"
        />
        <StatCard
          icon={<Users size={16} className="text-blue-500" />}
          label="이번 달 신규"
          value={stats.newThisMonth.toLocaleString()}
        />
        <StatCard
          icon={<Users size={16} className="text-green-500" />}
          label="이번 주 신규"
          value={stats.newThisWeek.toLocaleString()}
        />
        <StatCard
          icon={<Users size={16} className="text-indigo-500" />}
          label="오늘 신규"
          value={stats.newToday.toLocaleString()}
        />
        <StatCard
          icon={<UserX size={16} className="text-gray-400" />}
          label="탈퇴 (누적)"
          value={stats.totalDeleted.toLocaleString()}
        />
      </div>

      {recentUsers.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3">최근 가입자 (최대 10명)</h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{u.nickname ?? "이름 없음"}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    가입: {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="text-right">
                  {u.marketingOptIn && (
                    <span className="text-[10px] bg-coral-50 text-coral-600 px-2 py-0.5 rounded-full font-mono">마케팅동의</span>
                  )}
                  {u.lastLoginAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      최근: {new Date(u.lastLoginAt).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
