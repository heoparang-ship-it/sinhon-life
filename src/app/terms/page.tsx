import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-lg mx-auto px-5 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 text-sm mb-6">
          <ArrowLeft size={16} />
          홈으로
        </Link>

        <h1 className="text-xl font-bold mb-2">이용약관</h1>
        <p className="text-xs text-gray-400 mb-6">v1.0 · 2026년 4월 20일 시행</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-base mb-2">제1조 (목적)</h2>
            <p>이 약관은 신혼생활(sinhon.life, 이하 &quot;서비스&quot;)이 제공하는 신혼부부 정책·혜택 AI 상담 플랫폼 서비스의 이용 조건 및 절차, 서비스 제공자와 이용자 간의 권리·의무 관계를 규정합니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">제2조 (서비스의 내용)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>신혼부부 대상 정책·혜택 정보 제공 및 AI 상담</li>
              <li>결혼 준비 체크리스트 및 부부 가계부 기능</li>
              <li>카카오 계정 기반 데이터 동기화 서비스</li>
              <li>맞춤 정보 알림 (별도 동의 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">제3조 (회원가입)</h2>
            <p>서비스는 카카오 계정을 통한 소셜 로그인 방식으로 회원가입을 제공합니다. 서비스 이용 약관과 개인정보처리방침에 동의함으로써 회원으로 가입됩니다. 만 14세 미만은 회원가입이 불가합니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">제4조 (서비스 이용)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>비로그인 상태에서도 기본 기능을 이용할 수 있습니다.</li>
              <li>로그인 시 체크리스트, 가계부, 프로필 동기화 기능이 활성화됩니다.</li>
              <li>AI 상담 서비스는 정보 제공 목적이며, 법적·의료·금융 전문 조언을 대체하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">제5조 (금지 사항)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>타인의 정보를 이용한 로그인 또는 부정 사용</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>허위 정보 등록 또는 불법 목적의 이용</li>
              <li>저작권 등 지식재산권 침해 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">제6조 (탈퇴 및 데이터 삭제)</h2>
            <p>회원은 MY 탭 → 탈퇴 버튼을 통해 언제든지 탈퇴할 수 있습니다. 탈퇴 신청 후 30일 이내 모든 개인정보 및 서비스 이용 데이터가 삭제됩니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">제7조 (면책)</h2>
            <p>서비스는 AI 상담 결과의 정확성을 보증하지 않습니다. 서비스 중단·장애로 인한 손해에 대해 서비스 제공자는 책임을 지지 않습니다. 정부 정책 정보는 실제 정책과 다를 수 있으며, 공식 기관에서 직접 확인하시기 바랍니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">제8조 (연락처)</h2>
            <p>서비스 운영자: 허파랑<br />이메일: heoparang@gmail.com<br />서비스: sinhon.life</p>
          </section>
        </div>
      </div>
    </div>
  );
}
