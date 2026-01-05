import crypto from "crypto";
import { db } from "./prisma";

export const generateVerificationToken = async (email: string) => {
  // 1. Rastgele 6 haneli sayı üret (100000 - 999999 arası)
  const token = crypto.randomInt(100_000, 1_000_000).toString();

  // 2. Süre belirle (Şu an + 15 dakika)
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  // 3. Bu email için önceden kalan kod varsa temizle
  const existingToken = await db.verificationToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // 4. Yeni kodu veritabanına kaydet
  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};
