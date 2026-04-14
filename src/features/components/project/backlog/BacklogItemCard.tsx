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
import { Issue, Project, Sprint } from "@/types/project";
import { IssueAssigneeSelector } from "./issue-assignee-selector";

interface BacklogItemCardProps {
  issue: Issue;
  index: number;
  project: Project;
  sprints?: Sprint[];
  onEdit: () => void;
  onMove: (issueId: string, targetSprintId: string | null) => void;
}

const priorityStyles: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-600",
  MEDIUM: "bg-amber-50 text-amber-600",
  HIGH: "bg-orange-50 text-orange-600",
  HIGHEST: "bg-red-50 text-red-600",
};

export default function BacklogItemCard({
  issue,
  index,
  project,
  sprints,
  onEdit,
  onMove,
}: BacklogItemCardProps) {
  const t = useTranslations("ProjectDetails");
  const priority = issue.priority || "MEDIUM";
  const badgeStyle = priorityStyles[priority] || priorityStyles.MEDIUM;
  const users =
    project.members?.map((member: any) => member.user || member) || [];

  return (
    <Draggable draggableId={String(issue.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "grid grid-cols-[30px_30px_minmax(200px,1fr)_120px_150px_50px] gap-2 items-center px-4 py-3 bg-white rounded-xl border group",
            snapshot.isDragging
              ? "shadow-2xl border-primary z-50 ring-2 ring-primary opacity-90"
              : "border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all",
          )}
        >
          <div
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-slate-300 opacity-0 group-hover:opacity-100 flex justify-center transition-opacity"
          >
            <GripVertical size={16} />
          </div>
          <div className="flex justify-center">
            <span className="sr-only">
              {t("backlogView.table.move_to_sprint")}
            </span>
          </div>
          <div
            className="flex flex-col items-start gap-0.5 overflow-hidden cursor-pointer"
            onClick={onEdit}
          >
            <span className="text-sm font-semibold text-slate-700 leading-none truncate w-full">
              {issue.title}
            </span>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
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
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
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
                        {sprints.map((s) => (
                          <DropdownMenuItem
                            key={s.id}
                            onClick={() => onMove(issue.id, s.id)}
                          >
                            {s.name}
                          </DropdownMenuItem>
                        ))}
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
