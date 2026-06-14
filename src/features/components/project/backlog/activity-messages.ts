export function getActivityMessage(activity: any, t: any): string {
  const userName = activity.user?.name || t("unknownUser");
  const unassigned = t("unassigned");

  switch (activity.type) {
    case "ASSIGNEE_CHANGED": {
      const fromRaw = activity.data?.from ?? null;
      const toRaw = activity.data?.to ?? null;
      const hasFrom = typeof fromRaw === "string" && fromRaw !== "";
      const hasTo = typeof toRaw === "string" && toRaw !== "";
      const from = hasFrom ? fromRaw : unassigned;
      const to = hasTo ? toRaw : unassigned;

      if (!hasFrom && hasTo) {
        return t("activity.assigneeAssigned", { userName, assignee: to });
      }
      if (hasFrom && !hasTo) {
        return t("activity.assigneeRemoved", { userName, assignee: from });
      }
      if (hasFrom && hasTo) {
        return t("activity.assigneeChanged", { userName, from, to });
      }
      return t("activity.assigneeUpdated", { userName });
    }
    case "COMMENT_ADDED": {
      const content = (activity.data?.content || "").slice(0, 140);
      return t("activity.commentAdded", { userName, content });
    }
    case "ISSUE_UPDATED":
      return t("activity.issueUpdated", { userName });
    case "STATUS_CHANGED": {
      const fromRaw = activity.data?.from ?? null;
      const toRaw = activity.data?.to ?? null;
      const from = typeof fromRaw === "string" && fromRaw !== "" ? fromRaw : unassigned;
      const to = typeof toRaw === "string" && toRaw !== "" ? toRaw : unassigned;
      return t("activity.statusChanged", { userName, from, to });
    }
    default:
      return t("activity.actionPerformed", { userName });
  }
}
