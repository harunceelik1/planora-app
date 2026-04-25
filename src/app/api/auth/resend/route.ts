// app/api/auth/resend/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = await import("@/lib/validation").then((m) => m.parseSafe(m.resendSchema, raw));
    if (!parsed.ok) return NextResponse.json({ error: "Invalid body", details: parsed.error }, { status: 400 });
    const { email } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Bu hesap zaten doğrulanmış." },
        { status: 400 }
      );
    }

    // Yeni token üret ve mail at
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return NextResponse.json({ success: "Kod tekrar gönderildi." });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
