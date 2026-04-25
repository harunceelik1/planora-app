import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

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
          owner: { select: { id: true, name: true, image: true, email: true } },
          members: {
            select: { id: true, role: true, user: { select: { id: true, name: true, image: true } } },
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error || "Projeler getirilemedi.");
    console.error("Projeler getirilirken hata:", message);
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
    const raw = await request.json();
    const parsed = await import("@/lib/validation").then((m) => m.parseSafe(m.createProjectSchema, raw));
    if (!parsed.ok) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error }, { status: 400 });
    }
    const { name, projectKey } = parsed.data;

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
  } catch (error: unknown) {
    // Prisma hata objesi olabilir — tip güvenli şekilde kontrol ediyoruz
    const maybePrisma = error as { code?: string; meta?: { target?: string[] } };
    if (
      maybePrisma?.code === "P2002" &&
      Array.isArray(maybePrisma.meta?.target) &&
      maybePrisma.meta.target.includes("projectKey")
    ) {
      return NextResponse.json(
        { error: "Bu proje anahtarı zaten kullanılıyor." },
        { status: 409 },
      );
    }

    const message = error instanceof Error ? error.message : String(error || "Proje oluşturulurken bir hata oluştu.");
    console.error("Proje oluşturma hatası:", message);
    return NextResponse.json(
      { error: "Proje oluşturulurken bir hata oluştu." },
      { status: 500 },
    );
  }
}
