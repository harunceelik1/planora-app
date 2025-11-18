import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
/**
 * @route GET /api/project
 * @desc Giriş yapan kullanıcının üye olduğu tüm projeleri getirir.
 */
export async function GET() {
  try {

    const session = await getServerSession(authOptions);
    if(!session || !session.user ||!session.user.id) {
      return NextResponse.json(
        {error: "Lütfen Giriş Yapınç."},
        {status: 401}
      )
    }
    const userId= session.user.id;
    const projects = await db.project.findMany({
      where: {
        ownerId: {
            equals: userId,
        },
      },
      include: {
        owner: {
          select: { name: true, image: true, email: true },
        },
        _count: {
          select: { members: true, issues: true },
        },
      },
      orderBy: {
        createdAt: "desc",
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
 
  if(!session || !session.user || !session.user.id) {
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
    // Yorum satırlarını kaldırın ve 'db' kullanın.
    const newProject = await db.project.create({
      data: {
        projectName: name, 
        projectKey: projectKey,
        ownerId: sessionUserId, 
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
    if (error?.code === 'P2002' && error?.meta?.target?.includes('projectKey')) {
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