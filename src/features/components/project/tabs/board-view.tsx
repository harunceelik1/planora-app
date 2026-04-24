"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  KanbanSquare,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
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

interface BoardViewProps {
  project: Project;
}

export default function BoardView({ project }: BoardViewProps) {
  const t = useTranslations("ProjectDetails");
  const activeSprint = project.sprints?.find((s) => s.status === "ACTIVE");
  const sprintIssues = useMemo(() => {
    return activeSprint
      ? project.issues.filter(
          (issue) => String(issue.sprintId) === String(activeSprint.id),
        )
      : [];
  }, [activeSprint, project.issues]);

  const [issues, setIssues] = useState<Issue[]>(sprintIssues);
  const [isCompletingSprint, setIsCompletingSprint] = useState(false);
  const [isCompleteSprintDialogOpen, setIsCompleteSprintDialogOpen] =
    useState(false);

  useEffect(() => {
    setIssues(sprintIssues);
  }, [sprintIssues]);

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
    } catch (error) {
      console.error("Sprint tamamlanırken hata oluştu:", error);
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

  const getPriorityClasses = (priority: Issue["priority"]) => {
    switch (priority) {
      case "LOW":
        return "border-l-4 border-blue-500/90";
      case "MEDIUM":
        return "border-l-4 border-amber-400/90";
      case "HIGH":
        return "border-l-4 border-rose-500/90";
      case "HIGHEST":
        return "border-l-4 border-fuchsia-500/90";
      default:
        return "border-l-4 border-slate-500/70";
    }
  };

  const getIssueDueLabel = (issue: Issue) => {
    if (!issue.dueDate) return t("views.board.noDueDate");

    const dueDate = new Date(issue.dueDate);
    const now = new Date();
    const diffDays = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return t("views.board.dueToday");
    return `D+${Math.abs(diffDays)}`;
  };

  const getNextStatus = (currentStatus: IssueStatus): IssueStatus | null => {
    if (currentStatus === "TODO") return "IN_PROGRESS";
    if (currentStatus === "IN_PROGRESS") return "DONE";
    return null;
  };

  const getPrevStatus = (currentStatus: IssueStatus): IssueStatus | null => {
    if (currentStatus === "DONE") return "IN_PROGRESS";
    if (currentStatus === "IN_PROGRESS") return "TODO";
    return null;
  };

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    const previousIssues = [...issues];
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue,
      ),
    );

    try {
      const result = await updateIssueData(issueId, { status: newStatus });

      if (!result.success) {
        setIssues(previousIssues);
        toast.error(
          `${t("views.board.statusUpdateFailed")} ${result.error || ""}`.trim(),
        );
        return;
      }
    } catch (error) {
      setIssues(previousIssues);
      console.error("Status güncellemesi başarısız:", error);
      toast.error(t("views.board.statusUpdateError"));
    }
  };

  if (!activeSprint) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
        <KanbanSquare className="mb-4 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          {t("views.board.noActiveSprintTitle")}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("views.board.noActiveSprintDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pb-6">
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#11214a] dark:bg-[#030922]">
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="tracking-normal" variant="default">
                  {t("views.board.activeSprintLabel")}
                </Badge>
                <Badge
                  className="border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  variant="secondary"
                >
                  {activeSprint.name}
                </Badge>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold tracking-normal text-foreground">
                  {activeSprint.name}
                </CardTitle>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {activeSprint.startDate && activeSprint.endDate
                    ? `${new Intl.DateTimeFormat("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(activeSprint.startDate))} - ${new Intl.DateTimeFormat(
                        "tr-TR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        },
                      ).format(new Date(activeSprint.endDate))}`
                    : t("views.board.noSprintDate")}
                </p>
                {activeSprint.goal && (
                  <CardDescription>{activeSprint.goal}</CardDescription>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setIsCompleteSprintDialogOpen(true)}
                disabled={isCompletingSprint}
                variant="secondary"
                size="lg"
                className="rounded-full px-5 py-2"
              >
                {isCompletingSprint
                  ? t("views.board.completingSprint")
                  : t("views.board.completeSprintButton")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => {
          const columnIssues = issues.filter((issue) => issue.status === column.key);

          return (
            <Card
              key={column.key}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#11214a] dark:bg-[#030922]"
            >
              <CardContent className="space-y-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-normal text-foreground">
                      {column.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {columnIssues.length} {t("views.board.issueLabel")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {columnIssues.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                      {t("views.board.noIssues")}
                    </div>
                  ) : (
                    columnIssues.map((issue) => {
                      const nextStatus = getNextStatus(issue.status);
                      const prevStatus = getPrevStatus(issue.status);
                      const priorityClasses = getPriorityClasses(issue.priority);

                      return (
                        <div
                          key={issue.id}
                          className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 dark:border-[#11214a] dark:bg-slate-950/80 dark:hover:border-[#1b3270] ${priorityClasses}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                              <div className="text-base font-semibold text-foreground">
                                {issue.title}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-slate-700 dark:border-[#31477c] dark:bg-[#1d2f5c] dark:text-slate-100">
                                  {project.projectKey}-{issue.number}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-slate-100 text-slate-700 dark:border-[#31477c] dark:bg-[#1d2f5c] dark:text-slate-100"
                                >
                                  {issue.priority}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-slate-100 text-slate-700 dark:border-[#31477c] dark:bg-[#1d2f5c] dark:text-slate-100"
                                >
                                  {getIssueDueLabel(issue)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <div className="flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-[#1d2f5c] dark:text-slate-100">
                                {issue.assignee?.name
                                  ? issue.assignee.name.slice(0, 2).toUpperCase()
                                  : "?"}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              {prevStatus && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleStatusChange(issue.id, prevStatus)
                                  }
                                  className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-[#2f3136] dark:text-slate-100 dark:hover:bg-[#45484f] dark:hover:text-white"
                                  title={t("views.board.moveTo", {
                                    status: t(`views.board.status.${prevStatus}`),
                                  })}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                              )}
                              {nextStatus && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleStatusChange(issue.id, nextStatus)
                                  }
                                  className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-[#2f3136] dark:text-slate-100 dark:hover:bg-[#45484f] dark:hover:text-white"
                                  title={t("views.board.moveTo", {
                                    status: t(`views.board.status.${nextStatus}`),
                                  })}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {issue.assignee?.name ?? t("views.board.noAssignee")}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={isCompleteSprintDialogOpen}
        onOpenChange={setIsCompleteSprintDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("views.board.completeSprintDialog.title")}</DialogTitle>
            <DialogDescription>
              {t.rich("views.board.completeSprintDialog.description", {
                sprintName: activeSprint.name,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCompleteSprintDialogOpen(false)}
            >
              {t("views.board.completeSprintDialog.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleCompleteSprint}
              disabled={isCompletingSprint}
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
