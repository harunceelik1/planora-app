"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";
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
import {
  DEFAULT_ISSUE_FILTERS,
  filterIssues,
  IssueFilters,
  type IssueFilterState,
} from "../issue/issue-filters";
import { IssueLabelList } from "../issue/issue-labels";

interface BoardViewProps {
  project: Project;
}

// ── Semantik Öncelik Renk Konfigürasyonu ────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  string,
  { bar: string; badge: string; dot: string; label: string }
> = {
  LOW: {
    bar: "bg-sky-500/80",
    badge: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400 dark:bg-sky-500/5",
    dot: "bg-sky-500",
    label: "Low",
  },
  MEDIUM: {
    bar: "bg-amber-500/80",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/5",
    dot: "bg-amber-500",
    label: "Medium",
  },
  HIGH: {
    bar: "bg-destructive/80",
    badge: "bg-destructive/10 text-destructive border-destructive/20 dark:text-destructive dark:bg-destructive/5",
    dot: "bg-destructive",
    label: "High",
  },
  HIGHEST: {
    bar: "bg-purple-500/80",
    badge: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 dark:bg-purple-500/5",
    dot: "bg-purple-500",
    label: "Highest",
  },
};

// ── Semantik Kolon Renk Konfigürasyonu ──────────────────────────────────────────
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
    accent: "border-t-muted-foreground/40",
    headerBg: "bg-muted/30",
    countBg: "bg-muted text-muted-foreground",
  },
  IN_PROGRESS: {
    icon: <Timer className="h-3.5 w-3.5" />,
    accent: "border-t-primary/70",
    headerBg: "bg-primary/5",
    countBg: "bg-primary/10 text-primary dark:text-primary-foreground dark:bg-primary/30",
  },
  DONE: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    accent: "border-t-emerald-500/70",
    headerBg: "bg-emerald-500/5",
    countBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
  },
};

export default function BoardView({ project }: BoardViewProps) {
  const t = useTranslations("ProjectDetails");
  const { mutate } = useSWRConfig();
  const projectApiKey = `/api/project/${project.id}`;
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
  const [filters, setFilters] = useState<IssueFilterState>(DEFAULT_ISSUE_FILTERS);
  const [isCompletingSprint, setIsCompletingSprint] = useState(false);
  const [isCompleteSprintDialogOpen, setIsCompleteSprintDialogOpen] =
    useState(false);

  useEffect(() => setIssues(sprintIssues), [sprintIssues]);
  const filteredIssues = filterIssues(issues, filters);

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
        return;
      }

      await mutate(projectApiKey);
    } catch {
      setIssues(prev);
      toast.error(t("views.board.statusUpdateError"));
    }
  };

  const totalIssues = filteredIssues.length;
  const doneCount = filteredIssues.filter((i) => i.status === "DONE").length;
  const inProgressCount = filteredIssues.filter((i) => i.status === "IN_PROGRESS").length;
  const progressPct = totalIssues > 0 ? Math.round((doneCount / totalIssues) * 100) : 0;

  if (!activeSprint) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 mt-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border">
          <KanbanSquare className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {t("views.board.noActiveSprintTitle")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("views.board.noActiveSprintDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto pb-8">
      <IssueFilters
        filters={filters}
        onChange={setFilters}
        issues={issues}
        members={project.members || []}
        resultCount={filteredIssues.length}
      />

      {/* ── Sprint Üst Bilgi Kartı ──────────────────────────────────────────── */}
      <div className="shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />

        <div className="p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

            {/* Sol taraf — Sprint Bilgileri */}
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t("views.board.activeSprintLabel")}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                  {activeSprint.name}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {activeSprint.name}
                </h2>
                {activeSprint.goal && (
                  <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 flex-shrink-0" />
                    {activeSprint.goal}
                  </p>
                )}
                {activeSprint.startDate && activeSprint.endDate && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/70">
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

            {/* Sağ taraf — İstatistikler ve Buton */}
            <div className="flex w-full flex-col gap-4 xl:w-auto xl:min-w-[240px] xl:items-end">
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs font-medium text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {inProgressCount} in progress
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  {progressPct}% complete
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full space-y-1.5 xl:w-56">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{doneCount} / {totalIssues} done</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <Button
                onClick={() => setIsCompleteSprintDialogOpen(true)}
                disabled={isCompletingSprint}
                size="sm"
                className="h-9 w-full px-4 gap-2 rounded-xl text-xs font-semibold sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
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

      {/* ── Kanban Kolonları ─────────────────────────────────────────────── */}
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-full items-start gap-4 xl:grid xl:grid-cols-3 xl:overflow-visible">
        {columns.map((column) => {
          const colCfg = COLUMN_CONFIG[column.key];
          const columnIssues = filteredIssues.filter((i) => i.status === column.key);

          return (
            <div
              key={column.key}
              className={cn(
                "flex min-h-[280px] min-w-[280px] flex-1 flex-col rounded-2xl border border-border border-t-2 md:min-w-[320px] xl:min-w-0",
                "bg-muted/20 shadow-xs overflow-hidden",
                colCfg.accent,
              )}
            >
              {/* Kolon Başlığı */}
              <div className={cn("flex items-center justify-between px-4 py-3 border-b border-border", colCfg.headerBg)}>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-card border border-border text-muted-foreground">
                    {colCfg.icon}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/80">
                    {column.title}
                  </span>
                </div>
                <span className={cn("inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums", colCfg.countBg)}>
                  {columnIssues.length}
                </span>
              </div>

              {/* Kartlar Listesi */}
              <div className="flex flex-col gap-2.5 p-3">
                {columnIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-border text-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2 text-muted-foreground/70">
                      {colCfg.icon}
                    </div>
                    <p className="text-xs text-muted-foreground">
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
                        className="group relative flex flex-col gap-3 rounded-xl p-3.5 bg-card text-card-foreground border border-border shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-border/80 transition-all duration-150"
                      >
                        {/* Sol Öncelik Çizgisi */}
                        <div className={cn("absolute left-0 top-3 bottom-3 w-0.5 rounded-full", pCfg.bar)} />

                        {/* Üst Satır: Başlık + Atanan Kullanıcı */}
                        <div className="flex items-start justify-between gap-3 pl-2.5">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground leading-snug">
                              {issue.title}
                            </p>
                            <IssueLabelList labels={issue.labels} limit={3} className="mt-1.5" />
                          </div>
                          {/* İki Harfli Kullanıcı Logosu */}
                          <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground">
                            {issue.assignee?.name
                              ? issue.assignee.name.slice(0, 2).toUpperCase()
                              : "?"}
                          </div>
                        </div>

                        {/* Meta Bilgi Satırı */}
                        <div className="flex flex-wrap items-center gap-1.5 pl-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-muted text-muted-foreground border border-border">
                            {project.projectKey}-{issue.number}
                          </span>
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border", pCfg.badge)}>
                            <Flag className="h-2.5 w-2.5" />
                            {pCfg.label}
                          </span>
                          {due && (
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                              due.overdue
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-muted text-muted-foreground border border-border"
                            )}>
                              <Clock className="h-2.5 w-2.5" />
                              {due.label}
                            </span>
                          )}
                        </div>

                        {/* Alt Satır: Durum Değiştirme Butonları */}
                        <div className="flex items-center justify-between pl-2.5">
                          <div className="flex gap-1.5">
                            {prevStatus && (
                              <button
                                onClick={() => handleStatusChange(issue.id, prevStatus)}
                                title={t("views.board.moveTo", { status: t(`views.board.status.${prevStatus}`) })}
                                className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                              >
                                <ChevronLeft className="h-3.5 w-3.5 cursor-pointer" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={() => handleStatusChange(issue.id, nextStatus)}
                                title={t("views.board.moveTo", { status: t(`views.board.status.${nextStatus}`) })}
                                className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 text-primary dark:bg-primary/20 dark:text-primary-foreground hover:bg-primary/20 transition-colors"
                              >
                                <ChevronRight className="h-3.5 w-3.5 cursor-pointer" />
                              </button>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground/80">
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
      </div>

      {/* ── Sprint Tamamlama Modalı ──────────────────────────────────────── */}
      <Dialog open={isCompleteSprintDialogOpen} onOpenChange={setIsCompleteSprintDialogOpen}>
        <DialogContent className="rounded-2xl border-border shadow-2xl bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground font-semibold tracking-tight">
              {t("views.board.completeSprintDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {t.rich("views.board.completeSprintDialog.description", {
                sprintName: activeSprint.name,
                strong: (chunks) => (
                  <strong className="text-foreground font-semibold">{chunks}</strong>
                ),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCompleteSprintDialogOpen(false)}
              className="rounded-xl border-input bg-background hover:bg-muted text-foreground transition-colors"
            >
              {t("views.board.completeSprintDialog.cancel")}
            </Button>
            <Button
              onClick={handleCompleteSprint}
              disabled={isCompletingSprint}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
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