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

        <h1 className="text-xl font-bold mb-6">개인정보처리방침</h1>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-base mb-2">1. 개인정보의 수집 및 이용 목적</h2>
            <p>신혼생활(이하 &quot;서비스&quot;)은 다음의 목적을 위해 최소한의 개인정보를 수집·이용합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>AI 상담 서비스 제공 및 품질 개선</li>
              <li>맞춤형 정책·혜택 정보 안내</li>
              <li>서비스 이용 통계 분석</li>
              <li>푸시 알림 발송 (동의 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">2. 수집하는 개인정보 항목</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>AI 상담 시 입력하는 질문 내용 (대화 기록은 서버에 저장하지 않음)</li>
              <li>기기 정보 (OS 종류, 앱 버전)</li>
              <li>푸시 알림 토큰 (동의 시에만)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <p>서비스는 사용자의 AI 상담 대화 내용을 서버에 저장하지 않습니다. 기기 정보 및 푸시 토큰은 서비스 이용 기간 동안만 보유하며, 앱 삭제 시 자동으로 삭제됩니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">4. 개인정보의 제3자 제공</h2>
            <p>서비스는 사용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, AI 상담 기능 제공을 위해 Anthropic(Claude AI) API를 사용하며, 질문 내용이 API 호출 시 전송됩니다. Anthropic은 API를 통해 전송된 데이터를 모델 학습에 사용하지 않습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">5. 개인정보의 파기</h2>
            <p>서비스를 탈퇴하거나 앱을 삭제하면 모든 개인정보가 즉시 파기됩니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">6. 이용자의 권리</h2>
            <p>이용자는 언제든지 푸시 알림 수신을 거부할 수 있으며, 기기 설정에서 알림을 비활성화할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">7. 개인정보 보호 책임자</h2>
            <p>성명: 허파랑<br />이메일: heoparang@gmail.com<br />서비스: 신혼생활 (sinhon.life)</p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2">8. 시행일</h2>
            <p>본 개인정보처리방침은 2026년 4월 9일부터 시행됩니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
