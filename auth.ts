import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 取得するアカウント情報の内容を決める
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    // ログイン時に実行
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      return token;
    },

    // session取得時に実行　※auth()、useSession()など
    // tokenはjwtで加工されたtokenが入る
    async session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === 'string' ? token.accessToken : undefined;

      session.refreshToken =
        typeof token.refreshToken === 'string' ? token.refreshToken : undefined;

      session.expiresAt =
        typeof token.expiresAt === 'number' ? token.expiresAt : undefined;
      return session;
    },
  },
});
