import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-lg mx-auto px-5 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 text-sm mb-6">
          <ArrowLeft size={16} />
          홈으로
        </Link>

        <h1 className="text-xl font-bold mb-2">개인정보처리방침</h1>
        <p className="text-xs text-gray-400 mb-6">v2.0 · 2026년 4월 20일 시행 (카카오 로그인 항목 추가)</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-base mb-2">1. 개인정보의 수집 및 이용 목적</h2>
            <p>신혼생활(이하 &quot;서비스&quot;)은 다음의 목적을 위해 최소한의 개인정보를 수집·이용합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>카카오 계정을 통한 로그인 및 회원 식별</li>
              <li>AI 상담 서비스 제공 및 품질 개선</li>
              <li>맞춤형 정책·혜택 정보 안내</li>
              <li>체크리스트·가계부 데이터 클라우드 동기화</li>
              <li>서비스 이용 통계 분석 (코호트·리텐션)</li>
              <li>향후 마케팅 수단 확대 시 별도 동의를 받아 알림 발송</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">2. 수집하는 개인정보 항목</h2>
            <p className="mb-2 font-medium">카카오 로그인 시 수집 항목 (필수)</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>카카오 계정 고유 ID (kakao_id)</li>
              <li>프로필 닉네임 및 프로필 사진 URL</li>
            </ul>
            <p className="mb-2 font-medium">카카오 로그인 시 수집 항목 (선택·동의 시)</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>카카오 계정 이메일</li>
              <li>마케팅 정보 수신 동의 여부</li>
            </ul>
            <p className="mb-2 font-medium">서비스 이용 중 생성되는 정보</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>온보딩 프로필 (결혼 단계, 거주 지역, 관심사)</li>
              <li>결혼 체크리스트 진행 상태</li>
              <li>가계부 거래 내역 (부부 분담형)</li>
              <li>AI 상담 시 입력하는 질문 내용 (서버에 저장하지 않음)</li>
              <li>기기 정보 (OS 종류, 앱 버전)</li>
              <li>푸시 알림 토큰 (동의 시에만)</li>
            </ul>
            <p className="mt-3 text-gray-500 text-xs">※ 수집하지 않는 항목: 전화번호, 성별, 연령대, 생일, 카카오톡 친구 목록</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 가입 정보: 서비스 탈퇴 후 30일 이내 파기 (탈퇴 즉시 soft delete, 30일 후 물리 삭제)</li>
              <li>체크리스트·가계부 데이터: 회원 탈퇴 시 함께 파기</li>
              <li>AI 상담 대화 내용: 서버에 저장하지 않음 (세션 종료 시 자동 삭제)</li>
              <li>동의 기록: 법적 근거 보존을 위해 5년간 보관</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">4. 개인정보의 제3자 제공</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>카카오 (Kakao Corp.)</strong>: 로그인 인증 처리 목적. 카카오 개인정보처리방침 적용.</li>
              <li><strong>Anthropic (Claude AI)</strong>: AI 상담 기능 제공 목적. 질문 내용이 API 호출 시 전송되며, Anthropic은 API 데이터를 모델 학습에 사용하지 않음.</li>
              <li><strong>Supabase</strong>: 데이터베이스 호스팅 (사용자 프로필, 체크리스트, 가계부 저장).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">5. 개인정보의 파기</h2>
            <p>서비스 탈퇴 신청 시 30일 이내 모든 개인정보를 파기합니다. localStorage 데이터는 브라우저 캐시 삭제 시 자동 삭제됩니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">6. 이용자의 권리</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>MY 탭 → 탈퇴 버튼을 통해 언제든지 계정 삭제 및 데이터 파기 요청 가능</li>
              <li>마케팅 수신 동의는 MY 탭 설정에서 언제든지 철회 가능</li>
              <li>푸시 알림은 기기 설정에서 비활성화 가능</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">7. 개인정보 보호 책임자</h2>
            <p>성명: 허파랑<br />이메일: heoparang@gmail.com<br />서비스: 신혼생활 (sinhon.life)</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">8. 시행일 및 개정 이력</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>v1.0: 2026년 4월 9일 (최초 시행)</li>
              <li>v2.0: 2026년 4월 20일 (카카오 로그인, Supabase DB, 탈퇴 절차 추가)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
