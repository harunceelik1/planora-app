import React from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Layers3,
  Timer,
  Users2,
} from "lucide-react";
import { Project, Issue, Sprint } from "@/types/project";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  project: Project;
};

function formatDate(value?: string | Date | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

function getDueDiffLabel(date?: string | Date | null, t?: ReturnType<typeof useTranslations>) {
  if (!date || !t) return null;

  const dueTime = new Date(date).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueTime - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return t("lists.overdueBadge", { count: Math.abs(diffDays) });
  if (diffDays === 0) return t("lists.todayBadge");
  return t("lists.upcomingBadge", { count: diffDays });
}

const STATUS_STYLES: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
};

export default function ProjectSummary({ project }: Props) {
  const t = useTranslations("ProjectSummary");
  const issues: Issue[] = project.issues || [];
  const sprints: Sprint[] = project.sprints || [];
  const members = project.members || [];
  const total = issues.length;
  const todo = issues.filter((i) => i.status === "TODO").length;
  const inProgress = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const done = issues.filter((i) => i.status === "DONE").length;
  const overdue = issues.filter((i) => {
    if (!i.dueDate) return false;
    return new Date(String(i.dueDate)).getTime() < Date.now() && i.status !== "DONE";
  }).length;
  const backlog = issues.filter((i) => !i.sprintId).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const activeSprintIssues = activeSprint
    ? issues.filter((issue) => String(issue.sprintId) === String(activeSprint.id))
    : [];
  const activeSprintDone = activeSprintIssues.filter((issue) => issue.status === "DONE").length;
  const activeSprintRate =
    activeSprintIssues.length > 0
      ? Math.round((activeSprintDone / activeSprintIssues.length) * 100)
      : 0;

  const recent = [...issues]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const overdueList = issues
    .filter((i) => i.dueDate && i.status !== "DONE")
    .filter((i) => new Date(String(i.dueDate)).getTime() < Date.now())
    .sort((a, b) => new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime())
    .slice(0, 4);

  const upcomingList = issues
    .filter((i) => i.dueDate)
    .filter((i) => new Date(String(i.dueDate)).getTime() >= Date.now())
    .sort((a, b) => new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime())
    .slice(0, 4);

  const workload = members
    .map((member) => {
      const memberIssues = issues.filter((issue) => issue.assigneeId === member.user.id);
      const openCount = memberIssues.filter((issue) => issue.status !== "DONE").length;
      return {
        id: member.id || member.user.id,
        name: member.user.name || t("common.unknownUser"),
        image: member.user.image,
        openCount,
        doneCount: memberIssues.filter((issue) => issue.status === "DONE").length,
      };
    })
    .sort((a, b) => b.openCount - a.openCount)
    .slice(0, 4);

  const cards = [
    {
      label: t("stats.totalTasks"),
      value: total,
      hint: t("stats.totalTasksHint"),
      icon: Layers3,
      tone:
        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/70 dark:text-slate-200 dark:border-slate-800",
    },
    {
      label: t("stats.completed"),
      value: done,
      hint: t("stats.completedHint", { rate: completionRate }),
      icon: CheckCircle2,
      tone:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/60",
    },
    {
      label: t("stats.inProgress"),
      value: inProgress,
      hint: t("stats.inProgressHint"),
      icon: Timer,
      tone:
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/60",
    },
    {
      label: t("stats.overdue"),
      value: overdue,
      hint: t("stats.overdueHint"),
      icon: AlertTriangle,
      tone:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/60",
    },
  ];

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground xl:text-3xl">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.hint}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border",
                    card.tone,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
              
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {activeSprint?.name || t("sprint.noActiveSprint")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeSprint
                    ? activeSprint.goal || t("sprint.noGoal")
                    : t("sprint.noActiveSprintDescription")}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 xl:w-[320px]">
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">{t("sprint.progress")}</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {activeSprintRate}%
                  </div>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">{t("sprint.scope")}</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {activeSprintIssues.length}
                  </div>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="text-xs text-muted-foreground">{t("stats.backlog")}</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {backlog}
                  </div>
                </div>
              </div>
            </div>

            {activeSprint && (
                <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("sprint.doneRatio", {
                      done: activeSprintDone,
                      total: activeSprintIssues.length,
                    })}
                  </span>
                  <span>{activeSprintRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${activeSprintRate}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {t("status.todo", { count: todo })}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    {t("status.inProgress", { count: inProgress })}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {t("status.done", { count: done })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <h4 className="text-sm font-semibold text-foreground">
                  {t("lists.overdueTitle")}
                </h4>
                </div>
                <div className="space-y-2.5">
                  {overdueList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("lists.overdueEmpty")}
                    </p>
                  ) : (
                    overdueList.map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/70 p-3 dark:border-rose-950/60 dark:bg-rose-950/20"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {issue.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project.projectKey}-{issue.number}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium text-rose-600 dark:text-rose-300">
                            {formatDate(issue.dueDate)}
                          </p>
                          <p className="text-[11px] text-rose-500 dark:text-rose-400">
                            {getDueDiffLabel(issue.dueDate, t)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-foreground">
                  {t("lists.upcomingTitle")}
                </h4>
                </div>
                <div className="space-y-2.5">
                  {upcomingList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("lists.upcomingEmpty")}
                    </p>
                  ) : (
                    upcomingList.map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {issue.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project.projectKey}-{issue.number}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium text-foreground">
                            {formatDate(issue.dueDate)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {getDueDiffLabel(issue.dueDate, t)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Users2 className="h-4 w-4 text-sky-500" />
              <h4 className="text-sm font-semibold text-foreground">
                {t("team.title")}
              </h4>
            </div>
            <div className="space-y-2.5">
              {workload.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("team.empty")}
                </p>
              ) : (
                workload.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage
                          src={member.image || ""}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("team.completedCount", { count: member.doneCount })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {member.openCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("team.openCount")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <CircleDashed className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-foreground">
                {t("recent.title")}
              </h4>
            </div>
            <div className="space-y-2.5">
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("recent.empty")}</p>
              ) : (
                recent.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-xl border border-border bg-background/60 p-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {project.projectKey}-{issue.number} · {t("recent.updated")}{" "}
                          {formatDate(issue.updatedAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                          STATUS_STYLES[issue.status] || STATUS_STYLES.TODO,
                        )}
                      >
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
