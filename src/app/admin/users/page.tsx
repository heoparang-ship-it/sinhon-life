"use client";

import { Users, Shield, MessageCircle } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">가입자 DB</h2>
        <p className="text-sm text-gray-500 mt-1">사용자 인증 시스템 연동 후 활성화됩니다</p>
      </div>

      {/* 미연동 안내 */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-gray-400" />
        </div>
        <h3 className="font-bold text-lg">인증 시스템 연동 필요</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          카카오 로그인 등 사용자 인증을 연동하면 가입자 정보, 상담 내역, 스크랩 데이터를 확인할 수 있습니다.
        </p>
      </div>

      {/* 연동 후 제공될 기능 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-coral-50 flex items-center justify-center">
              <Users size={16} className="text-coral" />
            </div>
            <h4 className="font-bold text-sm">가입자 상세</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li>• 가입일 / 마지막 접속일</li>
            <li>• 결혼 예정일 / D-day</li>
            <li>• 관심 카테고리</li>
            <li>• 지역 / 소득 구간 (선택 입력)</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-mint-50 flex items-center justify-center">
              <MessageCircle size={16} className="text-mint" />
            </div>
            <h4 className="font-bold text-sm">AI 상담 내역</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li>• 총 상담 횟수</li>
            <li>• 자주 묻는 질문 TOP 10</li>
            <li>• 상담 만족도</li>
            <li>• 최근 질문 로그</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Shield size={16} className="text-gray-500" />
            </div>
            <h4 className="font-bold text-sm">혜택 신청 현황</h4>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li>• 저장한 정책 목록</li>
            <li>• 신청 완료 체크</li>
            <li>• 예상 수혜 금액</li>
            <li>• 스크랩 업체 리스트</li>
          </ul>
        </div>
      </div>

      {/* 다음 단계 */}
      <div className="bg-gradient-to-br from-coral-50 to-coral-100/50 rounded-xl p-5 border border-coral-200/30">
        <h4 className="font-bold text-sm mb-2">다음 단계: 카카오 로그인 연동</h4>
        <ol className="space-y-1.5 text-xs text-gray-600">
          <li>1. Kakao Developers에서 앱 등록</li>
          <li>2. NextAuth.js + Kakao Provider 설정</li>
          <li>3. Supabase 또는 PlanetScale로 사용자 DB 구축</li>
          <li>4. 이 관리자 페이지에서 가입자 데이터 조회 가능</li>
        </ol>
      </div>
    </div>
  );
}
