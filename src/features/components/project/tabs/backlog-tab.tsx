"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  ListTodo,
  Timer,
} from "lucide-react";
import BacklogView from "@/features/components/project/backlog/backlog-view";
import { cn } from "@/lib/utils";
import type { Project, Sprint } from "@/types/project";

function formatSprintDate(value?: string | Date | null) {
  if (!value) return null;

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export function BacklogTab({ project }: { project: Project }) {
  const t = useTranslations("ProjectDetails");
  const tSummary = useTranslations("ProjectSummary");

  const issues = project.issues || [];
  const sprints: Sprint[] = project.sprints || [];
  const backlogCount = issues.filter((issue) => !issue.sprintId).length;
  const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");
  const pendingSprint = sprints.find((sprint) => sprint.status === "PENDING");
  const completedSprints = sprints.filter(
    (sprint) => sprint.status === "COMPLETED",
  ).length;

  const highlightedSprint = activeSprint || pendingSprint || null;
  const highlightedSprintIssues = highlightedSprint
    ? issues.filter(
        (issue) => String(issue.sprintId) === String(highlightedSprint.id),
      )
    : [];
  const highlightedSprintDone = highlightedSprintIssues.filter(
    (issue) => issue.status === "DONE",
  ).length;
  const highlightedSprintRate =
    highlightedSprintIssues.length > 0
      ? Math.round((highlightedSprintDone / highlightedSprintIssues.length) * 100)
      : 0;

  const sprintStatusLabel = activeSprint
    ? t("backlogView.sprint.status.active")
    : pendingSprint
      ? t("backlogView.sprint.status.unplanned")
      : tSummary("sprint.noActiveSprint");

  const sprintDateRange =
    highlightedSprint &&
    formatSprintDate(highlightedSprint.startDate) &&
    formatSprintDate(highlightedSprint.endDate)
      ? `${formatSprintDate(highlightedSprint.startDate)} - ${formatSprintDate(highlightedSprint.endDate)}`
      : t("backlogView.sprint.noDate");

  const statCards = [
    {
      label: tSummary("stats.totalTasks"),
      value: issues.length,
      icon: FolderKanban,
      tone:
        "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200",
    },
    {
      label: tSummary("stats.backlog"),
      value: backlogCount,
      icon: ListTodo,
      tone:
        "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-300",
    },
    {
      label: tSummary("sprint.scope"),
      value: highlightedSprintIssues.length,
      icon: Timer,
      tone:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
    },
    {
      label: t("views.archive.completedSprints"),
      value: completedSprints,
      icon: CheckCircle2,
      tone:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden p-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_36%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.95))] p-5 shadow-sm dark:border-slate-800/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_34%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.96))]">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_420px]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                {t("tabs.backlog")}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                {sprintStatusLabel}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {highlightedSprint?.name || tSummary("sprint.noActiveSprint")}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {activeSprint
                  ? highlightedSprint?.goal || tSummary("sprint.noGoal")
                  : pendingSprint
                    ? t("backlogView.noSprints.description")
                    : tSummary("sprint.noActiveSprintDescription")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {card.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                          {card.value}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm",
                          card.tone,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <CircleDashed className="h-3.5 w-3.5" />
                  {highlightedSprint
                    ? t("backlogView.sprint.settingsBtn")
                    : t("backlogView.noSprints.title")}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {highlightedSprint?.name || t("backlogView.noSprints.title")}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {highlightedSprint
                      ? sprintDateRange
                      : t("backlogView.backlog.emptyDescription")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {highlightedSprint
                      ? tSummary("sprint.doneRatio", {
                          done: highlightedSprintDone,
                          total: highlightedSprintIssues.length,
                        })
                      : t("backlogView.backlog.issuesCount", { count: backlogCount })}
                  </span>
                  <span>
                    {highlightedSprint ? `${highlightedSprintRate}%` : sprintStatusLabel}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      highlightedSprint
                        ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"
                        : "bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600",
                    )}
                    style={{
                      width: highlightedSprint
                        ? `${highlightedSprintRate}%`
                        : backlogCount > 0
                          ? "38%"
                          : "18%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-50/40 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30">
        <BacklogView project={project} issues={issues} />
      </div>
    </div>
  );
}
