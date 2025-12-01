import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
/**
 * @route GET /api/project
 * @desc Giriş yapan kullanıcının üye olduğu tüm projeleri getirir.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Lütfen Giriş Yapın." },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    // --- SENARYO 1: TEK BİR PROJE İSTENİYORSA (Dialog Burayı Kullanıyor) ---
    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
          owner: true,
          members: {
            include: {
              user: true, // Üyenin ismini ve resmini almak için
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Proje bulunamadı" },
          { status: 404 }
        );
      }

      return NextResponse.json(project);
    }

    // --- SENARYO 2: TÜM PROJELER LİSTELENİYORSA ---
    const projects = await db.project.findMany({
      where: {
        // Hem sahibi olduklarını HEM DE üyesi olduklarını getir
        OR: [
          { ownerId: userId }, // Sahibi olduklarım
          {
            members: {
              some: {
                userId: userId, // Üyesi olduklarım
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: { name: true, image: true, email: true },
        },
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: { members: true, issues: true },
        },
      },
      orderBy: {
        updatedAt: "desc", // Son işlem yapılana göre sıralamak daha iyidir
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Projeler getirilirken hata:", error);
    return NextResponse.json(
      { error: "Projeler getirilemedi." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 1. Session yerine test için sabit ID
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "Yetkisiz erişim. Lütfen giriş yapın." },
      { status: 401 } // Unauthorized
    );
  }

  const sessionUserId = session.user.id;
  console.log("Oturum açan kullanıcı ID'si:", session.user.name, sessionUserId);

  try {
    // 2. Gelen isteğin gövdesini (body) JSON olarak oku
    const body = await request.json();
    const { name, projectKey } = body;

    // 3. Doğrulama
    if (!name || !projectKey) {
      return NextResponse.json(
        { error: "Proje adı ve anahtarı gereklidir." },
        { status: 400 } // Bad Request
      );
    }

    // 4. VERİTABANINA KAYDET
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

    // 5. BAŞARILI YANITI DÖNDÜR
    // Bu satır, SADECE 'await db.project.create' başarılı olursa çalışır.
    return NextResponse.json(
      { message: "Proje başarıyla oluşturuldu.", project: newProject },
      { status: 201 } // Created
    );
  } catch (error: any) {
    // 6. HATA YÖNETİMİ
    // 'projectKey' unique olduğu için çakışma hatası
    if (
      error?.code === "P2002" &&
      error?.meta?.target?.includes("projectKey")
    ) {
      return NextResponse.json(
        { error: "Bu proje anahtarı zaten kullanılıyor." },
        { status: 409 } // 409 Conflict (Çakışma)
      );
    }

    // Diğer tüm hatalar
    console.error("Proje oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Proje oluşturulurken bir hata oluştu." },
      { status: 500 } // Internal Server Error
    );
  }
}
