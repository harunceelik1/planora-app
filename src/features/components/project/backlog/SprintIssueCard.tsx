"use client";

import { GripVertical } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Issue } from "@/types/project";

interface SprintIssueCardProps {
  issue: Issue;
  index: number;
  projectKey: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function SprintIssueCard({
  issue,
  index,
  projectKey,
  onClick,
  disabled = false,
}: SprintIssueCardProps) {
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
          {...provided.dragHandleProps}
          className={cn(
            "flex items-center gap-3 py-2.5 px-3 bg-white border rounded-lg",
            disabled
              ? "border-slate-200 bg-slate-100 text-slate-500 opacity-80"
              : "cursor-grab active:cursor-grabbing",
          )}
          onClick={() => !disabled && onClick()}
        >
          <GripVertical size={14} className="text-slate-300" />
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {projectKey}-{issue.number}
          </span>
          <span className="text-sm font-medium text-slate-700 truncate">
            {issue.title}
          </span>
        </div>
      )}
    </Draggable>
  );
}
