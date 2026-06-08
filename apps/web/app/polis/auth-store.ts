"use client";

import { useCallback, useEffect, useState } from "react";

/* ============================================================
   인증 — 카카오 로그인 (Kakao JS SDK) + 게스트 둘러보기
   NEXT_PUBLIC_KAKAO_JS_KEY 가 설정되면 실제 카카오 가입이 동작.
   미설정 시에도 게스트로 앱 전체를 둘러볼 수 있음.
   ============================================================ */

export type AuthProvider = "kakao" | "guest";
export type AuthUser = {
  id: string;
  nickname: string;
  avatar?: string;
  provider: AuthProvider;
};

const AUTH_KEY = "sinhon.polis_auth.v1";

export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";
export const kakaoConfigured = KAKAO_JS_KEY.length > 0;

const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

/* ---------------- Kakao SDK 타입 (필요 부분만) ---------------- */
type KakaoProfile = { nickname?: string; thumbnail_image_url?: string; profile_image_url?: string };
type KakaoMeResponse = {
  id: number;
  kakao_account?: { profile?: KakaoProfile };
  properties?: { nickname?: string; thumbnail_image?: string };
};
type KakaoSDK = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Auth: {
    login: (opts: { scope?: string; success: () => void; fail: (e: unknown) => void }) => void;
    logout: (cb?: () => void) => void;
  };
  API: {
    request: (opts: {
      url: string;
      success: (res: KakaoMeResponse) => void;
      fail: (e: unknown) => void;
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

let sdkPromise: Promise<KakaoSDK> | null = null;

function initKakao(sdk: KakaoSDK): KakaoSDK {
  if (!sdk.isInitialized() && KAKAO_JS_KEY) sdk.init(KAKAO_JS_KEY);
  return sdk;
}

/** Kakao SDK 동적 로드 + init. 키 미설정/로드 실패 시 reject. */
export function loadKakao(): Promise<KakaoSDK> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (!kakaoConfigured) return Promise.reject(new Error("kakao not configured"));
  if (window.Kakao) return Promise.resolve(initKakao(window.Kakao));
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<KakaoSDK>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (window.Kakao) resolve(initKakao(window.Kakao));
      else reject(new Error("Kakao SDK missing after load"));
    };
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Kakao SDK load failed"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

function pickNickname(res: KakaoMeResponse): string {
  return res.kakao_account?.profile?.nickname || res.properties?.nickname || "신혼부부";
}
function pickAvatar(res: KakaoMeResponse): string | undefined {
  return (
    res.kakao_account?.profile?.thumbnail_image_url ||
    res.kakao_account?.profile?.profile_image_url ||
    res.properties?.thumbnail_image ||
    undefined
  );
}

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
function writeUser(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (u) window.localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export type UseAuth = {
  user: AuthUser | null;
  hydrated: boolean;
  kakaoReady: boolean;
  loginKakao: () => Promise<AuthUser>;
  loginGuest: () => AuthUser;
  logout: () => void;
};

export function useAuth(): UseAuth {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readUser());
    setHydrated(true);
    // 키가 있으면 미리 SDK 를 깔아 로그인 클릭 지연을 줄임
    if (kakaoConfigured) loadKakao().catch(() => undefined);
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    setUser(u);
    writeUser(u);
  }, []);

  const loginKakao = useCallback(async (): Promise<AuthUser> => {
    const sdk = await loadKakao();
    return new Promise<AuthUser>((resolve, reject) => {
      sdk.Auth.login({
        scope: "profile_nickname,profile_image",
        success: () => {
          sdk.API.request({
            url: "/v2/user/me",
            success: (res) => {
              const u: AuthUser = {
                id: `kakao_${res.id}`,
                nickname: pickNickname(res),
                avatar: pickAvatar(res),
                provider: "kakao"
              };
              persist(u);
              resolve(u);
            },
            fail: reject
          });
        },
        fail: reject
      });
    });
  }, [persist]);

  const loginGuest = useCallback((): AuthUser => {
    const u: AuthUser = {
      id: `guest_${Date.now().toString(36)}`,
      nickname: "둘러보는 중",
      provider: "guest"
    };
    persist(u);
    return u;
  }, [persist]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined" && window.Kakao?.Auth) {
      try {
        window.Kakao.Auth.logout();
      } catch {
        /* ignore */
      }
    }
    persist(null);
  }, [persist]);

  return { user, hydrated, kakaoReady: kakaoConfigured, loginKakao, loginGuest, logout };
}
