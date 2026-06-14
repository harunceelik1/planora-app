import type { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      hasPassword: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    hasPassword: boolean;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            emailVerified: true,
          },
        });

        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        if (!user.emailVerified) {
          throw new Error("Lütfen önce e-posta adresinizi doğrulayın.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }

      if (!token.id) {
        throw new Error("User not found in database.");
      }

      try {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, password: true, name: true, email: true, image: true },
        });

        if (!dbUser) {
          throw new Error("User not found in database.");
        }

        token.name = dbUser.name;
        token.email = dbUser.email;
        token.image = dbUser.image;
        token.hasPassword = !!dbUser.password;
      } catch (error) {
        console.error("JWT oturum kontrolü veritabanı hatası:", error);
        throw new Error("User not found in database.");
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.hasPassword = token.hasPassword as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? "/" : `${baseUrl}/`;
    },
  },
};
