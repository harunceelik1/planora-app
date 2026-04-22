import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Session kontrolü
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // console.log("🔍 İstek atan User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Veritabanından çekme
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        jobTitle: true,
        location: true,
        phone: true,
        birthdate: true,
        password: true, // Şifre var mı kontrolü için çekiyoruz, sonra sileceğiz
        // 👇 FAVORİLER KISMI (DÜZELTİLDİ)
        favoriteProjects: {
          orderBy: {
            createdAt: "desc", // En son eklenen favori en üstte görünür
          },
          select: {
            // İlişki tablosunun (FavoriteProject) ID'si (silmek için lazım olabilir)
            id: true,
            // Proje detaylarını çekiyoruz
            project: {
              select: {
                id: true,
                projectName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // 3. Şifreyi objeden çıkarıyoruz
    const { password, ...userWithoutPassword } = user;

    // 4. Temiz veriyi döndürüyoruz
    return NextResponse.json({
      ...userWithoutPassword,
      hasPassword: !!password,
    });
  } catch (error) {
    console.error("🔥 Profil API Hatası:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
