// // auth.ts
// import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { db } from "@/lib/prisma";
// import authConfig from "./auth.config"; // 1. adımdaki dosyayı import et

// export const {
//   handlers: { GET, POST },
//   auth, // <-- API rotanızın aradığı 'auth' fonksiyonu bu!
//   signIn,
//   signOut,
// } = NextAuth({
//   adapter: PrismaAdapter(db),
//   session: { strategy: "jwt" }, // 'jwt' veya 'database' statejisini seçebilirsiniz
//   ...authConfig, // Provider'ları (Credentials) buradan al
// });