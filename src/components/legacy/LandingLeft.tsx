export function LandingLeft() {
  return (
    <div className="hidden lg:flex flex-col gap-6 w-[280px] flex-shrink-0">
      {/* Wedding 포스터 — 메탈릭 베젤 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "280 / 388",
          borderRadius: 26,
          padding: 1.5,
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
              borderRadius: 25,
            }}
          />
        </picture>
      </div>

      {/* QR 행 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 4px",
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            color: "#6B6056",
            letterSpacing: "-0.01em",
            lineHeight: 1.45,
          }}
        >
          QR 찍고 앱에서
          <br />더 자세히 보기
        </div>
        <div
          style={{
            width: 104,
            height: 104,
            background: "#fff",
            borderRadius: 18,
            padding: 8,
            boxShadow:
              "0 1px 2px rgba(20,40,80,0.06), 0 8px 20px -10px rgba(20,40,80,0.18)",
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
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}
