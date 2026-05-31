import { NotificationType, Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";
import { sendTaskReminderEmail } from "@/lib/mail";

// Reminder thresholds (dakika cinsinden)
const DUE_IN_3_DAYS_MINUTES = 3 * 24 * 60; // 4320 dakika
const DUE_TOMORROW_MINUTES = 24 * 60; // 1440 dakika
const DUE_TODAY_MINUTES = 0; // Bugün veya geçti

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

function getMinutesUntilDue(dueDate: Date) {
  return Math.ceil((dueDate.getTime() - Date.now()) / (60 * 1000));
}

function getReminderType(minutesUntilDue: number): NotificationType | null {
  if (minutesUntilDue <= 0) return NotificationType.OVERDUE;
  if (minutesUntilDue <= 24 * 60) return NotificationType.DUE_TODAY;
  if (minutesUntilDue <= 2 * 24 * 60) return NotificationType.DUE_TOMORROW;
  if (minutesUntilDue <= DUE_IN_3_DAYS_MINUTES) return NotificationType.DUE_IN_3_DAYS;
  return null;
}

function getReminderContent(
  issue: IssueWithReminderContext,
  minutesUntilDue: number,
  projectUrl?: string,
) {
  const issueCode = `${issue.project.projectKey}-${issue.number}`;
  const dueDateLabel = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(issue.dueDate!);

  if (minutesUntilDue <= 0) {
    return {
      title: "Görev gecikti",
      message: `${issueCode} teslim tarihini geçti.`,
      emailDueLabel: `${dueDateLabel} (gecikti)`,
      projectUrl,
    };
  }
  
  if (minutesUntilDue <= 24 * 60) {
    return {
      title: "Teslim tarihi bugün",
      message: `${issueCode} bugün teslim edilmesi gerekiyor.`,
      emailDueLabel: `${dueDateLabel} (bugün)`,
      projectUrl,
    };
  }
  
  if (minutesUntilDue <= 2 * 24 * 60) {
    return {
      title: "Teslim tarihi yarın",
      message: `${issueCode} yarın teslim edilmesi gerekiyor.`,
      emailDueLabel: `${dueDateLabel} (yarın)`,
      projectUrl,
    };
  }

  return {
    title: "Teslim tarihi yaklaşıyor",
    message: `${issueCode} teslim tarihine 3 gün kaldı.`,
    emailDueLabel: `${dueDateLabel} (3 gün kaldı)`,
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

    const minutesUntilDue = getMinutesUntilDue(issue.dueDate);
    const type = getReminderType(minutesUntilDue);

    if (!type) {
      results.skipped += 1;
      continue;
    }

    const projectUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/main/projects/${issue.projectId}`
      : undefined;

    const content = getReminderContent(issue, minutesUntilDue, projectUrl);

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
