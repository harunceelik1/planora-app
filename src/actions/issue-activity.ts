"use server";

import { db } from "@/lib/prisma";

export async function createIssueActivity(params: {
  issueId: string;
  projectId: string;
  userId: string;
  type: string;
  data?: any;
}) {
  const { issueId, projectId, userId, type, data } = params;

  return db.issueActivity.create({
    data: {
      issueId,
      projectId,
      userId,
      type: type as any,
      data: data ?? {},
    },
  });
}

export async function listIssueActivities(issueId: string, limit = 100) {
  return db.issueActivity.findMany({
    where: { issueId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
