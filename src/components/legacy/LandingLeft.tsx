export function LandingLeft() {
  return (
    <div className="hidden lg:flex flex-col items-center gap-[30px] desktop-left justify-end pb-[48px]">
      {/* Wedding 포스터 — 메탈릭 베젤 (1/3 축소) */}
      <div
        style={{
          position: "relative",
          width: "min(100%, 150px)",
          aspectRatio: "480 / 568",
          borderRadius: 14,
          padding: 0,
          background:
            "linear-gradient(135deg, #E8EAEE 0%, #B7BCC4 30%, #8A9099 50%, #B7BCC4 70%, #E8EAEE 100%)",
          boxShadow:
            "0 1px 2px rgba(20,40,80,0.08), 0 12px 24px -14px rgba(20,40,80,0.18)",
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
              borderRadius: 14,
            }}
          />
        </picture>
      </div>

      {/* QR 행 (1/3 축소) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "min(100%, 150px)",
          padding: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "0",
            lineHeight: 1.4,
          }}
        >
          QR 찍고
          <br />앱에서 보기
        </div>
        <div
          style={{
            width: 58,
            height: 58,
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
