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
  const activities = await db.issueActivity.findMany({
    where: { issueId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const assigneeIds = new Set<string>();
  activities.forEach((activity) => {
    if (activity.type === "ASSIGNEE_CHANGED" && activity.data) {
      const from = (activity.data as any)?.from;
      const to = (activity.data as any)?.to;
      if (typeof from === "string" && from) assigneeIds.add(from);
      if (typeof to === "string" && to) assigneeIds.add(to);
    }
  });

  if (assigneeIds.size === 0) {
    return activities;
  }

  const assignees = await db.user.findMany({
    where: { id: { in: Array.from(assigneeIds) } },
    select: { id: true, name: true },
  });

  const assigneeMap = Object.fromEntries(
    assignees.map((assignee) => [assignee.id, assignee.name ?? ""]),
  );

  return activities.map((activity) => {
    if (activity.type !== "ASSIGNEE_CHANGED" || !activity.data) {
      return activity;
    }

    const data = activity.data as Record<string, any>;
    const fromId = typeof data.from === "string" ? data.from : null;
    const toId = typeof data.to === "string" ? data.to : null;

    return {
      ...activity,
      data: {
        ...data,
        from: fromId ? assigneeMap[fromId] || fromId : data.from,
        to: toId ? assigneeMap[toId] || toId : data.to,
      },
    };
  });
}
