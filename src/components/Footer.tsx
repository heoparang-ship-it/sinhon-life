/**
 * Footer — 사업자 정보 영역 (카카오 비즈니스 인증 심사 대응)
 *
 * feat/next-migration 브랜치 디자인 토큰(CSS variable) 사용.
 * 사업자등록증과 100% 일치하는 정보만 표기.
 */
export function Footer() {
  return (
    <footer
      aria-label="사업자 정보"
      className="mt-8 border-t px-5 pt-6 pb-28"
      style={{
        borderColor: "var(--color-hairline)",
        background: "var(--color-paper)",
      }}
    >
      <div
        className="text-[12px] leading-relaxed space-y-1.5"
        style={{ color: "var(--color-mute)" }}
      >
        <p
          className="font-semibold text-[13px] mb-2"
          style={{ color: "var(--color-ink-soft)" }}
        >
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
            className="underline"
            style={{ color: "var(--color-blue-deepest)" }}
          >
            pr@xcom.co.kr
          </a>
        </p>
      </div>
      <p
        className="mt-4 text-[10px]"
        style={{ color: "var(--color-faint)" }}
      >
        © 2026 주식회사 엑스컴. 신혼생활(sinhon.life)은 주식회사 엑스컴이
        운영합니다.
      </p>
    </footer>
  );
}

export default Footer;
