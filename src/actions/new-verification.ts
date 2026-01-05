"use server";

import { db } from "@/lib/prisma";

export const newVerification = async (token: string) => {
  // 1. Token var mı?
  const existingToken = await db.verificationToken.findFirst({
    where: { token },
  });

  if (!existingToken) {
    return { error: "Token bulunamadı veya geçersiz!" };
  }

  // 2. Token süresi dolmuş mu?
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return {
      error:
        "Token süresi dolmuş! Lütfen tekrar giriş yaparak yeni kod isteyin.",
    };
  }

  // 3. Bu token hangi kullanıcıya ait?
  const existingUser = await db.user.findFirst({
    where: { email: existingToken.email }, // Şemanda 'identifier' ise burayı düzelt
  });

  if (!existingUser) {
    return { error: "Email adresi bulunamadı!" };
  }

  // 4. 🔥 MUTLU SON: Kullanıcıyı güncelle
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(), // Şu anki tarihi basıyoruz
      email: existingToken.email, // (Opsiyonel) Email değişikliği durumları için güvenlik
    },
  });

  // 5. Kullanılan token'ı sil (Temizlik)
  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Email başarıyla doğrulandı! Giriş yapabilirsiniz." };
};
