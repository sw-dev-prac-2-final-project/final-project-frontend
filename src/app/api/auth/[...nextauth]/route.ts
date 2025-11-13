"use server";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .trim()
  .replace(/\/$/, "");

if (!apiBaseUrl) {
  console.warn(
    "[auth] NEXT_PUBLIC_API_BASE_URL is not defined. Authentication requests will fail."
  );
}

type LoginResponse = {
  success: boolean;
  _id: string;
  name: string;
  email: string;
  token: string;
  msg?: string;
};

type ProfileResponse = {
  success: boolean;
  data?: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "StockMe Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        if (!apiBaseUrl) {
          throw new Error("API base URL is not configured.");
        }

        const loginResponse = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          cache: "no-store",
        });

        const loginJson = (await loginResponse
          .json()
          .catch(() => null)) as LoginResponse | null;

        if (!loginResponse.ok || !loginJson?.success || !loginJson.token) {
          const errorMessage =
            loginJson?.msg ?? "Unable to sign in with those credentials.";
          throw new Error(errorMessage);
        }

        let role: string | undefined;

        try {
          const profileResponse = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${loginJson.token}`,
            },
            cache: "no-store",
          });

          if (profileResponse.ok) {
            const profileJson = (await profileResponse
              .json()
              .catch(() => null)) as ProfileResponse | null;
            role = profileJson?.data?.role ?? undefined;
          }
        } catch (error) {
          console.error("[auth] Failed to fetch profile information.", error);
        }

        return {
          id: loginJson._id,
          name: loginJson.name,
          email: loginJson.email,
          role: role ?? "staff",
          accessToken: loginJson.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? "staff";
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      token.role = token.role ?? "staff";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string | undefined) ?? "staff";
        session.user.id = token.userId as string | undefined;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.userId = token.userId as string | undefined;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.accessToken || !apiBaseUrl) {
        return;
      }

      try {
        await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
      } catch (error) {
        console.error("[auth] Failed to call logout endpoint.", error);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
