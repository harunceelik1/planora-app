"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Trash2 } from "lucide-react";
import { Issue } from "@/types/project";

interface TaskDetailHeaderProps {
  task: Issue;
  onClose: () => void;
  onDeleteClick: () => void;
}

export function TaskDetailHeader({
  task,
  onClose,
  onDeleteClick,
}: TaskDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-0 h-16 shrink-0 bg-white dark:bg-slate-950">
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-none font-mono text-xs rounded-sm px-2 py-0.5"
        >
          {task.id.slice(0, 8)}...
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
          onClick={onDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        onClick={onClose}
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
