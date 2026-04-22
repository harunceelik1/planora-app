import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const notificationId =
    typeof body.notificationId === "string" ? body.notificationId : null;
  const markAll = body.markAll === true;

  if (!notificationId && !markAll) {
    return NextResponse.json(
      { error: "notificationId or markAll is required." },
      { status: 400 },
    );
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
