// app/api/auth/new-verification/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Kod eksik!" }, { status: 400 });
    }

    // 1. Token veritabanında var mı?
    const existingToken = await db.verificationToken.findFirst({
      where: { token: token }, // Eşleşen kodu bul
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: "Geçersiz veya hatalı kod." },
        { status: 404 }
      );
    }

    // 2. Süresi dolmuş mu?
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return NextResponse.json(
        { error: "Kodun süresi dolmuş." },
        { status: 400 }
      );
    }

    // 3. Kullanıcıyı bul
    const existingUser = await db.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // 4. Kullanıcıyı onayla (Verification Tarihini Güncelle)
    await db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(), // Şu anki tarihi bas
        email: existingToken.email, // (Opsiyonel: Email değişikliği için güvenlik)
      },
    });

    // 5. Tokenı sil (Bir daha kullanılmasın)
    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ success: "E-posta başarıyla doğrulandı!" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
