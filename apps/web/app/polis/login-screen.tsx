"use client";

import { useState } from "react";

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={20} height={20}>
      <path d="M12 3C6.9 3 2.8 6.2 2.8 10.2c0 2.6 1.8 4.9 4.4 6.2-.2.7-.7 2.5-.8 2.9-.1.5.2.5.4.4.2-.1 2.7-1.8 3.7-2.5.5.1 1 .1 1.5.1 5.1 0 9.2-3.2 9.2-7.1S17.1 3 12 3Z" />
    </svg>
  );
}

export function LoginScreen({
  kakaoReady,
  onKakao,
  onGuest
}: {
  kakaoReady: boolean;
  onKakao: () => Promise<unknown>;
  onGuest: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleKakao() {
    if (busy) return;
    setErr(null);
    if (!kakaoReady) {
      setErr("카카오 로그인은 곧 열려요. 지금은 둘러보기로 입장할 수 있어요.");
      return;
    }
    setBusy(true);
    try {
      await onKakao();
    } catch {
      setErr("카카오 로그인을 완료하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-hero">
        <span className="login-mk" />
        <h1 className="login-title">신혼생활</h1>
        <p className="login-sub">
          신혼, 시작은 혜택부터.
          <br />
          전세대출부터 청약·출산지원까지
          <br />
          두리AI가 모아드려요.
        </p>
        <div className="login-pills">
          <span className="login-pill">버팀목 전세 1.5%</span>
          <span className="login-pill">첫만남 200만원</span>
          <span className="login-pill">신생아 특례 5억</span>
          <span className="login-pill">결혼축하금 100만원</span>
        </div>
      </div>

      <div className="login-actions">
        <button type="button" className="btn-kakao" onClick={handleKakao} disabled={busy}>
          <KakaoIcon />
          {busy ? "연결 중…" : "카카오로 3초 만에 시작하기"}
        </button>
        <button type="button" className="login-guest" onClick={onGuest}>
          가입 없이 둘러볼게요
        </button>
        {err && <p className="login-err">{err}</p>}
        <p className="login-note">로그인하면 신청·찜·서류 준비를 기기 간에 이어서 볼 수 있어요.</p>
      </div>
    </div>
  );
}
