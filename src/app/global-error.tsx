"use client";

/**
 * Top-level error boundary — replaces <html>/<body> if root layout itself throws.
 * Must not depend on root layout's providers.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FDF8F1", color: "#1E2A3A" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 360, textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>앱 실행에 문제가 생겼어요</h1>
            <p style={{ fontSize: 14, color: "#4A5566", lineHeight: 1.5, marginBottom: 20 }}>
              아래 버튼을 눌러 다시 시도해주세요. 반복되면 heoparang@gmail.com 으로 알려주세요.
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre style={{ fontSize: 11, color: "#8F95A1", textAlign: "left", overflow: "auto", padding: 8, background: "#F2EDE4", borderRadius: 8, marginBottom: 16 }}>
                {error.message}
                {error.digest ? `\nDigest: ${error.digest}` : ""}
              </pre>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#F97066",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
