"use client";

import { Flag, GripVertical } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Issue } from "@/types/project";
import { IssueLabelList } from "../issue/issue-labels";

interface SprintIssueCardProps {
  issue: Issue;
  index: number;
  projectKey: string;
  onClick: () => void;
  disabled?: boolean;
}

const priorityStyles: Record<string, string> = {
  LOW: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  MEDIUM:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  HIGHEST:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
};

export default function SprintIssueCard({
  issue,
  index,
  projectKey,
  onClick,
  disabled = false,
}: SprintIssueCardProps) {
  const priority = issue.priority || "MEDIUM";
  const badgeStyle = priorityStyles[priority] || priorityStyles.MEDIUM;

  return (
    <Draggable
      draggableId={String(issue.id)}
      index={index}
      isDragDisabled={disabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group grid grid-cols-[24px_minmax(220px,1fr)_104px] items-center gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950",
            "transition-all duration-150 hover:border-slate-300 hover:bg-slate-50/60 dark:hover:border-slate-700 dark:hover:bg-slate-900/80",
            disabled
              ? "border-slate-200 bg-slate-100 text-slate-500 opacity-80 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
              : snapshot.isDragging
                ? "z-40 border-primary/30 shadow-2xl ring-2 ring-primary/15"
                : "",
          )}
          onClick={() => !disabled && onClick()}
        >
          <div
            {...provided.dragHandleProps}
            className={cn(
              "flex justify-center text-slate-300 transition-opacity",
              disabled ? "cursor-default opacity-40" : "cursor-grab opacity-0 group-hover:opacity-100 active:cursor-grabbing",
            )}
          >
            <GripVertical size={15} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {issue.title}
            </p>
            <p className="mt-1 font-mono text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {projectKey}-{issue.number}
            </p>
            <IssueLabelList labels={issue.labels} limit={2} className="mt-1.5" />
          </div>

          <div className="flex justify-end">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                badgeStyle,
              )}
            >
              <Flag className="h-3 w-3" />
              {priority}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
