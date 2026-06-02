import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 取得するアカウント情報の内容を決める
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/calendar.readonly',
        },
      },
    }),
  ],
  callbacks: {
    // ログイン時に実行
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },

    // session取得時に実行　※auth()、useSession()など
    // tokenはjwtで加工されたtokenが入る
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;

      return session;
    },
  },
});
