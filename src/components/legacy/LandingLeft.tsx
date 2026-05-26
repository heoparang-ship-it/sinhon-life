export function LandingLeft() {
  return (
    <div className="hidden lg:flex flex-col items-center gap-[30px] desktop-left justify-end pb-[48px]">
      {/* Wedding 포스터 — 메탈릭 베젤 */}
      <div
        style={{
          position: "relative",
          width: "min(100%, 400px)",
          aspectRatio: "480 / 568",
          borderRadius: 18,
          padding: 0,
          background:
            "linear-gradient(135deg, #E8EAEE 0%, #B7BCC4 30%, #8A9099 50%, #B7BCC4 70%, #E8EAEE 100%)",
          boxShadow:
            "0 1px 2px rgba(20,40,80,0.08), 0 18px 36px -18px rgba(20,40,80,0.18), 0 36px 64px -32px rgba(20,40,80,0.14)",
          isolation: "isolate",
        }}
      >
        <picture>
          <source srcSet="/poster.webp" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/poster.jpg"
            alt="신혼생활 — 함께 준비하는 결혼의 모든 순간"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 18,
            }}
          />
        </picture>
      </div>

      {/* QR 행 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          width: "min(100%, 400px)",
          padding: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: 21,
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "0",
            lineHeight: 1.45,
          }}
        >
          QR 찍고 앱에서
          <br />더 자세히 보기
        </div>
        <div
          style={{
            width: 168,
            height: 168,
            background: "transparent",
            borderRadius: 0,
            padding: 0,
            boxShadow: "none",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/qr.png"
            alt="QR — https://sinhon.life"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              borderRadius: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
