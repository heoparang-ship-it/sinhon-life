/**
 * Footer — 사이트 하단 사업자 정보 영역.
 *
 * 표시 규칙:
 * - 사업자등록증과 100% 일치하는 정보만 표기 (카카오 비즈니스 인증 심사 요구)
 * - 상호·대표자·사업자등록번호·사업장 주소·고객센터 이메일을 한 블록에 노출
 * - BottomNav와 겹치지 않도록 layout.tsx의 <main pb-*>와 함께 사용
 */
export default function Footer() {
  return (
    <footer
      aria-label="사업자 정보"
      className="mt-12 border-t border-warm-border bg-warm-bg/60 px-5 py-6"
    >
      <div className="text-xs leading-relaxed text-warm-text-muted space-y-1.5">
        <p className="font-semibold text-warm-text-secondary text-[13px] mb-2">
          사업자 정보
        </p>
        <p>상호: 주식회사 엑스컴</p>
        <p>대표자: 허파랑</p>
        <p>사업자등록번호: 715-81-03544</p>
        <p>
          주소: 인천광역시 부평구 주부토로 236, A동 제5층 S516호(갈산동,
          인천테크노밸리 U1센터)
        </p>
        <p>
          고객센터:{" "}
          <a
            href="mailto:pr@xcom.co.kr"
            className="text-coral hover:underline"
          >
            pr@xcom.co.kr
          </a>
        </p>
      </div>
      <p className="mt-4 text-[10px] text-warm-text-muted">
        © 2026 주식회사 엑스컴. 신혼생활(sinhon.life)은 주식회사 엑스컴이
        운영합니다.
      </p>
    </footer>
  );
}
