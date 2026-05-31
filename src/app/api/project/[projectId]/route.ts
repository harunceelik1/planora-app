import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const baseInclude = {
    sprints: {
      orderBy: { createdAt: "asc" as const },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    },
    owner: { select: { id: true, name: true, image: true } },
    members: {
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            location: true,
            jobTitle: true,
          },
        },
      },
    },
  };

  let project;

  try {
    project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        ...baseInclude,
        issues: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            number: true,
            title: true,
            description: true,
            labels: true,
            status: true,
            priority: true,
            order: true,
            sprintId: true,
            assigneeId: true,
            createdAt: true,
            updatedAt: true,
            dueDate: true,
            storyPoints: true,
            reporterId: true,
            assignee: { select: { id: true, name: true, image: true } },
            _count: { select: { comments: true } },
          },
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isLabelsMismatch =
      message.includes("labels") ||
      message.includes("column") ||
      message.includes("Unknown arg");

    if (!isLabelsMismatch) {
      throw error;
    }

    project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        ...baseInclude,
        issues: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            number: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            order: true,
            sprintId: true,
            assigneeId: true,
            createdAt: true,
            updatedAt: true,
            dueDate: true,
            storyPoints: true,
            reporterId: true,
            assignee: { select: { id: true, name: true, image: true } },
            _count: { select: { comments: true } },
          },
        },
      },
    });

    if (project) {
      project = {
        ...project,
        issues: project.issues.map((issue) => ({
          ...issue,
          labels: [],
        })),
      };
    }
  }

  if (!project) {
    return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id as string | undefined;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const { name, ownerId, key, image, icon, color } = body;

    const existingProject = await db.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Proje yok" }, { status: 404 });
    }

    if (existingProject.ownerId !== currentUserId) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok. Sadece proje sahibi yapabilir." },
        { status: 403 },
      );
    }

    const oldOwnerId = existingProject.ownerId;

    if (ownerId && ownerId !== oldOwnerId) {
      const result = await db.$transaction([
        db.project.update({
          where: { id: projectId },
          data: {
            ownerId,
            ...(name && { projectName: name }),
            ...(key && { projectKey: key }),
            ...(image !== undefined && { image }),
            ...(icon !== undefined && { icon }),
            ...(color !== undefined && { color }),
          },
        }),
        db.projectMember.upsert({
          where: {
            userId_projectId: { userId: oldOwnerId, projectId },
          },
          create: { userId: oldOwnerId, projectId, role: "ADMIN" },
          update: { role: "ADMIN" },
        }),
        db.projectMember.upsert({
          where: {
            userId_projectId: { userId: ownerId, projectId },
          },
          create: { userId: ownerId, projectId, role: "OWNER" },
          update: { role: "OWNER" },
        }),
      ]);

      return NextResponse.json(result[0]);
    }

    const simpleUpdate = await db.project.update({
      where: { id: projectId },
      data: {
        ...(name && { projectName: name }),
        ...(key && { projectKey: key }),
        ...(image !== undefined && { image }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json(simpleUpdate);
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id as string | undefined;

  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
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
