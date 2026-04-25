import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json();
  const parsed = await import("@/lib/validation").then((m) => m.parseSafe(m.bulkDeleteSchema, raw));
  if (!parsed.ok) return NextResponse.json({ error: "Invalid body", details: parsed.error }, { status: 400 });
  const ids: string[] = parsed.data.ids;

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error || "Failed");
    console.error("Bulk delete error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
