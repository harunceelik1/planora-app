"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateIssueAssignee(
  issueId: string,
  assigneeId: string,
  projectId: string, // ZatenprojectId parametre olarak geliyor, işimiz kolay!
) {
  try {
    await db.issue.update({
      where: { id: issueId },
      data: {
        assigneeId: assigneeId === "" ? null : assigneeId,
      },
    });

    // 🚀 PROJEYİ "DÜRT" (TOUCH): Projenin updatedAt tarihini güncelle
    await db.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Atama yapılamadı." };
  }
}

export async function updateIssueData(
  issueId: string,
  data: {
    description?: string;
    dueDate?: string | null;
    status?: string;
    priority?: string;
    storyPoints?: number;
  },
) {
  try {
    const updatePayload: any = { ...data };

    if (data.dueDate !== undefined) {
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: updatePayload,
    });

    // 🚀 PROJEYİ "DÜRT" (TOUCH): updatedIssue içinden projectId'yi alıyoruz
    await db.project.update({
      where: { id: updatedIssue.projectId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/");
    return { success: true, data: updatedIssue };
  } catch (error: any) {
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
      include: {
        user: true,
        issue: true, // 🚀 Issue bilgisini de dahil et ki projectId'ye ulaşalım
      },
    });

    // 🚀 PROJEYİ "DÜRT" (TOUCH)
    await db.project.update({
      where: { id: comment.issue.projectId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/", "layout");
    return { success: true, data: comment };
  } catch (error) {
    console.error("Yorum eklenirken hata:", error);
    return { success: false, error: "Yorum eklenemedi." };
  }
}

export async function deleteIssue(issueId: string) {
  try {
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      select: { projectId: true },
    });

    if (!issue) {
      return { success: false, error: "Gorev bulunamadi." };
    }

    await db.issue.delete({
      where: { id: issueId },
    });

    await db.project.update({
      where: { id: issue.projectId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gorev silinemedi.";
    console.error("GOREV SILME HATASI DETAYI:", message);
    return { success: false, error: message };
  }
}
