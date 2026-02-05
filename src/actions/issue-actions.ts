"use server"; // 👈 Bu satır çok önemli, bunu sunucu fonksiyonu yapar.

import { db } from "@/lib/prisma"; // Prisma ayarın nerede ise oradan çek
import { revalidatePath } from "next/cache";

export async function updateIssueAssignee(issueId: string, assigneeId: string) {
  try {
    // Veritabanı güncelleme
    await db.issue.update({
      where: { id: issueId },
      data: {
        assigneeId: assigneeId === "" ? null : assigneeId,
      },
    });

    // Sayfayı yenile ki kullanıcı değişikliği görsün
    revalidatePath("/main/projects"); // Veya ilgili sayfanın yolu neyse

    return { success: true };
  } catch (error) {
    console.error("Hata:", error);
    return { error: "Atama yapılamadı." };
  }
}
