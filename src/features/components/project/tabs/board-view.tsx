"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  KanbanSquare,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  Circle,
  Timer,
  TrendingUp,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Issue, IssueStatus, Project } from "@/types/project";
import { completeSprint } from "@/actions/sprint-actions";
import { updateIssueData } from "@/actions/issue-actions";
import { cn } from "@/lib/utils";

interface BoardViewProps {
  project: Project;
}

// ── Priority config ────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  string,
  { bar: string; badge: string; dot: string; label: string }
> = {
  LOW: {
    bar: "bg-sky-400",
    badge:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60",
    dot: "bg-sky-400",
    label: "Low",
  },
  MEDIUM: {
    bar: "bg-amber-400",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
    dot: "bg-amber-400",
    label: "Medium",
  },
  HIGH: {
    bar: "bg-rose-500",
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
    dot: "bg-rose-500",
    label: "High",
  },
  HIGHEST: {
    bar: "bg-fuchsia-500",
    badge:
      "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-800/60",
    dot: "bg-fuchsia-500",
    label: "Highest",
  },
};

// ── Column config ──────────────────────────────────────────────────────────
const COLUMN_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    accent: string;
    headerBg: string;
    countBg: string;
  }
> = {
  TODO: {
    icon: <Circle className="h-3.5 w-3.5" />,
    accent: "border-t-slate-400",
    headerBg:
      "bg-slate-50 dark:bg-slate-800/50",
    countBg:
      "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  },
  IN_PROGRESS: {
    icon: <Timer className="h-3.5 w-3.5" />,
    accent: "border-t-indigo-500",
    headerBg:
      "bg-indigo-50/60 dark:bg-indigo-950/30",
    countBg:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
  },
  DONE: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    accent: "border-t-emerald-500",
    headerBg:
      "bg-emerald-50/60 dark:bg-emerald-950/30",
    countBg:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
};

export default function BoardView({ project }: BoardViewProps) {
  const t = useTranslations("ProjectDetails");
  const activeSprint = project.sprints?.find((s) => s.status === "ACTIVE");
  const sprintIssues = useMemo(
    () =>
      activeSprint
        ? project.issues.filter(
            (issue) => String(issue.sprintId) === String(activeSprint.id),
          )
        : [],
    [activeSprint, project.issues],
  );

  const [issues, setIssues] = useState<Issue[]>(sprintIssues);
  const [isCompletingSprint, setIsCompletingSprint] = useState(false);
  const [isCompleteSprintDialogOpen, setIsCompleteSprintDialogOpen] =
    useState(false);

  useEffect(() => setIssues(sprintIssues), [sprintIssues]);

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    setIsCompletingSprint(true);
    try {
      const result = await completeSprint(activeSprint.id);
      if (result.success) {
        window.location.reload();
      } else {
        toast.error(
          `${t("views.board.completeSprintFailed")} ${result.error || ""}`.trim(),
        );
      }
    } catch {
      toast.error(t("views.board.completeSprintError"));
    } finally {
      setIsCompleteSprintDialogOpen(false);
      setIsCompletingSprint(false);
    }
  };

  const columns = [
    { key: "TODO", title: t("views.board.columns.todo") },
    { key: "IN_PROGRESS", title: t("views.board.columns.inProgress") },
    { key: "DONE", title: t("views.board.columns.done") },
  ];

  const getIssueDueLabel = (issue: Issue) => {
    if (!issue.dueDate) return null;
    const dueDate = new Date(issue.dueDate);
    const diffDays = Math.ceil(
      (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > 0) return { label: `${diffDays}d left`, overdue: false };
    if (diffDays === 0) return { label: t("views.board.dueToday"), overdue: false };
    return { label: `${Math.abs(diffDays)}d overdue`, overdue: true };
  };

  const getNextStatus = (s: IssueStatus): IssueStatus | null =>
    s === "TODO" ? "IN_PROGRESS" : s === "IN_PROGRESS" ? "DONE" : null;
  const getPrevStatus = (s: IssueStatus): IssueStatus | null =>
    s === "DONE" ? "IN_PROGRESS" : s === "IN_PROGRESS" ? "TODO" : null;

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    const prev = [...issues];
    setIssues((all) =>
      all.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)),
    );
    try {
      const result = await updateIssueData(issueId, { status: newStatus });
      if (!result.success) {
        setIssues(prev);
        toast.error(`${t("views.board.statusUpdateFailed")} ${result.error || ""}`.trim());
      }
    } catch {
      setIssues(prev);
      toast.error(t("views.board.statusUpdateError"));
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalIssues = issues.length;
  const doneCount = issues.filter((i) => i.status === "DONE").length;
  const inProgressCount = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const progressPct = totalIssues > 0 ? Math.round((doneCount / totalIssues) * 100) : 0;

  // ── No active sprint ───────────────────────────────────────────────────
  if (!activeSprint) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <KanbanSquare className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            {t("views.board.noActiveSprintTitle")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {t("views.board.noActiveSprintDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto pb-8">

      {/* ── Sprint Header Card ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white h-full dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            {/* Left — sprint info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Active badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t("views.board.activeSprintLabel")}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {activeSprint.name}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {activeSprint.name}
                </h2>
                {activeSprint.goal && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 flex-shrink-0" />
                    {activeSprint.goal}
                  </p>
                )}
                {activeSprint.startDate && activeSprint.endDate && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "2-digit", month: "short", year: "numeric",
                    }).format(new Date(activeSprint.startDate))}
                    {" – "}
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "2-digit", month: "short", year: "numeric",
                    }).format(new Date(activeSprint.endDate))}
                  </p>
                )}
              </div>
            </div>

            {/* Right — stats + button */}
            <div className="flex flex-col gap-4 lg:items-end">
              {/* Mini stat chips */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {inProgressCount} in progress
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  {progressPct}% complete
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full lg:w-56 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{doneCount} / {totalIssues} done</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <Button
                onClick={() => setIsCompleteSprintDialogOpen(true)}
                disabled={isCompletingSprint}
                size="sm"
                className={cn(
                  "h-9 px-4 gap-2 rounded-xl text-xs font-semibold",
                  "bg-slate-900 hover:bg-slate-700 text-white",
                  "dark:bg-slate-100 dark:hover:bg-slate-300 dark:text-slate-900",
                  "transition-colors duration-150 disabled:opacity-50",
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isCompletingSprint
                  ? t("views.board.completingSprint")
                  : t("views.board.completeSprintButton")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kanban columns ─────────────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => {
          const colCfg = COLUMN_CONFIG[column.key];
          const columnIssues = issues.filter((i) => i.status === column.key);

          return (
            <div
              key={column.key}
              className={cn(
                "flex flex-col rounded-2xl border-t-2 border border-slate-200 dark:border-slate-700/60",
                "bg-slate-50/50 dark:bg-slate-900/50",
                "shadow-sm overflow-hidden",
                colCfg.accent,
              )}
            >
              {/* Column header */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/60",
                  colCfg.headerBg,
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-md",
                    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                    "text-slate-500 dark:text-slate-400",
                  )}>
                    {colCfg.icon}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    {column.title}
                  </span>
                </div>
                <span className={cn(
                  "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums",
                  colCfg.countBg,
                )}>
                  {columnIssues.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5 p-3">
                {columnIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/60 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                      {colCfg.icon}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t("views.board.noIssues")}
                    </p>
                  </div>
                ) : (
                  columnIssues.map((issue) => {
                    const nextStatus = getNextStatus(issue.status);
                    const prevStatus = getPrevStatus(issue.status);
                    const pCfg = PRIORITY_CONFIG[issue.priority] ?? PRIORITY_CONFIG["LOW"];
                    const due = getIssueDueLabel(issue);

                    return (
                      <div
                        key={issue.id}
                        className={cn(
                          "group relative flex flex-col gap-3 rounded-xl p-3.5",
                          "bg-white dark:bg-slate-900",
                          "border border-slate-200 dark:border-slate-700/60",
                          "shadow-sm hover:shadow-md",
                          "hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600",
                          "transition-all duration-150",
                        )}
                      >
                        {/* Priority bar — left edge */}
                        <div className={cn(
                          "absolute left-0 top-3 bottom-3 w-0.5 rounded-full",
                          pCfg.bar,
                        )} />

                        {/* Top row: title + assignee avatar */}
                        <div className="flex items-start justify-between gap-3 pl-2.5">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                            {issue.title}
                          </p>
                          {/* Avatar */}
                          <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                            {issue.assignee?.name
                              ? issue.assignee.name.slice(0, 2).toUpperCase()
                              : "?"}
                          </div>
                        </div>

                        {/* Meta row: issue key, priority, due */}
                        <div className="flex flex-wrap items-center gap-1.5 pl-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {project.projectKey}-{issue.number}
                          </span>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                            pCfg.badge,
                          )}>
                            <Flag className="h-2.5 w-2.5" />
                            {pCfg.label}
                          </span>
                          {due && (
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                              due.overdue
                                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50"
                                : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
                            )}>
                              <Clock className="h-2.5 w-2.5" />
                              {due.label}
                            </span>
                          )}
                        </div>

                        {/* Bottom row: move buttons + assignee name */}
                        <div className="flex items-center justify-between pl-2.5">
                          <div className="flex gap-1.5">
                            {prevStatus && (
                              <button
                                onClick={() => handleStatusChange(issue.id, prevStatus)}
                                title={t("views.board.moveTo", { status: t(`views.board.status.${prevStatus}`) })}
                                className={cn(
                                  "flex items-center justify-center h-7 w-7 rounded-lg",
                                  "bg-slate-100 dark:bg-slate-800",
                                  "border border-slate-200 dark:border-slate-700",
                                  "text-slate-500 dark:text-slate-400",
                                  "hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200",
                                  "transition-colors duration-100",
                                )}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={() => handleStatusChange(issue.id, nextStatus)}
                                title={t("views.board.moveTo", { status: t(`views.board.status.${nextStatus}`) })}
                                className={cn(
                                  "flex items-center justify-center h-7 w-7 rounded-lg",
                                  "bg-indigo-50 dark:bg-indigo-950/50",
                                  "border border-indigo-200 dark:border-indigo-800/50",
                                  "text-indigo-600 dark:text-indigo-400",
                                  "hover:bg-indigo-100 dark:hover:bg-indigo-900/60",
                                  "transition-colors duration-100",
                                )}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {issue.assignee?.name ?? t("views.board.noAssignee")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Complete Sprint Dialog ──────────────────────────────────────── */}
      <Dialog open={isCompleteSprintDialogOpen} onOpenChange={setIsCompleteSprintDialogOpen}>
        <DialogContent className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              {t("views.board.completeSprintDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t.rich("views.board.completeSprintDialog.description", {
                sprintName: activeSprint.name,
                strong: (chunks) => (
                  <strong className="text-slate-700 dark:text-slate-200">{chunks}</strong>
                ),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCompleteSprintDialogOpen(false)}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {t("views.board.completeSprintDialog.cancel")}
            </Button>
            <Button
              onClick={handleCompleteSprint}
              disabled={isCompletingSprint}
              className="rounded-xl bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-slate-300 dark:text-slate-900 text-white"
            >
              {isCompletingSprint
                ? t("views.board.completingSprint")
                : t("views.board.completeSprintDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}