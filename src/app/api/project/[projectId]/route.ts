import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; // Prisma client yolun
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options"; // Auth options yolun

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "asc" },
      },
      // Tüm görevler (backlog + sprint); backlog-view sprintId ile ayırır
      issues: {
        orderBy: { order: "asc" },
        include: {
          assignee: true,
          // 👇 EKSİK OLAN KISIM BURASIYDI: Yorumları ve yapan kullanıcıyı çekiyoruz
          comments: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "asc", // Yorumları eskiden yeniye sıralar
            },
          },
        },
      },
      owner: true,
      members: {
        include: { user: true },
      },
    },
  });

  if (!project)
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  return NextResponse.json(project);
}
// --- PATCH: GÜNCELLEME VE SAHİPLİK DEVRİ ---
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const currentUserId = session?.user?.id;

    if (!currentUserId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const body = await request.json();

    // Frontend'den gelen veriler
    const { name, description, ownerId, key, image, icon, color } = body;

    // 1. Mevcut projeyi kontrol et
    const existingProject = await db.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!existingProject)
      return NextResponse.json({ error: "Proje yok" }, { status: 404 });

    // 2. GÜVENLİK: Sadece şu anki sahip (Owner) değişiklik yapabilir
    if (existingProject.ownerId !== currentUserId) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok. Sadece proje sahibi yapabilir." },
        { status: 403 },
      );
    }

    const oldOwnerId = existingProject.ownerId;

    // SENARYO 2: SAHİPLİK DEVRİ (Transfer Ownership)
    // Eğer body içinde 'ownerId' geldiyse ve eski sahibinden farklıysa:
    if (ownerId && ownerId !== oldOwnerId) {
      const result = await db.$transaction([
        // ADIM 1: Proje tablosunda 'ownerId'yi değiştir
        // (Aynı zamanda isim, key, resim değiştiyse onları da güncelle)
        db.project.update({
          where: { id: projectId },
          data: {
            ownerId: ownerId, // YENİ SAHİP
            ...(name && { projectName: name }),
            ...(key && { projectKey: key }),
            ...(image !== undefined && { image }),
            ...(icon !== undefined && { icon }),
            ...(color !== undefined && { color }),
          },
        }),

        // ADIM 2: Eski sahibin (SENİN) rolünü 'ADMIN' yap
        // Böylece projeden atılmazsın, yönetici olarak kalırsın.
        db.projectMember.upsert({
          where: {
            userId_projectId: { userId: oldOwnerId, projectId: projectId },
          },
          create: { userId: oldOwnerId, projectId: projectId, role: "ADMIN" },
          update: { role: "ADMIN" },
        }),

        // ADIM 3: Yeni sahibin rolünü 'OWNER' yap
        db.projectMember.upsert({
          where: {
            userId_projectId: { userId: ownerId, projectId: projectId },
          },
          create: { userId: ownerId, projectId: projectId, role: "OWNER" },
          update: { role: "OWNER" },
        }),
      ]);

      // İşlem başarılı, güncellenmiş projeyi döndür
      return NextResponse.json(result[0]);
    }
    // NORMAL GÜNCELLEME (Sahiplik değişmiyor, sadece isim/resim vb.)

    const simpleUpdate = await db.project.update({
      where: { id: projectId },
      data: {
        ...(name && { projectName: name }),
        ...(key && { projectKey: key }),
        ...(image !== undefined && { image: image }),
        ...(icon !== undefined && { icon }), // 👈 EKLENDİ
        ...(color !== undefined && { color }), // 👈 EKLEN
      },
    });

    return NextResponse.json(simpleUpdate);
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

// --- DELETE: SİLME ---
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  const currentUserId = session?.user?.id;

  if (!currentUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Sadece Owner silebilir kontrolü eklemek iyi olur
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (project?.ownerId !== currentUserId) {
    return NextResponse.json(
      { error: "Sadece proje sahibi silebilir" },
      { status: 403 },
    );
  }

  await db.project.delete({ where: { id: projectId } });
  return NextResponse.json({ message: "Silindi" });
}
