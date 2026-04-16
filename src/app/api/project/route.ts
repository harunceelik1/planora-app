import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * @route GET /api/project
 * @desc Giriş yapan kullanıcının projelerini veya favorilerini getirir.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Lütfen Giriş Yapın." },
        { status: 401 },
      );
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId");
    const isFavorite = searchParams.get("favorite") === "true";

    // ---------------------------------------------------------
    // ORTAK KULLANILACAK ÜYE ÇEKME AYARI (PERFORMANS İÇİN)
    // ---------------------------------------------------------
    const membersSelectConfig = {
      take: 5, // Sadece ilk 5 üyeyi getir (Avatarlar için yeterli)
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    };

    // --- SENARYO 1: TEK BİR PROJE DETAYI ---
    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
          owner: true,
          members: {
            include: {
              user: true, // Detay sayfasında herkesi tam görebilmek için burada limit koymadık
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Proje bulunamadı" },
          { status: 404 },
        );
      }

      return NextResponse.json(project);
    }

    // --- SENARYO 2: SADECE FAVORİ PROJELER ---
    if (isFavorite) {
      const favorites = await db.favoriteProject.findMany({
        where: { userId: userId },
        include: {
          project: {
            include: {
              owner: {
                select: { name: true, image: true, email: true },
              },
              // 👇 BURASI EKSİKTİ, EKLENDİ
              members: membersSelectConfig,

              _count: {
                select: { members: true, issues: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedFavorites = favorites.map((fav) => fav.project);

      return NextResponse.json(formattedFavorites);
    }

    // --- SENARYO 3: TÜM PROJELER (LİSTE) ---
    const projects = await db.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId: userId },
            },
          },
        ],
      },
      include: {
        owner: {
          select: { name: true, image: true, email: true },
        },
        // 👇 BURASI GÜNCELLENDİ (Eskiden user: true diyip her şeyi çekiyordu)
        members: membersSelectConfig,
        issues: {
          select: {
            id: true,
            status: true,
            priority: true,
            dueDate: true,
            storyPoints: true,
          },
        },
        _count: {
          select: { members: true, issues: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Projeler getirilirken hata:", error);
    return NextResponse.json(
      { error: "Projeler getirilemedi." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "Yetkisiz erişim. Lütfen giriş yapın." },
      { status: 401 },
    );
  }

  const sessionUserId = session.user.id;

  try {
    const body = await request.json();
    const { name, projectKey } = body;

    if (!name || !projectKey) {
      return NextResponse.json(
        { error: "Proje adı ve anahtarı gereklidir." },
        { status: 400 },
      );
    }

    const newProject = await db.project.create({
      data: {
        projectName: name,
        projectKey: projectKey,
        ownerId: sessionUserId,
        members: {
          create: {
            userId: sessionUserId,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Proje başarıyla oluşturuldu.", project: newProject },
      { status: 201 },
    );
  } catch (error: any) {
    if (
      error?.code === "P2002" &&
      error?.meta?.target?.includes("projectKey")
    ) {
      return NextResponse.json(
        { error: "Bu proje anahtarı zaten kullanılıyor." },
        { status: 409 },
      );
    }

    console.error("Proje oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Proje oluşturulurken bir hata oluştu." },
      { status: 500 },
    );
  }
}
