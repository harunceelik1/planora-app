"use server";

import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createIssueActivity } from "@/actions/issue-activity";

export async function updateIssueAssignee(
  issueId: string,
  assigneeId: string,
  projectId: string,
) {
  try {
    // ✅ Yetki kontrolü: Kullanıcı ve session kontrol
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Yetkisiz işlem" };
    }

    // ✅ Kullanıcı bu projeye üye mi ve hangi rolde kontrol et
    const member = await db.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "Bu projeye erişim yok" };
    }

    // ✅ Sadece ADMIN veya OWNER görevlere kişi atayabilir
    if (member.role === "MEMBER") {
      return { error: "Yalnızca yöneticiler görevlere kişi atayabilir" };
    }

    // önceki atamayı al
    const before = await db.issue.findUnique({
      where: { id: issueId },
      select: { assigneeId: true, projectId: true },
    });

    if (!before) return { error: "Görev bulunamadı" };

    const updated = await db.issue.update({
      where: { id: issueId },
      data: {
        assigneeId: assigneeId === "" ? null : assigneeId,
      },
    });

    // activity kaydı
    try {
      await createIssueActivity({
        issueId,
        projectId: before.projectId,
        userId: session.user.id,
        type: "ASSIGNEE_CHANGED",
        data: { from: before.assigneeId ?? null, to: assigneeId === "" ? null : assigneeId },
      });
    } catch (err) {
      console.error("Activity create failed:", err);
    }

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
    labels?: string[];
  },
) {
  try {
    // ✅ Yetki kontrolü: Kullanıcı ve session kontrol
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Yetkisiz işlem" };
    }

    // ✅ İssue ve proje bilgisini al
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      select: {
        projectId: true,
        assigneeId: true,
        status: true,
        dueDate: true,
        sprintId: true,
        priority: true,
        labels: true,
        title: true,
        description: true,
      },
    });

    if (!issue) {
      return { error: "Görev bulunamadı" };
    }

    // ✅ Kullanıcı bu projeye üye mi ve hangi rolde kontrol et
    const member = await db.projectMember.findFirst({
      where: {
        projectId: issue.projectId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "Bu projeye erişim yok" };
    }

    // ✅ Yetki kuralı: ADMIN/OWNER her şeyi güncelleyebilir, MEMBER sadece kendi atandığı görevleri
    if (member.role === "MEMBER" && issue.assigneeId !== session.user.id) {
      return { error: "Sadece size atanan görevleri güncelleyebilirsiniz" };
    }

    const updatePayload: Prisma.IssueUpdateInput = { ...data } as Prisma.IssueUpdateInput;

    if (data.dueDate !== undefined) {
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: updatePayload,
    });

    // activity: kaydet (tek bir güncelleme kaydı)
    try {
      await createIssueActivity({
        issueId,
        projectId: issue.projectId,
        userId: session.user.id,
        type: "ISSUE_UPDATED",
        data: {
          before: {
            assigneeId: issue.assigneeId ?? null,
            status: issue.status,
            dueDate: issue.dueDate ? issue.dueDate.toISOString() : null,
            sprintId: issue.sprintId ?? null,
            priority: issue.priority,
            labels: issue.labels,
            title: issue.title,
            description: issue.description,
          },
          after: updatedIssue,
          fields: Object.keys(data),
        },
      });
    } catch (err) {
      console.error("Activity create failed:", err);
    }

    // 🚀 PROJEYİ "DÜRT" (TOUCH): updatedIssue içinden projectId'yi alıyoruz
    await db.project.update({
      where: { id: updatedIssue.projectId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/");
    return { success: true, data: updatedIssue };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("GÖREV GÜNCELLEME HATASI DETAYI:", message);
    return { success: false, error: message || "Görev güncellenemedi." };
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

    // activity: comment added
    try {
      await createIssueActivity({
        issueId,
        projectId: comment.issue.projectId,
        userId: userId,
        type: "COMMENT_ADDED",
        data: { commentId: comment.id, content: content },
      });
    } catch (err) {
      console.error("Activity create failed:", err);
    }

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

    // Note: activity for deletion is not created here because deletion cascades would remove issue-bound activities.
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
