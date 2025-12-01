import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    let users;

    // Query kontrolü: null değilse VE boşlukları silince uzunluğu 0'dan büyükse
    if (query && query.trim().length > 0) {
      const cleanQuery = query.trim();
      console.log("✅ Arama Modu Aktif. Aranan kelime:", cleanQuery);

      users = await db.user.findMany({
        where: {
          OR: [
            // mode: 'insensitive' -> Büyük/küçük harf fark etmez
            { name: { contains: cleanQuery, mode: "insensitive" } },
            { email: { contains: cleanQuery, mode: "insensitive" } },
          ],
          NOT: {
            // İsteğe bağlı: Belirli kullanıcıları hariç tutmak isterseniz burada yapabilirsiniz
            id: currentUserId, // Örneğin, mevcut kullanıcıyı hariç tut
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

      console.log(`📊 Arama Sonucu: ${users.length} kişi bulundu.`);
      // Kimleri bulduğunu da yazdıralım (sorunu anlamak için)
      users.forEach((u) =>
        console.log(`   -> Bulunan: ${u.name} (${u.email})`)
      );
    } else {
      console.log(
        "⚠️ Arama kelimesi yok veya boş. Varsayılan liste (Son 5 kişi) getiriliyor."
      );

      // Arama yoksa SADECE 5 kişi getir, Hepsini değil.
      users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
        orderBy: { id: "desc" }, // En son eklenenleri getir
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
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name,Email and password are required" },
        { status: 400 }
      );
    }
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
        image: "",
        emailVerified: null,
      } as Prisma.UserUncheckedCreateInput,
    });

    return NextResponse.json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
