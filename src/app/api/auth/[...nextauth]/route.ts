import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma"; // 'db' importunuz burada olmalı
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";

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
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" }, // login sayfan burası

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
        )
          return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
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

        const ok = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
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
      // 1. İlk Giriş (Sign-in)
      // Kullanıcı yeni giriş yapıyorsa, 'user.id'yi token'a ekle.
      if (user) {
        token.id = user.id;
      }
      if (token.id) {
        // 3. ✅ VERİTABANI KONTROLÜ
        // Token'daki ID'ye sahip kullanıcı veritabanında hâlâ var mı?
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, password: true }, // Sadece varlığını kontrol etmek yeterli
          });

          // 4. ❗️ KULLANICI SİLİNMİŞSE (Hayalet Oturum)
          if (!dbUser) {
            // Kullanıcı DB'de bulunamadı. Bu token artık geçersiz.
            // 'null' döndürmek, Next-Auth'a bu çerezi yok etmesini söyler.
            throw new Error("User not found in database.");
          }
          token.hasPassword = !!dbUser.password;
        } catch (error) {
          // Veritabanı hatası olursa da güvenliği sağlamak için oturumu sonlandır
          console.error("JWT oturum kontrolü veritabanı hatası:", error);
          throw new Error("User not found in database.");
        }
      } else {
        // Token'da 'id' yoksa (anormal bir durum), bu oturuma güvenme
        throw new Error("User not found in database.");
      }

      // 5. Kullanıcı bulundu ve token geçerli.
      return token;
    },
    async session({ session, token }) {
      // 'token' null değilse (yani jwt callback'i oturumu iptal etmediyse)
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.hasPassword = token.hasPassword as boolean;
      }
      return session;
    },

    /**
     * Yönlendirme callback'iniz (değişiklik yok)
     */
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? "/" : baseUrl + "/";
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
