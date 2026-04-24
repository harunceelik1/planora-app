import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    include: {
      issue: {
        select: {
          id: true,
          number: true,
          title: true,
          projectId: true,
          project: { select: { id: true, projectKey: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const unreadCount = await db.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}
