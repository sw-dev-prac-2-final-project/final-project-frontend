import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      role?: string;
      id?: string;
    };
    accessToken?: string;
    userId?: string;
  }

  interface User {
    role?: string;
    id?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accessToken?: string;
    userId?: string;
  }
}
