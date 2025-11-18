// // auth.config.ts
// import {  NextAuthConfig } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { db } from "@/lib/prisma"; // Prisma client yolunuz

// export default {
//   providers: [
//     Credentials({
//       // useAuthForm'daki 'signIn("credentials", ...)' bu bölümü tetikler
//       async authorize(credentials) {
//         if (!credentials.email || !credentials.password) {
//           return null;
//         }

//         const user = await db.user.findUnique({
//           where: { email: credentials.email as string }
//         });

//         if (!user || !user.password) {
//           return null; // Kullanıcı bulunamadı
//         }

//         // API/user rotanızda hash'lediğiniz şifreyi burada kontrol ediyoruz
//         const isValid = await bcrypt.compare(
//           credentials.password as string, 
//           user.password
//         );

//         if (isValid) {
//           return user; // Başarılı, kullanıcıyı döndür
//         }
        
//         return null; // Şifre yanlış
//       },
//     }),
//     // Buraya Google, GitHub vb. ekleyebilirsiniz
//   ],
// } satisfies NextAuthConfig;