"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";
import { ChevronDown, Layers, Trash2, Plus, LayoutList } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { InlineIssueCreator } from "../issue/inline-issue-creator";
import BacklogItemCard from "./BacklogItemCard";
import { Issue, Project, Sprint } from "@/types/project";

interface BacklogGroupProps {
  issues: Issue[];
  project: Project;
  sprints: Sprint[];
  creatingSprint: boolean;
  onCreateSprint: () => void;
  onSelectIssue: (issue: Issue) => void;
  onMoveIssue: (issueId: string, targetSprintId: string | null) => void;
  currentUserRole?: "OWNER" | "ADMIN" | "MEMBER";
}

export default function BacklogGroup({
  issues,
  project,
  sprints,
  creatingSprint,
  onCreateSprint,
  onSelectIssue,
  onMoveIssue,
  currentUserRole = "MEMBER",
}: BacklogGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const t = useTranslations("ProjectDetails");
  const { mutate } = useSWRConfig();
  const projectApiKey = `/api/project/${project.id}`;

  const selectedCount = Object.keys(selectedIds).length;

  return (
    <div className="mt-6 flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={isExpanded}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors duration-150 group-hover:border-primary/50 group-hover:text-primary">
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isExpanded ? "rotate-0" : "-rotate-90",
              )}
            />
          </span>
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight text-card-foreground">
              {t("backlogView.backlog.title")}
            </span>
          </div>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
            {issues.length}
          </span>
        </button>

        <Button
          onClick={onCreateSprint}
          disabled={creatingSprint}
          size="sm"
          variant="outline"
          className={cn(
            "h-8 rounded-lg px-3 text-xs font-medium",
            "border-border text-muted-foreground",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:opacity-50 transition-colors duration-150",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          {creatingSprint
            ? t("backlogView.noSprints.creating")
            : t("backlogView.noSprints.createButton")}
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        {/* min-h-0 is required for the grid trick to work */}
        <div className="min-h-0 overflow-hidden">
          {/* Inline issue creator */}
          <div className="border-b border-border/60 px-5 py-3">
            <InlineIssueCreator
              projectId={project.id}
              isSprint={false}
              className="border-none bg-transparent shadow-none"
            />
          </div>

          {/* ─── Bulk action bar ────────────────────────────────────────────────── */}
          {selectedCount > 0 && (
            <div className="mx-5 mb-3 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white tabular-nums">
                  {selectedCount}
                </span>
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  {t("backlogView.bulkDelete.selected", { count: selectedCount })}
                </span>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-7 px-3 gap-1.5 text-xs rounded-lg">
                    <Trash2 className="h-3 w-3" />
                    {t("backlogView.bulkDelete.delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-border shadow-2xl bg-card text-card-foreground">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("backlogView.bulkDelete.confirm")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      {t("backlogView.bulkDelete.confirm")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">
                      {t("backlogView.modal.buttons.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-lg bg-red-500 hover:bg-red-600 text-white"
                      onClick={async () => {
                        const ids = Object.keys(selectedIds);
                        try {
                          const res = await fetch(`/api/issue/bulk-delete`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids }),
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            setSelectedIds({});
                            mutate(projectApiKey);
                            toast.success(t("backlogView.bulkDelete.success", { count: ids.length }));
                          } else {
                            toast.error(data.error || t("backlogView.bulkDelete.failed"));
                          }
                        } catch (e) {
                          console.error(e);
                          toast.error(t("backlogView.bulkDelete.failed"));
                        }
                      }}
                    >
                      {t("backlogView.bulkDelete.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Table Header */}
          {issues.length > 0 && (
            <div className="grid grid-cols-[26px_28px_minmax(220px,1fr)_120px_150px_44px] gap-4 border-b border-border bg-muted/20 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              <div />
              <div />
              <div>{t("backlogView.table.task_name")}</div>
              <div>{t("backlogView.table.priority")}</div>
              <div>{t("backlogView.table.assignee")}</div>
              <div className="text-right">{t("backlogView.table.actions_header")}</div>
            </div>
          )}

          {/* Droppable Area */}
          <Droppable droppableId="backlog" type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "flex w-full flex-col gap-2 bg-card px-4 py-4 transition-colors duration-150",
                  issues.length === 0 && "min-h-[220px] items-center justify-center",
                  snapshot.isDraggingOver && "bg-accent/40",
                )}
              >
                {issues.length === 0 ? (
                  <div className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-border bg-muted/30 px-8 py-12 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
                      <Layers className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {t("backlogView.backlog.emptyTitle")}
                    </p>
                    <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground/80">
                      {t("backlogView.backlog.emptyDescription")}
                    </p>
                  </div>
                ) : (
                  issues.map((issue, index) => (
                    <BacklogItemCard
                      key={issue.id}
                      issue={issue}
                      index={index}
                      project={project}
                      sprints={sprints}
                      onEdit={() => onSelectIssue(issue)}
                      onMove={onMoveIssue}
                      selected={!!selectedIds[issue.id]}
                      onToggleSelect={(id: string) => {
                        setSelectedIds((prev) => {
                          const copy = { ...prev };
                          if (copy[id]) delete copy[id];
                          else copy[id] = true;
                          return copy;
                        });
                      }}
                      currentUserRole={currentUserRole}
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </div>
  );
}