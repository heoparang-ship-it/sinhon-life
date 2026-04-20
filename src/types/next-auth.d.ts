// NextAuth 세션/JWT 타입 확장 — 카카오 OAuth 필드 추가
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      kakaoId: string;
      nickname: string;
      profileImage: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    kakaoId?: string;
    nickname?: string;
    profileImage?: string;
  }
}
