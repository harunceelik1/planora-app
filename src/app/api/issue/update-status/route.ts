import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { issueId, status } = await request.json();

    if (!issueId || !status) {
      return NextResponse.json(
        { error: "Missing issueId or status" },
        { status: 400 }
      );
    }

    // Issue'yu bul
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    // Projeye erişim kontrolü
    const member = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: issue.projectId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Not a member of this project" },
        { status: 403 }
      );
    }

    // Status'u güncelle
    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: { status },
    });

    // Proje'yi "dokunuşa" (touch) tabi tut
    await db.project.update({
      where: { id: issue.projectId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: updatedIssue,
    });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
