import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const ids: string[] = body?.ids || [];
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  try {
    // Load projectId from first id to revalidate later
    const first = await db.issue.findUnique({ where: { id: ids[0] }, select: { projectId: true } });
    if (!first) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

    // Delete issues in a transaction
    await db.$transaction(
      ids.map((id) => db.issue.delete({ where: { id } })),
    );

    await db.project.update({ where: { id: first.projectId }, data: { updatedAt: new Date() } });
    revalidatePath(`/main/projects/${first.projectId}`);
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed" }, { status: 500 });
  }
}
