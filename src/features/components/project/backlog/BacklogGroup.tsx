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
}

export default function BacklogGroup({
  issues,
  project,
  sprints,
  creatingSprint,
  onCreateSprint,
  onSelectIssue,
  onMoveIssue,
}: BacklogGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const t = useTranslations("ProjectDetails");
  const { mutate } = useSWRConfig();
  const projectApiKey = `/api/project/${project.id}`;

  const selectedCount = Object.keys(selectedIds).length;

  return (
    <div className="flex flex-col mt-6 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 rounded-t-2xl">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          aria-expanded={isExpanded}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-colors duration-150">
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200",
                isExpanded ? "rotate-0" : "-rotate-90",
              )}
            />
          </span>
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              {t("backlogView.backlog.title")}
            </span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400 tabular-nums">
            {issues.length}
          </span>
        </button>

        <Button
          onClick={onCreateSprint}
          disabled={creatingSprint}
          size="sm"
          variant="outline"
          className={cn(
            "h-8 px-3 gap-1.5 text-xs font-medium rounded-lg",
            "border-slate-200 dark:border-slate-700",
            "text-slate-600 dark:text-slate-300",
            "hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700",
            "dark:hover:bg-indigo-950/40 dark:hover:border-indigo-600 dark:hover:text-indigo-300",
            "disabled:opacity-50 transition-colors duration-150",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          {creatingSprint
            ? t("backlogView.noSprints.creating")
            : t("backlogView.noSprints.createButton")}
        </Button>
      </div>

      {/*
        ── Collapsible body ──
        grid-rows trick: animate between grid-rows-[0fr] and grid-rows-[1fr]
        so the inner div can be any height without clipping.
        The inner div needs min-h-0 to allow shrinking.
      */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        {/* min-h-0 is required for the grid trick to work */}
        <div className="min-h-0 overflow-hidden">
          {/* Inline issue creator */}
          <div className="px-5 pt-4 pb-2">
            <InlineIssueCreator
              projectId={project.id}
              isSprint={false}
              className="border-none bg-transparent shadow-none"
            />
          </div>

          {/* ── Bulk action bar ── */}
          {selectedCount > 0 && (
            <div className="mx-5 mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
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
                <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-700 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
                      {t("backlogView.bulkDelete.confirm")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
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

          {/* ── Column headers ── */}
          {issues.length > 0 && (
            <div className="grid grid-cols-[30px_30px_minmax(200px,1fr)_120px_150px_50px] gap-2 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 border-y border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
              <div />
              <div />
              <div>{t("backlogView.table.task_name")}</div>
              <div>{t("backlogView.table.priority")}</div>
              <div>{t("backlogView.table.assignee")}</div>
              <div className="text-right pr-2">{t("backlogView.table.actions_header")}</div>
            </div>
          )}

          {/* ── Droppable list ── */}
          <Droppable droppableId="backlog" type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  // NO max-h, NO overflow-hidden — let content breathe freely
                  "flex flex-col w-full px-2 pt-1 pb-4 transition-colors duration-150",
                  issues.length === 0 && "min-h-[220px] items-center justify-center",
                  snapshot.isDraggingOver && "bg-indigo-50/60 dark:bg-indigo-950/20",
                )}
              >
                {issues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 w-full text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
                      <Layers className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {t("backlogView.backlog.emptyTitle")}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 max-w-[220px] leading-relaxed">
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