"use client";

import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  MoreHorizontal,
  Play,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import SprintIssueCard from "./SprintIssueCard";
import { formatSprintDate } from "./backlog-utils";
import { Issue, Sprint } from "@/types/project";

interface SprintGroupProps {
  sprint: Sprint;
  issues: Issue[];
  projectKey: string;
  onOpenSprintModal: (mode: "start" | "settings") => void;
  onCompleteSprint: () => void;
  onDeleteSprint?: () => void;
  onSelectIssue: (issue: Issue) => void;
  currentUserRole?: "OWNER" | "ADMIN" | "MEMBER";
}

export default function SprintGroup({
  sprint,
  issues,
  projectKey,
  onOpenSprintModal,
  onCompleteSprint,
  onDeleteSprint,
  onSelectIssue,
  currentUserRole = "MEMBER",
}: SprintGroupProps) {
  const t = useTranslations("ProjectDetails");
  const [collapsed, setCollapsed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isActive = sprint.status === "ACTIVE";
  const isCompleted = sprint.status === "COMPLETED";

  const statusLabel = isActive
    ? t("backlogView.sprint.status.active")
    : isCompleted
      ? t("backlogView.sprint.status.completed")
      : t("backlogView.sprint.status.unplanned");

  // Durum rozetleri için renk harmonisi Shadcn modlarına uyumlu esnetildi
  const statusClasses = isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
    : isCompleted
      ? "border-border bg-muted text-muted-foreground"
      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400";

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-start justify-between border-b px-5 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button
              aria-expanded={!collapsed}
              variant="outline"
              size="icon-sm"
              onClick={() => setCollapsed((value) => !value)}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "-rotate-90",
                )}
              />
            </Button>
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              {sprint.name}
            </h3>
            <Badge className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-none", statusClasses)}>
              {statusLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {t("backlogView.sprint.issuesCount", { count: issues.length })}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <CalendarDays className="h-3 w-3 text-muted-foreground/80" />
              {sprint.startDate && sprint.endDate
                ? `${formatSprintDate(sprint.startDate)} - ${formatSprintDate(sprint.endDate)}`
                : t("backlogView.sprint.noDate")}
            </span>
          </div>
          {sprint.goal ? (
            <div className="text-xs text-muted-foreground">
              {t("backlogView.sprint.goalLabel")}: {sprint.goal}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {sprint.status === "PENDING" && (
            <Button
              size="sm"
              disabled={issues.length === 0}
              variant="outline"
              className="h-8 rounded-lg border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => onOpenSprintModal("start")}
            >
              <Play className="w-3 h-3 mr-1.5 fill-current" />
              {t("backlogView.sprint.startBtn")}
            </Button>
          )}
          {isActive && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg border-input bg-background text-foreground hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
              onClick={onCompleteSprint}
            >
              {t("backlogView.sprint.completeBtn")}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                {t("backlogView.sprintDelete.delete")}
              </DropdownMenuItem>

              {sprint.status === "PENDING" && (
                <DropdownMenuItem
                  disabled={issues.length === 0}
                  onClick={() => onOpenSprintModal("start")}
                >
                  {t("backlogView.sprint.startBtn")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onOpenSprintModal("settings")}>
                {t("backlogView.sprint.settingsBtn")}
              </DropdownMenuItem>
              {isActive && (
                <DropdownMenuItem onClick={onCompleteSprint}>
                  {t("backlogView.sprint.completeBtn")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("backlogView.sprintDelete.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.rich("backlogView.sprintDelete.description", {
                    sprintName: sprint.name,
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("backlogView.modal.buttons.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    setDeleteOpen(false);
                    if (typeof onDeleteSprint === "function") onDeleteSprint();
                  }}
                >
                  {t("backlogView.sprintDelete.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {!collapsed && (
        <Droppable
          droppableId={String(sprint.id)}
          type="task"
          isDropDisabled={isCompleted}
        >
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                "min-h-25 w-full flex flex-col gap-2 bg-background px-4 py-4 transition-colors",
                isCompleted
                  ? "bg-muted/40 opacity-75"
                  : snapshot.isDraggingOver
                    ? "bg-accent/60"
                    : "",
              )}
            >
              {issues.length === 0 ? (
                <div className="flex select-none flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-10 text-center">
                  <ClipboardList className="mb-2 h-6 w-6 text-muted-foreground/60" />
                  <p className="text-sm font-medium text-foreground">
                    {t("backlogView.sprint.empty.title")}
                  </p>
                  <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
                    {t("backlogView.sprint.empty.description")}
                  </p>
                </div>
              ) : (
                issues.map((issue, index) => (
                  <SprintIssueCard
                    key={issue.id}
                    issue={issue}
                    index={index}
                    projectKey={projectKey}
                    disabled={isCompleted}
                    onClick={() => onSelectIssue(issue)}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}