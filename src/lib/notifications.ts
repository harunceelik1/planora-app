import { NotificationType, Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";
import { sendTaskReminderEmail } from "@/lib/mail";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type IssueWithReminderContext = Prisma.IssueGetPayload<{
  include: {
    assignee: true;
    project: true;
  };
}>;

const STATUS_LABELS: Record<string, string> = {
  TODO: "Yapılacak",
  IN_PROGRESS: "Devam Ediyor",
  DONE: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

function parseTimezoneOffsetToMinutes(rawTimezone?: string | null) {
  if (!rawTimezone) return 0;

  const normalized = rawTimezone.trim().toUpperCase().replace("UTC", "");
  const match = normalized.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);

  if (!match) return 0;

  const [, sign, hours, minutes] = match;
  const totalMinutes = Number(hours) * 60 + Number(minutes || "0");

  return sign === "-" ? -totalMinutes : totalMinutes;
}

function getLocalDateKey(date: Date, timezoneOffsetMinutes: number) {
  return new Date(date.getTime() + timezoneOffsetMinutes * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function getDiffInDaysForTimezone(dueDate: Date, timezone?: string | null) {
  const offsetMinutes = parseTimezoneOffsetToMinutes(timezone);
  const todayKey = getLocalDateKey(new Date(), offsetMinutes);
  const dueKey = getLocalDateKey(dueDate, offsetMinutes);

  const startOfToday = new Date(`${todayKey}T00:00:00.000Z`);
  const startOfDue = new Date(`${dueKey}T00:00:00.000Z`);

  return Math.round((startOfDue.getTime() - startOfToday.getTime()) / DAY_IN_MS);
}

function getReminderType(diffInDays: number): NotificationType | null {
  if (diffInDays === 3) return NotificationType.DUE_IN_3_DAYS;
  if (diffInDays === 1) return NotificationType.DUE_TOMORROW;
  if (diffInDays === 0) return NotificationType.DUE_TODAY;
  if (diffInDays < 0) return NotificationType.OVERDUE;
  return null;
}

function getReminderContent(
  issue: IssueWithReminderContext,
  diffInDays: number,
  projectUrl?: string,
) {
  const issueCode = `${issue.project.projectKey}-${issue.number}`;
  const dueDateLabel = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(issue.dueDate!);

  if (diffInDays === 3) {
    return {
      title: "Teslim tarihi yaklaşıyor",
      message: `${issueCode} teslim tarihine 3 gün kaldı.`,
      emailDueLabel: `${dueDateLabel} (3 gün kaldı)`,
      projectUrl,
    };
  }

  if (diffInDays === 1) {
    return {
      title: "Teslim tarihi yarın",
      message: `${issueCode} yarın teslim edilecek.`,
      emailDueLabel: `${dueDateLabel} (yarın)`,
      projectUrl,
    };
  }

  if (diffInDays === 0) {
    return {
      title: "Teslim tarihi bugün",
      message: `${issueCode} bugün teslim edilmeli.`,
      emailDueLabel: `${dueDateLabel} (bugün)`,
      projectUrl,
    };
  }

  return {
    title: "Görev gecikti",
    message: `${issueCode} teslim tarihini geçti.`,
    emailDueLabel: `${dueDateLabel} (gecikti)`,
    projectUrl,
  };
}

export async function processDueTaskReminders() {
  const issues = await db.issue.findMany({
    where: {
      dueDate: { not: null },
      status: { notIn: ["DONE", "CANCELLED"] },
      assigneeId: { not: null },
    },
    include: {
      assignee: true,
      project: true,
    },
  });

  const results = {
    processed: 0,
    created: 0,
    emailed: 0,
    skipped: 0,
  };

  for (const issue of issues) {
    results.processed += 1;

    if (!issue.assignee || !issue.assignee.email || !issue.dueDate) {
      results.skipped += 1;
      continue;
    }

    const diffInDays = getDiffInDaysForTimezone(
      issue.dueDate,
      issue.assignee.timezone,
    );
    const type = getReminderType(diffInDays);

    if (!type) {
      results.skipped += 1;
      continue;
    }

    const projectUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/main/projects/${issue.projectId}`
      : undefined;

    const content = getReminderContent(issue, diffInDays, projectUrl);

    const notification = await db.notification.upsert({
      where: {
        userId_issueId_type: {
          userId: issue.assignee.id,
          issueId: issue.id,
          type,
        },
      },
      update: {},
      create: {
        userId: issue.assignee.id,
        issueId: issue.id,
        type,
        title: content.title,
        message: content.message,
      },
    });

    const wasExisting = notification.emailSentAt !== null;
    if (!wasExisting) {
      results.created += 1;
    }

    if (notification.emailSentAt) {
      continue;
    }

    const emailResult = await sendTaskReminderEmail(issue.assignee.email, {
      recipientName: issue.assignee.name,
      issueTitle: issue.title,
      projectName: issue.project.projectName,
      dueLabel: content.emailDueLabel,
      statusLabel: STATUS_LABELS[issue.status] || issue.status,
      projectUrl: content.projectUrl,
    });

    if (emailResult.success) {
      await db.notification.update({
        where: { id: notification.id },
        data: { emailSentAt: new Date() },
      });
      results.emailed += 1;
    }
  }

  return results;
}
