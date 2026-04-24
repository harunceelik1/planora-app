"use client";

import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  MoreHorizontal,
  Play,
  ArrowRight,
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
  AlertDialogTrigger,
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
}

export default function SprintGroup({
  sprint,
  issues,
  projectKey,
  onOpenSprintModal,
  onCompleteSprint,
  onDeleteSprint,
  onSelectIssue,
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

  return (
    <div className="flex flex-col rounded-2xl border bg-card dark:bg-slate-950 shadow-sm overflow-hidden border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
              className="flex items-center justify-center rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  collapsed && "-rotate-90",
                )}
              />
            </button>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              {sprint.name}
            </h3>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="text-[10px] uppercase font-bold"
            >
              {statusLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-2 py-1 text-[11px] text-slate-600 dark:text-slate-300">
              {t("backlogView.sprint.issuesCount", { count: issues.length })}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-2 py-1 text-[11px] text-slate-600 dark:text-slate-300">
              <CalendarDays className="h-3 w-3 text-slate-500" />
              {sprint.startDate && sprint.endDate
                ? `${formatSprintDate(sprint.startDate)} - ${formatSprintDate(sprint.endDate)}`
                : t("backlogView.sprint.noDate")}
            </span>
          </div>
          {sprint.goal ? (
            <div className="text-xs text-slate-500">
              {t("backlogView.sprint.goalLabel")}: {sprint.goal}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {sprint.status === "PENDING" && (
            <Button
              size="sm"
              disabled={issues.length === 0}
              variant="secondary"
              onClick={() => onOpenSprintModal("start")}
            >
              <Play className="w-3 h-3 mr-1.5 fill-current" />
              {t("backlogView.sprint.startBtn")}
            </Button>
          )}
          {isActive && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8"
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
                className="h-8 w-8 text-slate-500 dark:text-slate-400"
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
                "min-h-25 w-full flex flex-col gap-2 p-3 transition-colors",
                isCompleted
                  ? "bg-slate-50 opacity-80 dark:bg-slate-950/80"
                  : snapshot.isDraggingOver
                    ? "bg-blue-50/50 dark:bg-blue-900/30"
                    : "bg-transparent",
              )}
            >
              {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center select-none opacity-60">
                  <ClipboardList className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-100">
                    {t("backlogView.sprint.empty.title")}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400">
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
