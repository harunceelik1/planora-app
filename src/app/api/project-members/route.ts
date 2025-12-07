import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }
    const members = await db.projectMember.findMany({
      where: { projectId: projectId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Üyeleri getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Oturum Kontrolü
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    // 2. Veriyi Al (Hangi proje? Kimler eklenecek?)
    const body = await req.json();
    const { projectId, userIds } = body;

    if (!projectId || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    const result = await db.projectMember.createMany({
      data: userIds.map((userId: string) => ({
        projectId: projectId,
        userId: userId,
        role: "MEMBER", // Varsayılan rol
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: "Kullanıcılar başarıyla eklendi.",
      count: result.count,
    });
  } catch (error) {
    console.error("Üye ekleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
// --- YENİ EKLENEN KISIM: ROL GÜNCELLEME (ADMIN YAPMA/GERİ ALMA) ---
export async function PATCH(req: Request) {
  try {
    // 1. Oturum Kontrolü
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    // 2. Veriyi Al
    const body = await req.json();
    const { projectId, userId, role } = body;
    // userId: Rolü değişecek üyenin ID'si
    // role: "ADMIN" veya "MEMBER"

    if (!projectId || !userId || !role) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    // 3. GÜVENLİK: İsteği yapan kişi bu projenin SAHİBİ (Owner) mi?
    // Sadece proje sahibi başkasına rol verebilir.
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
    }

    if (project.ownerId !== currentUserId) {
      return NextResponse.json(
        { error: "Rol dağıtmak için proje sahibi olmalısınız." },
        { status: 403 }
      );
    }

    // 4. Sahip kendi rolünü bu endpointten değiştiremez (Zaten Owner)
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: "Proje sahibi rolünü buradan değiştiremez." },
        { status: 400 }
      );
    }

    // 5. Üyenin Rolünü Güncelle
    // Prisma'da composite key (projectId + userId) kullanılır
    const updatedMember = await db.projectMember.update({
      where: {
        userId_projectId: {
          projectId: projectId,
          userId: userId,
        },
      },
      data: {
        role: role, // "ADMIN" gönderirsen Yönetici olur
      },
      include: {
        user: true, // Güncellenen kullanıcı bilgisini dön (Frontend için)
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Rol güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
