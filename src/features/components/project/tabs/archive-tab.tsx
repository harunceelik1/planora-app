"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Archive } from "lucide-react";
import { Project, Sprint, Issue } from "@/types/project";

const formatSprintDateRange = (sprint: Sprint) => {
  const start = sprint.startDate ? new Date(sprint.startDate) : null;
  const end = sprint.endDate ? new Date(sprint.endDate) : null;

  if (!start && !end) return "Tarih bilgisi ayarlanmadı.";

  const formatter = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (start && end) {
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }

  return start ? formatter.format(start) : end ? formatter.format(end) : "Tarih bilgisi ayarlanmadı.";
};

export default function ArchiveTab({ project }: { project: Project }) {
  const t = useTranslations("ProjectDetails");
  const allIssues = project.issues || [];
  const completedSprints = (project.sprints || []).filter(
    (sprint: Sprint) => sprint.status === "COMPLETED",
  );

  const archivedMonthGroups = useMemo(() => {
    const groups: Record<string, { label: string; sprints: Sprint[] }> = {};
    const formatter = new Intl.DateTimeFormat("tr-TR", {
      month: "long",
      year: "numeric",
    });

    completedSprints.forEach((sprint: Sprint) => {
      const date = sprint.endDate ?? sprint.startDate;
      const key = date ? formatter.format(new Date(date)) : "Bilinmeyen tarih";

      if (!groups[key]) {
        groups[key] = { label: key, sprints: [] };
      }
      groups[key].sprints.push(sprint);
    });

    return Object.values(groups).sort((a, b) => {
      const aDateString = a.sprints[0].endDate ?? a.sprints[0].startDate ?? "";
      const bDateString = b.sprints[0].endDate ?? b.sprints[0].startDate ?? "";
      const aDate = new Date(aDateString).getTime();
      const bDate = new Date(bDateString).getTime();
      return bDate - aDate;
    });
  }, [completedSprints]);

  const totalArchivedTasks = completedSprints.reduce((sum: number, sprint: Sprint) => {
    const sprintDoneCount = sprint.issues?.filter((issue: Issue) => issue.status === "DONE").length;
    if (typeof sprintDoneCount === "number") return sum + sprintDoneCount;
    return (
      sum +
      allIssues.filter(
        (issue: Issue) => issue.sprintId === sprint.id && issue.status === "DONE",
      ).length
    );
  }, 0);

  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar p-6">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
         
          <h3 className="mt-3 text-3xl font-semibold text-foreground tracking-tight">
            {t("views.archive.title")}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-2xl">
            {t("views.archive.description")}
          </p>
        </div>
        
      </div>

      {completedSprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <p className="text-sm text-muted-foreground">
            Tamamlanmış sprint bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {archivedMonthGroups.map((group) => (
            <section key={group.label} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-sm font-semibold uppercase  text-muted-foreground">
                  {group.label}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {group.sprints.length} {t("views.archive.sprintsInMonth")}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.sprints.map((sprint) => {
                  const taskCount = sprint.issues?.length ?? allIssues.filter((issue) => issue.sprintId === sprint.id).length;
                  const doneTaskCount = sprint.issues?.filter((issue: Issue) => issue.status === "DONE").length ?? allIssues.filter(
                    (issue: Issue) => issue.sprintId === sprint.id && issue.status === "DONE",
                  ).length;

                  return (
                    <div
                      key={sprint.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/80"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Archive className="h-4.5 w-4.5" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                          {t("views.archive.completedTag")}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <h5 className="text-base font-semibold text-foreground">
                          {sprint.name}
                        </h5>
                        <p className="text-sm leading-5 text-muted-foreground">
                          {formatSprintDateRange(sprint)}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm text-muted-foreground dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{t("views.archive.tasksArchived")}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-foreground dark:bg-slate-800">
                            {taskCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{t("views.archive.doneTasks")}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-foreground dark:bg-slate-800">
                            {doneTaskCount}
                          </span>
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
