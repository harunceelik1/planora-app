import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { parseSafe, registerSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    let users;

    // Query kontrolü
    if (query && query.trim().length > 0) {
      const cleanQuery = query.trim();
      users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: "insensitive" } },
            { email: { contains: cleanQuery, mode: "insensitive" } },
          ],
          NOT: {
            id: currentUserId,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
        take: 5,
      });
    } else {
      users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
        orderBy: { id: "desc" },
        take: 5,
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  console.log("🚀 1. REGISTER API BAŞLADI"); // LOG 1

  try {
    const raw = await req.json();
    const parsed = parseSafe(registerSchema, raw);
    if (!parsed.ok) return NextResponse.json({ error: "Invalid body", details: parsed.error }, { status: 400 });
    const { name, email, password } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("❌ Kullanıcı zaten var:", email);
      return NextResponse.json(
        { error: "Bu email zaten kayıtlı" },
        { status: 409 }
      );
    }

    // Kullanıcı Oluşturma
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🛠️ 2. Kullanıcı veritabanına yazılıyor...");

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        image: "",
        emailVerified: null,
      } as Prisma.UserUncheckedCreateInput,
    });
    console.log("✅ 3. Kullanıcı oluşturuldu ID:", newUser.id);

    // Token Oluşturma
    console.log("🛠️ 4. Token üretiliyor...");
    const verificationToken = await generateVerificationToken(email);
    console.log("✅ 5. Token hazır:", verificationToken.token);

    // Mail Gönderme
    console.log("📧 6. Resend'e mail emri veriliyor...");
    const mailResult = await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    // Mail sonucunu kontrol et
    if (mailResult.error) {
      console.error("❌ 7. MAIL GİTMEDİ HATASI:", mailResult.error);
    } else {
      console.log("✅ 7. MAIL BAŞARIYLA GÖNDERİLDİ:", mailResult.data);
    }

    return NextResponse.json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      message: "Kayıt başarılı, doğrulama maili gönderildi.", // Frontend bunu yakalamalı
    });
  } catch (error) {
    console.error("💥 8. PATLADI (EN BÜYÜK HATA):", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}
