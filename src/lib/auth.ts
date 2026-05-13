import { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";
import { validateEnv } from "@/lib/env";

validateEnv();

const prisma = getPrisma();

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    }),
  });

  if (!response.ok) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const data = await response.json();

  return {
    ...token,
    accessToken: data.access_token,
    accessTokenExpires: Date.now() + data.expires_in * 1000,
    refreshToken: data.refresh_token ?? token.refreshToken,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/photoslibrary.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
      // Google verifies the email before issuing the OAuth token, and Google
      // is our only auth provider, so linking by email is safe. Without this,
      // any orphan User row (e.g. created by a previous buggy signIn callback)
      // causes NextAuth to throw AccountNotLinkedError on first OAuth login.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.sub;
      }
      if (token.error) {
        (session as unknown as Record<string, unknown>).error = token.error;
      }
      return session;
    },
    async jwt({ token, account, user }) {
      // On initial sign-in (account is set), store tokens and expiry.
      // Google returns expires_at as a unix-seconds timestamp; if it's missing
      // (rare, but possible), default to one hour from now so we don't end up
      // with accessTokenExpires=0 and try to refresh on every single request.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 60 * 60 * 1000;
      }
      if (user) {
        token.sub = user.id;
      }

      const expiresAt = (token.accessTokenExpires as number | undefined) ?? 0;
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (Date.now() + FIVE_MINUTES < expiresAt) {
        return token;
      }

      if (token.refreshToken) {
        try {
          return await refreshAccessToken(token);
        } catch {
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
