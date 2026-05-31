"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function canAccessProject(userId: string, projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { role: true }, take: 1 },
    },
  });
  if (!project) return false;
  if (project.ownerId === userId) return true;
  return project.members[0]?.role === "ADMIN";
}

// 1. Yeni Boş Sprint Oluştur
export async function createSprint(projectId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem." };
  }

  try {
    if (!(await canAccessProject(userId, projectId))) {
      return { success: false, error: "Bu proje için yetkiniz yok." };
    }

    const existingSprintsCount = await db.sprint.count({
      where: { projectId },
    });

    const newSprint = await db.sprint.create({
      data: {
        name: `Sprint ${existingSprintsCount + 1}`,
        projectId,
        status: "PENDING",
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: newSprint };
  } catch (error) {
    console.error("Sprint oluşturma hatası:", error);
    return { success: false, error: "Sprint oluşturulamadı." };
  }
}

// 2. Görevi Sprint'e veya Backlog'a Taşıma (Sürükle-Bırak sonucu çalışacak)
export async function moveIssueToSprint(
  issueId: string,
  targetSprintId: string | null,
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem." };
  }

  try {
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      select: { projectId: true },
    });
    if (!issue) {
      return { success: false, error: "Görev bulunamadı." };
    }
    if (!(await canAccessProject(userId, issue.projectId))) {
      return { success: false, error: "Bu proje için yetkiniz yok." };
    }

    if (targetSprintId) {
      const sprint = await db.sprint.findFirst({
        where: { id: targetSprintId, projectId: issue.projectId },
      });
      if (!sprint) {
        return {
          success: false,
          error: "Sprint bulunamadı veya bu projeye ait değil.",
        };
      }
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: { sprintId: targetSprintId },
    });

    revalidatePath("/", "layout");
    return { success: true, data: updatedIssue };
  } catch (error) {
    console.error("Görev taşıma hatası:", error);
    return { success: false, error: "Görev taşınamadı." };
  }
}

// 3. Sprint'i Başlatma ve Tarih Ayarlarını Kaydetme
export async function startSprint(
  sprintId: string,
  sprintData: {
    name: string;
    goal?: string | null;
    startDate: string;
    endDate: string;
  },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem." };
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      select: { projectId: true },
    });
    if (!sprint) {
      return { success: false, error: "Sprint bulunamadı." };
    }
    if (!(await canAccessProject(userId, sprint.projectId))) {
      return { success: false, error: "Bu proje için yetkiniz yok." };
    }

    const start = new Date(sprintData.startDate);
    const end = new Date(sprintData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: "Geçerli bir tarih girin." };
    }
    if (start > end) {
      return {
        success: false,
        error: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
      };
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: {
        name: sprintData.name,
        goal: sprintData.goal || null,
        startDate: start,
        endDate: end,
        status: "ACTIVE",
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: updatedSprint };
  } catch (error) {
    console.error("Sprint başlatma hatası:", error);
    return { success: false, error: "Sprint başlatılamadı." };
  }
}

export async function updateSprint(
  sprintId: string,
  sprintData: {
    name: string;
    goal?: string | null;
    startDate: string;
    endDate: string;
  },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem." };
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      select: { projectId: true },
    });
    if (!sprint) {
      return { success: false, error: "Sprint bulunamadı." };
    }
    if (!(await canAccessProject(userId, sprint.projectId))) {
      return { success: false, error: "Bu proje için yetkiniz yok." };
    }

    const start = new Date(sprintData.startDate);
    const end = new Date(sprintData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: "Geçerli bir tarih girin." };
    }
    if (start > end) {
      return {
        success: false,
        error: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
      };
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: {
        name: sprintData.name,
        goal: sprintData.goal || null,
        startDate: start,
        endDate: end,
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: updatedSprint };
  } catch (error) {
    console.error("Sprint güncelleme hatası:", error);
    return { success: false, error: "Sprint güncellenemedi." };
  }
}

export async function completeSprint(sprintId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem." };
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      select: { projectId: true, endDate: true },
    });
    if (!sprint) {
      return { success: false, error: "Sprint bulunamadı." };
    }
    if (!(await canAccessProject(userId, sprint.projectId))) {
      return { success: false, error: "Bu proje için yetkiniz yok." };
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: {
        status: "COMPLETED",
        endDate: sprint.endDate || new Date(),
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: updatedSprint };
  } catch (error) {
    console.error("Sprint tamamlanırken hata oluştu:", error);
    return { success: false, error: "Sprint tamamlanamadı." };
  }
}

// 4. Sprint silme: sprintteki görevleri backloga taşı ve sprinti sil
export async function deleteSprint(sprintId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Yetkisiz işlem." };
  }

  try {
    const sprint = await db.sprint.findUnique({ where: { id: sprintId }, select: { projectId: true } });
    if (!sprint) {
      return { success: false, error: "Sprint bulunamadı." };
    }
    if (!(await canAccessProject(userId, sprint.projectId))) {
      return { success: false, error: "Bu proje için yetkiniz yok." };
    }

    // Taşı: sprint'e bağlı görevleri backloga gönder
    await db.issue.updateMany({ where: { sprintId }, data: { sprintId: null } });

    // Sprinti sil
    await db.sprint.delete({ where: { id: sprintId } });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Sprint silme hatası:", error);
    return { success: false, error: "Sprint silinemedi." };
  }
}
