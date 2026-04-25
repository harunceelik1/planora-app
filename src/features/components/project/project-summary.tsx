import React from "react";
import { useTranslations } from "next-intl";
import { Project, Issue } from "@/types/project";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  project: Project;
};

const statCard = (label: string, value: number) => (
  <div className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-md shadow-sm">
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

function smallDate(d?: string | Date | null) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return String(d);
  }
}

export default function ProjectSummary({ project }: Props) {
  const t = useTranslations("ProjectSummary");
  const issues: Issue[] = project.issues || [];
  const total = issues.length;
  const todo = issues.filter((i) => i.status === "TODO").length;
  const inProgress = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const done = issues.filter((i) => i.status === "DONE").length;
  const overdue = issues.filter((i) => {
    if (!i.dueDate) return false;
    const due = new Date(String(i.dueDate));
    return due.getTime() < Date.now() && i.status !== "DONE";
  }).length;

  const recent = [...issues]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const overdueList = issues
    .filter((i) => i.dueDate)
    .filter((i) => {
      try {
        return new Date(String(i.dueDate)).getTime() < Date.now() && i.status !== "DONE";
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime());

  const upcomingList = issues
    .filter((i) => i.dueDate)
    .filter((i) => {
      try {
        return new Date(String(i.dueDate)).getTime() >= Date.now();
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime());

  return (
    <section className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {statCard(t("stats.totalTasks"), total)}
        {statCard(t("stats.backlog"), todo)}
        {statCard(t("stats.inProgress"), inProgress)}
        {statCard(t("stats.completed"), done)}
        {statCard(t("stats.overdue"), overdue)}
        <div className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-md">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((m) => (
                <Avatar key={m.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={m.user.image || ""} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-muted text-[10px] text-foreground font-bold">
                    {m.user.name ? m.user.name.substring(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="ml-3 text-sm">
              <div className="font-semibold text-foreground">{project.members.length}</div>
              <div className="text-xs text-muted-foreground">{t("stats.members")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-4 bg-card border border-border rounded-md">
          <h4 className="text-sm font-semibold text-foreground mb-3">{t("recent.title")}</h4>
          <ul className="space-y-2">
            {recent.length === 0 && <li className="text-sm text-muted-foreground">{t("recent.empty")}</li>}
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className={cn("h-8 w-8 flex items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm")}>{r.number}</div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{t("recent.updated")}: {smallDate(r.updatedAt)}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{r.status}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-card border border-border rounded-md">
          <h4 className="text-sm font-semibold text-foreground mb-3">{t("dates.title")}</h4>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-destructive mb-2">{t("dates.overdueTitle")}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {overdueList.length === 0 && <li className="text-sm text-muted-foreground">{t("dates.overdueEmpty")}</li>}
                {overdueList.slice(0, 5).map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-destructive">
                    <span className="truncate font-medium">{i.title}</span>
                    <span className="ml-2 font-medium">{smallDate(i.dueDate)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-foreground mb-2">{t("dates.upcomingTitle")}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {upcomingList.length === 0 && <li className="text-sm text-muted-foreground">{t("dates.upcomingEmpty")}</li>}
                {upcomingList.slice(0, 5).map((i) => (
                  <li key={i.id} className="flex items-center justify-between">
                    <span className="truncate">{i.title}</span>
                    <span className="ml-2 font-medium text-foreground">{smallDate(i.dueDate)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
