"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function canAccessProject(userId: string, projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { id: true }, take: 1 },
    },
  });
  if (!project) return false;
  if (project.ownerId === userId) return true;
  return project.members.length > 0;
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
        return { success: false, error: "Sprint bulunamadı veya bu projeye ait değil." };
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
