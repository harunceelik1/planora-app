"use client";

import React, { useState } from "react";
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
import { IssueSummarySheet } from "../backlog/IssueSummary";

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
  TODO: "bg-muted text-muted-foreground border-muted-foreground/20",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
  DONE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function ProjectSummary({ project }: Props) {
  const t = useTranslations("ProjectSummary");
  
  // ─── State Yönetimi ───────────────────────────────────────────────────────
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsSheetOpen(true);
  };

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
    .slice(0, 3);

  const upcomingList = issues
    .filter((i) => i.dueDate)
    .filter((i) => new Date(String(i.dueDate)).getTime() >= Date.now())
    .sort((a, b) => new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime())
    .slice(0, 3);

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
      tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      label: t("stats.completed"),
      value: done,
      hint: t("stats.completedHint", { rate: completionRate }),
      icon: CheckCircle2,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: t("stats.inProgress"),
      value: inProgress,
      hint: t("stats.inProgressHint"),
      icon: Timer,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      label: t("stats.overdue"),
      value: overdue,
      hint: t("stats.overdueHint"),
      icon: AlertTriangle,
      tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  ];

  return (
    <section className="flex w-full flex-col gap-5 p-1 animate-in fade-in duration-300">
      
      {/* 4 Ana Metrik Kartı */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground/90 font-medium">
                    {card.hint}
                  </p>
                </div>
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors", card.tone)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ana Panel Grid Yapısı */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        
        {/* SOL BLOK */}
        <div className="flex flex-col gap-5">
          
          {/* Aktif Sprint Kartı */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {activeSprint ? t("sprint.activeSprintTitle") : t("sprint.title")}
                </span>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                  {activeSprint?.name || t("sprint.noActiveSprint")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {activeSprint ? activeSprint.goal || t("sprint.noGoal") : t("sprint.noActiveSprintDescription")}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:w-full xl:w-[320px]">
                {[
                  { title: t("sprint.progress"), val: `${activeSprintRate}%` },
                  { title: t("sprint.scope"), val: activeSprintIssues.length },
                  { title: t("stats.backlog"), val: backlog }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/50 bg-muted/30 p-3 text-center">
                    <div className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">{item.title}</div>
                    <div className="mt-1 text-xl font-bold text-foreground tracking-tight">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {activeSprint && (
              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>{t("sprint.doneRatio", { done: activeSprintDone, total: activeSprintIssues.length })}</span>
                  <span className="text-foreground font-semibold">{activeSprintRate}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 shadow-sm" style={{ width: `${activeSprintRate}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Geciken ve Yaklaşan İşler Yan Yana Grid */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              
              {/* Geciken İşler */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <h4 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-wider">{t("lists.overdueTitle")}</h4>
                </div>
                <div className="space-y-2">
                  {overdueList.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">{t("lists.overdueEmpty")}</p>
                  ) : (
                    overdueList.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue)}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] p-3 transition-all cursor-pointer hover:bg-rose-500/[0.06] hover:border-rose-500/30"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{issue.title}</p>
                          <p className="text-[11px] font-medium text-muted-foreground">{project.projectKey}-{issue.number}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{formatDate(issue.dueDate)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Yaklaşan İşler */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-wider">{t("lists.upcomingTitle")}</h4>
                </div>
                <div className="space-y-2">
                  {upcomingList.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">{t("lists.upcomingEmpty")}</p>
                  ) : (
                    upcomingList.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue)}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3 transition-all cursor-pointer hover:bg-muted/20 hover:border-primary/30"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{issue.title}</p>
                          <p className="text-[11px] font-medium text-muted-foreground">{project.projectKey}-{issue.number}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold text-foreground/90">{formatDate(issue.dueDate)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SAĞ BLOK */}
        <div className="flex flex-col gap-5">
          
          {/* Takım Dağılımı */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2">
              <Users2 className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-wider">{t("team.title")}</h4>
            </div>
            <div className="space-y-2">
              {workload.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/50 p-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={member.image || ""} referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs font-medium text-muted-foreground/90">{t("team.completedCount", { count: member.doneCount })}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground tracking-tight">{member.openCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-2">
              <CircleDashed className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-bold tracking-tight text-foreground uppercase tracking-wider">{t("recent.title")}</h4>
            </div>
            <div className="space-y-2">
              {recent.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleIssueClick(issue)}
                  className="group rounded-2xl border border-border/50 bg-background/50 p-3 transition-all cursor-pointer hover:bg-muted/10 hover:border-amber-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{issue.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground font-medium">{project.projectKey}-{issue.number}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ─── Global Yan Panel Entegrasyonu ─────────────────────────────────── */}
     {/* Global Yan Panel Entegrasyonu */}
      <IssueSummarySheet
        issue={selectedIssue}
        project={project}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </section>
  );
}