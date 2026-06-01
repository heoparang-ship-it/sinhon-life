import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "사업자 정보",
  description: "신혼생활을 운영하는 주식회사 엑스컴 사업자 정보",
  alternates: { canonical: "https://sinhon.life/business" },
};

export default function BusinessPage() {
  return (
    <LegalPage
      title="사업자 정보"
      description="신혼생활(sinhon.life)은 주식회사 엑스컴이 운영하는 결혼·신혼 의사결정 도우미 서비스입니다."
      updatedAt="2026년 5월 31일"
      sections={[
        {
          title: "법인 정보",
          body: [
            "상호: 주식회사 엑스컴",
            "대표자: 허파랑",
            "사업자등록번호: 715-81-03544",
            "주소: 인천광역시 부평구 주부토로 236, A동 제5층 S516호(갈산동, 인천테크노밸리 U1센터)",
          ],
        },
        {
          title: "연락처",
          body: [
            "고객센터·일반 문의: pr@xcom.co.kr",
            "개인정보 보호책임자: 허파랑 (pr@xcom.co.kr)",
            "파트너십·제휴 문의: pr@xcom.co.kr",
          ],
        },
        {
          title: "서비스 안내",
          body: [
            "신혼생활은 결혼 준비·신혼 의사결정을 돕는 정보 제공 서비스이며, 인천 신혼·청년 정책 매칭과 파트너 업체 상담 매개(송객)를 함께 제공합니다.",
            "회사는 파트너 업체와의 거래 당사자가 아니며, 거래의 효력과 책임은 이용자와 해당 파트너 업체 사이의 사항입니다.",
            "정책 정보는 참고용이며, 신청 가능 여부와 지원 내용은 각 기관 공식 공고와 신청 창구에서 최종 확인해야 합니다.",
          ],
        },
        {
          title: "약관 및 정책",
          body: [
            "이용약관: /terms",
            "개인정보처리방침: /privacy",
          ],
        },
      ]}
    />
  );
}
