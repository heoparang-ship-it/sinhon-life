import { type NextAuthOptions, getServerSession } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

// ---------------------------------------------------------------------------
// NextAuth 옵션
// ---------------------------------------------------------------------------
export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  callbacks: {
    // JWT에 kakao_id·nickname·profile_image 저장
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const kakaoProfile = profile as {
          id: number;
          kakao_account?: {
            profile?: { nickname?: string; profile_image_url?: string };
            email?: string;
          };
        };
        token.kakaoId = String(kakaoProfile.id);
        token.nickname =
          kakaoProfile.kakao_account?.profile?.nickname ?? token.name ?? "";
        token.profileImage =
          kakaoProfile.kakao_account?.profile?.profile_image_url ?? "";
        token.email = kakaoProfile.kakao_account?.email ?? token.email ?? "";
      }
      return token;
    },

    // 세션 객체에 kakaoId·nickname·profileImage 노출
    async session({ session, token }) {
      session.user = {
        ...session.user,
        kakaoId: token.kakaoId as string,
        nickname: token.nickname as string,
        profileImage: token.profileImage as string,
        email: token.email as string,
      };
      return session;
    },
  },

  pages: {
    signIn: "/my", // 로그인 페이지 → MY 탭으로 리다이렉트
    error: "/my",
  },
};

// ---------------------------------------------------------------------------
// 서버 컴포넌트 / API route 용 헬퍼
// ---------------------------------------------------------------------------
export async function getAuthSession() {
  return getServerSession(authOptions);
}
