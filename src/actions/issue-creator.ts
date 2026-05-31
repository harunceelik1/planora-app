"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";

function normalizeLabels(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") return [];

  const seen = new Set<string>();

  return rawValue
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean)
    .filter((label) => {
      const key = label.toLocaleLowerCase("tr-TR");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function createIssue(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { error: "Yetkisiz işlem" };
  }

  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const sprintId = formData.get("sprintId") as string | null;
  const labels = normalizeLabels(formData.get("labels"));

  if (!title || !projectId) {
    return { error: "Başlık ve Proje ID gereklidir." };
  }

  try {
    // 1. Bu projedeki son issue numarasını bul
    const lastIssue = await db.issue.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
    });

    const newNumber = (lastIssue?.number || 0) + 1;

    // 2. Projedeki en son sırayı (order) bul
    const lastOrderIssue = await db.issue.findFirst({
      where: { projectId, sprintId: sprintId || null },
      orderBy: { order: "desc" },
    });

    const newOrder = (lastOrderIssue?.order || 0) + 1;

    // 3. Kullanıcıyı bul
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    // 4. Görevi oluştur
    await db.issue.create({
      data: {
        title,
        projectId,
        number: newNumber,
        order: newOrder,
        labels,
        status: "TODO",
        priority: "MEDIUM",
        sprintId: sprintId || null,
        reporterId: user!.id,
      },
    });

    // 🚀 5. PROJEYİ DÜRT (TOUCH): Yeni görev eklendiği için projenin tarihini güncelle!
    await db.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    // 6. Cache temizle (Sayfa yenilensin)
    revalidatePath(`/main/projects/${projectId}`);

    // Ana sayfa cache'ini de temizlemek garanti olur:
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Issue create error:", error);
    return { error: "Görev oluşturulurken hata oluştu." };
  }
}
