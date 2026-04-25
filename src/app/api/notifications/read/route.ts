import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = await import("@/lib/validation").then((m) => m.parseSafe(m.notificationsReadSchema, raw));
  if (!parsed.ok) return NextResponse.json({ error: "Invalid body", details: parsed.error }, { status: 400 });
  const notificationId = typeof parsed.data.notificationId === "string" ? parsed.data.notificationId : null;
  const markAll = parsed.data.markAll === true;

  if (!notificationId && !markAll) {
    return NextResponse.json({ error: "notificationId or markAll is required." }, { status: 400 });
  }

  if (markAll) {
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  }

  const notification = await db.notification.findFirst({
    where: {
      id: notificationId!,
      userId: session.user.id,
    },
  });

  if (!notification) {
    return NextResponse.json(
      { error: "Notification not found." },
      { status: 404 },
    );
  }

  await db.notification.update({
    where: { id: notification.id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
