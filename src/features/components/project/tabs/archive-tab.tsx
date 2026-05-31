"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Archive, CheckCircle2, ListTodo, CalendarDays, TrendingUp } from "lucide-react";
import { Project, Sprint, Issue } from "@/types/project";
import { cn } from "@/lib/utils";

const formatSprintDateRange = (sprint: Sprint) => {
  const start = sprint.startDate ? new Date(sprint.startDate) : null;
  const end   = sprint.endDate   ? new Date(sprint.endDate)   : null;

  const fmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  if (start && end) return `${fmt.format(start)} – ${fmt.format(end)}`;
  if (start)         return fmt.format(start);
  if (end)           return fmt.format(end);
  return "Tarih bilgisi ayarlanmadı.";
};

export default function ArchiveTab({ project }: { project: Project }) {
  const t = useTranslations("ProjectDetails");
  const allIssues = project.issues || [];
  const completedSprints = (project.sprints || []).filter(
    (s: Sprint) => s.status === "COMPLETED",
  );

  const archivedMonthGroups = useMemo(() => {
    const groups: Record<string, { label: string; sprints: Sprint[] }> = {};
    const fmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });

    completedSprints.forEach((sprint: Sprint) => {
      const date = sprint.endDate ?? sprint.startDate;
      const key  = date ? fmt.format(new Date(date)) : "Bilinmeyen tarih";
      if (!groups[key]) groups[key] = { label: key, sprints: [] };
      groups[key].sprints.push(sprint);
    });

    return Object.values(groups).sort((a, b) => {
      const aDate = new Date(a.sprints[0].endDate ?? a.sprints[0].startDate ?? "").getTime();
      const bDate = new Date(b.sprints[0].endDate ?? b.sprints[0].startDate ?? "").getTime();
      return bDate - aDate;
    });
  }, [completedSprints]);

  // Overall stats
  const totalTasks = completedSprints.reduce((sum, s) => {
    return sum + (s.issues?.length ?? allIssues.filter((i) => i.sprintId === s.id).length);
  }, 0);
  const totalDone = completedSprints.reduce((sum, s) => {
    return sum + (
      s.issues?.filter((i: Issue) => i.status === "DONE").length ??
      allIssues.filter((i) => i.sprintId === s.id && i.status === "DONE").length
    );
  }, 0);
  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-6">

      {/* ── Page header ── */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card text-card-foreground shadow-sm">
        {/* gradient top accent */}
        <div className="h-1 bg-gradient-to-r from-primary/80 to-primary" />

        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left — title + description */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/20">
              <Archive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {t("views.archive.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl leading-relaxed">
                {t("views.archive.description")}
              </p>
            </div>
          </div>

          {/* Right — summary stats */}
          <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:flex-col sm:items-end">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Sprints</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {completedSprints.length}
                </p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tasks done</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {totalDone}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {totalTasks}
                  </span>
                </p>
              </div>
            </div>
            {/* Overall progress */}
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Overall completion</span>
                <span className="font-semibold text-foreground">{overallPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {completedSprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <Archive className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Tamamlanmış sprint bulunmuyor.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Sprint tamamlandığında burada görünecek.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {archivedMonthGroups.map((group) => (
            <section key={group.label}>
              {/* Month group header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {group.label}
                    </h4>
                  </div>
                  {/* thin divider line */}
                  <div className="h-px flex-1 min-w-[40px] bg-border" />
                </div>
                <span className="text-[11px] text-muted-foreground flex-shrink-0">
                  {group.sprints.length} {t("views.archive.sprintsInMonth")}
                </span>
              </div>

              {/* Sprint cards grid */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.sprints.map((sprint) => {
                  const taskCount = sprint.issues?.length
                    ?? allIssues.filter((i) => i.sprintId === sprint.id).length;
                  const doneCount = sprint.issues?.filter((i: Issue) => i.status === "DONE").length
                    ?? allIssues.filter((i) => i.sprintId === sprint.id && i.status === "DONE").length;
                  const pct = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

                  return (
                    <div
                      key={sprint.id}
                      className={cn(
                        "group flex flex-col rounded-2xl overflow-hidden",
                        "border border-border bg-card text-card-foreground",
                        "shadow-sm hover:shadow-md hover:-translate-y-0.5",
                        "transition-all duration-150",
                      )}
                    >
                      {/* Card top accent — completion-aware color */}
                      <div className={cn(
                        "h-0.5",
                        pct === 100
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : pct >= 50
                          ? "bg-gradient-to-r from-primary/70 to-primary"
                          : "bg-border",
                      )} />

                      <div className="flex flex-col gap-4 p-4 flex-1">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Archive icon */}
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 bg-primary/10 border border-primary/20">
                            <Archive className="h-4 w-4 text-primary" />
                          </div>

                          {/* Completed badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {t("views.archive.completedTag")}
                          </span>
                        </div>

                        {/* Sprint name + date */}
                        <div>
                          <h5 className="text-sm font-bold text-foreground leading-snug">
                            {sprint.name}
                          </h5>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3 flex-shrink-0" />
                            {formatSprintDateRange(sprint)}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                          <div className="flex items-center gap-1.5">
                            <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {t("views.archive.tasksArchived")}
                            </span>
                          </div>
                          <span className="text-xs font-bold tabular-nums text-foreground">
                            {taskCount}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs text-muted-foreground">
                              {t("views.archive.doneTasks")}
                            </span>
                          </div>
                          <span className="text-xs font-bold tabular-nums text-emerald-500">
                            {doneCount}
                          </span>
                        </div>

                        {/* Completion progress */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Completion
                              </span>
                            </div>
                            <span className={cn(
                              "text-xs font-bold tabular-nums",
                              pct === 100 ? "text-emerald-500" : "text-foreground",
                            )}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                pct === 100
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                  : "bg-gradient-to-r from-primary/80 to-primary",
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}