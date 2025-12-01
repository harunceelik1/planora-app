import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// --- GET: PROJE DETAYI ---
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
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

// --- PATCH: GÜNCELLEME (SAHİPLİK DEVRİ DAHİL) ---
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const body = await request.json();
    const { name, description, ownerId } = body; // ownerId: Yeni Sahip Adayı

    // 1. Mevcut projeyi ve sahibini bul
    const existingProject = await db.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!existingProject)
      return NextResponse.json({ error: "Proje yok" }, { status: 404 });

    const oldOwnerId = existingProject.ownerId;

    // --- SENARYO A: SAHİPLİK DEĞİŞİYORSA (Transaction Kullan) ---
    if (ownerId && ownerId !== oldOwnerId) {
      const result = await db.$transaction([
        // 1. ADIM: Proje tablosunda sahibini değiştir
        db.project.update({
          where: { id: projectId },
          data: {
            ownerId: ownerId,
            ...(name && { projectName: name }),
            ...(description && { description: description }),
          },
        }),

        // 2. ADIM: Eski sahibin rolünü 'ADMIN' yap (Üye listesinde kalması için)
        db.projectMember.upsert({
          where: {
            userId_projectId: { userId: oldOwnerId, projectId: projectId },
          },
          create: { userId: oldOwnerId, projectId: projectId, role: "ADMIN" },
          update: { role: "ADMIN" },
        }),

        // 3. ADIM: Yeni sahibin rolünü 'OWNER' yap
        db.projectMember.update({
          where: {
            userId_projectId: { userId: ownerId, projectId: projectId },
          },
          data: { role: "OWNER" },
        }),
      ]);

      // Transaction dizisinin ilk elemanı güncellenmiş projedir
      return NextResponse.json(result[0]);
    }

    // --- SENARYO B: SADECE İSİM/AÇIKLAMA DEĞİŞİYORSA ---
    const simpleUpdate = await db.project.update({
      where: { id: projectId },
      data: {
        ...(name && { projectName: name }),
        ...(description && { description: description }),
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
  // ... (Bu kısım aynı kalabilir) ...
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  await db.project.delete({ where: { id: projectId } });
  return NextResponse.json({ message: "Silindi" });
}
