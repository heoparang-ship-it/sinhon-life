"use client";

import { useEffect, useState } from "react";
import { Brain, Store, Users, Activity } from "lucide-react";

interface Stats {
  knowledge: { totalVectors: number; dimension: number } | null;
  vendors: number;
  lastUpdated: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-coral border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">신혼생활 플랫폼 현황</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Brain size={16} />
            <span className="text-xs">지식 데이터</span>
          </div>
          <p className="text-2xl font-bold text-coral">{stats?.knowledge?.totalVectors || 0}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">벡터 레코드</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Store size={16} />
            <span className="text-xs">입점 업체</span>
          </div>
          <p className="text-2xl font-bold text-mint">{stats?.vendors || 0}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">등록 업체</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users size={16} />
            <span className="text-xs">가입자</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">—</p>
          <p className="text-[11px] text-gray-400 mt-0.5">인증 시스템 연동 후 표시</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Activity size={16} />
            <span className="text-xs">AI 상담</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">—</p>
          <p className="text-[11px] text-gray-400 mt-0.5">로깅 연동 후 표시</p>
        </div>
      </div>

      {/* 시스템 상태 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm mb-4">시스템 상태</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">AI 모델</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">claude-haiku-4-5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">벡터 DB</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">Pinecone (multilingual-e5-large)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">임베딩 차원</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{stats?.knowledge?.dimension || 1024}d</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">크롤링 스케줄</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">매주 월요일 12:00 KST</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">배포 플랫폼</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">AWS Amplify (SSR)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
