"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

export async function createIssue(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { error: "Yetkisiz işlem" };
  }

  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const sprintId = formData.get("sprintId") as string | null; // Opsiyonel

  if (!title || !projectId) {
    return { error: "Başlık ve Proje ID gereklidir." };
  }

  try {
    // 1. Bu projedeki son issue numarasını bul (örn: PLAN-12 ise 12'yi bul)
    const lastIssue = await db.issue.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
    });

    const newNumber = (lastIssue?.number || 0) + 1;

    // 2. Projedeki en son sırayı (order) bul (Listenin en altına eklemek için)
    const lastOrderIssue = await db.issue.findFirst({
      where: { projectId, sprintId: sprintId || null }, // Aynı listedeki son eleman
      orderBy: { order: "desc" },
    });

    const newOrder = (lastOrderIssue?.order || 0) + 1;

    // 3. Kullanıcıyı bul (Reporter olarak eklemek için)
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
        status: "TODO",
        priority: "MEDIUM",
        sprintId: sprintId || null, // Doluysa sprinte, boşsa backlog'a
        reporterId: user!.id,
      },
    });

    // 5. Cache temizle (Sayfa yenilensin)
    revalidatePath(`/main/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("Issue create error:", error);
    return { error: "Görev oluşturulurken hata oluştu." };
  }
}
