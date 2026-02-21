"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateIssueAssignee(
  issueId: string,
  assigneeId: string,
  projectId: string,
) {
  try {
    await db.issue.update({
      where: { id: issueId },
      data: {
        assigneeId: assigneeId === "" ? null : assigneeId,
      },
    });

    // 🔥 BALYOZ: "/" diyerek tüm projeyi ve tüm cache'leri sıfırlıyoruz.
    // Bu sayede hangi URL'de olursan ol veri güncellenmek ZORUNDA kalacak.
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    return { error: "Atama yapılamadı." };
  }
}

// 1. Görevi (Description, DueDate, Status) Güncelleme
export async function updateIssueData(
  issueId: string,
  data: {
    description?: string;
    dueDate?: string | null; // 🚀 Date yerine string alıyoruz
    status?: string;
    priority?: string;
    storyPoints?: number;
  },
) {
  try {
    // Prisma için veriyi hazırlayalım
    const updatePayload: any = { ...data };

    // Eğer dueDate geldiyse onu Prisma'nın anlayacağı Date formatına çevir
    if (data.dueDate !== undefined) {
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: updatePayload,
    });

    revalidatePath("/");
    return { success: true, data: updatedIssue };
  } catch (error: any) {
    // 🚀 BİZE GERÇEK HATAYI SÖYLEMESİ İÇİN BURAYI DEĞİŞTİRDİK:
    console.error("GÖREV GÜNCELLEME HATASI DETAYI:", error.message || error);
    return { success: false, error: error.message || "Görev güncellenemedi." };
  }
}
export async function createComment(
  issueId: string,
  content: string,
  userId: string,
) {
  try {
    const comment = await db.comment.create({
      data: {
        content: content,
        issueId: issueId,
        userId: userId,
      },
      // 🚀 Yorumu kaydedince, yapan kullanıcının bilgilerini de bize geri ver
      include: {
        user: true,
      },
    });

    revalidatePath("/", "layout"); // Tüm projeyi tazele

    return { success: true, data: comment };
  } catch (error) {
    console.error("Yorum eklenirken hata:", error);
    return { success: false, error: "Yorum eklenemedi." };
  }
}
