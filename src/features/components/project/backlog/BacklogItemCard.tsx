"use client";

import {
  Copy,
  Pen,
  ArrowRight,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Issue, Project, Sprint, ProjectMember } from "@/types/project";
import { IssueAssigneeSelector } from "./issue-assignee-selector";

interface BacklogItemCardProps {
  issue: Issue;
  index: number;
  project: Project;
  sprints?: Sprint[];
  onEdit: () => void;
  onMove: (issueId: string, targetSprintId: string | null) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const priorityStyles: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-600 dark:bg-blue-900/80 dark:text-blue-200",
  MEDIUM: "bg-amber-50 text-amber-600 dark:bg-amber-900/80 dark:text-amber-200",
  HIGH: "bg-orange-50 text-orange-600 dark:bg-orange-900/80 dark:text-orange-200",
  HIGHEST: "bg-red-50 text-red-600 dark:bg-red-900/80 dark:text-red-200",
};

export default function BacklogItemCard({
  issue,
  index,
  project,
  sprints,
  onEdit,
  onMove,
  selected,
  onToggleSelect,
}: BacklogItemCardProps) {
  const t = useTranslations("ProjectDetails");
  const priority = issue.priority || "MEDIUM";
  const badgeStyle = priorityStyles[priority] || priorityStyles.MEDIUM;
  const users = project.members?.map((member: ProjectMember) => member.user) || [];

  return (
    <Draggable draggableId={String(issue.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "grid grid-cols-[30px_30px_minmax(200px,1fr)_120px_150px_50px] gap-2 items-center px-4 py-3 bg-card dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-slate-300 dark:hover:border-slate-700 transition-all",
            snapshot.isDragging && "shadow-2xl border-primary/30 z-50 ring-2 ring-primary/20 opacity-95",
          )}
        >
          <div
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-slate-300 opacity-0 group-hover:opacity-100 flex justify-center transition-opacity"
          >
            <GripVertical size={16} />
          </div>
          <div className="flex justify-center">
            <Checkbox
              aria-label={`select-issue-${issue.id}`}
              checked={!!selected}
              onCheckedChange={() => onToggleSelect && onToggleSelect(issue.id)}
              className="h-4 w-4 mt-1 cursor-pointer"
            />
          </div>
          <div
            className="flex flex-col items-start gap-0.5 overflow-hidden cursor-pointer"
            onClick={onEdit}
          >
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-100 leading-none truncate w-full">
              {issue.title}
            </span>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-1">
              {project.projectKey}-{issue.number}
            </div>
          </div>
          <div>
            <Badge
              variant="secondary"
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold border-transparent",
                badgeStyle,
              )}
            >
              {priority}
            </Badge>
          </div>
          <div>
            <IssueAssigneeSelector
              issue={issue}
              members={users}
              projectId={project.id}
            />
          </div>
          <div className="flex justify-end pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 outline-none">
                  <MoreHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {t("backlogView.table.actions")}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(String(issue.id))
                  }
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />{" "}
                  {t("backlogView.table.copy_id")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pen className="mr-2 h-3.5 w-3.5" />{" "}
                  {t("backlogView.table.edit_task")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {sprints?.length ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="mr-2 h-3.5 w-3.5" />{" "}
                      {t("backlogView.table.move_to_sprint")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                       {sprints.map((s) => {
                const isCompleted = s.status === "COMPLETED"; // Durumu kontrol et

                return (
                  <DropdownMenuItem
                    key={s.id}
                    // 1. Tıklamayı sadece "COMPLETED" değilse çalıştır
                    onClick={() => !isCompleted && onMove(issue.id, s.id)}
                    // 2. Menü öğesini disabled yap (bu otomatik olarak sönükleştirir ve tıklamayı keser)
                    disabled={isCompleted}
                    className={cn(
                      isCompleted && "opacity-50 cursor-not-allowed" 
                    )}
                  >
                    <span className="truncate">
                      {s.name}
                    </span>
                  </DropdownMenuItem>
                );
              })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </Draggable>
  );
}
