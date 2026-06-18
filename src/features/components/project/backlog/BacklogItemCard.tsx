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
import { IssueLabelList } from "../issue/issue-labels";

interface BacklogItemCardProps {
  issue: Issue;
  index: number;
  project: Project;
  sprints?: Sprint[];
  onEdit: () => void;
  onMove: (issueId: string, targetSprintId: string | null) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  currentUserRole?: "OWNER" | "ADMIN" | "MEMBER";
}

const priorityStyles: Record<string, string> = {
  LOW: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300",
  HIGHEST: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
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
  currentUserRole = "MEMBER",
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
            "grid grid-cols-[26px_28px_minmax(220px,1fr)_120px_150px_44px] items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground",
            "group transition-all duration-150 hover:border-border/80 hover:bg-muted/40",
            selected && "border-indigo-500/30 bg-indigo-50/40 dark:border-indigo-500/40 dark:bg-indigo-950/20",
            snapshot.isDragging &&
              "z-50 border-primary/30 bg-card shadow-2xl ring-2 ring-primary/15",
          )}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className="flex justify-center  text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </div>

          {/* Checkbox */}
          <div className="flex justify-center">
            <Checkbox
              aria-label={`select-issue-${issue.id}`}
              checked={!!selected}
              onCheckedChange={() => onToggleSelect && onToggleSelect(issue.id)}
              className="h-4 w-4 cursor-pointer"
            />
          </div>

          {/* Task Info */}
          <div
            className="flex cursor-pointer flex-col items-start gap-1 overflow-hidden"
            onClick={onEdit}
          >
            <span className="w-full truncate text-sm font-semibold leading-snug text-card-foreground">
              {issue.title}
            </span>
            <div className="font-mono text-[11px] font-medium text-muted-foreground/80">
              {project.projectKey}-{issue.number}
            </div>
            <IssueLabelList labels={issue.labels} limit={3} />
          </div>

          {/* Priority Badge */}
          <div className="flex items-center">
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-none",
                badgeStyle,
              )}
            >
              {priority}
            </Badge>
          </div>

          {/* Assignee Selector */}
          <div className="min-w-0">
            <IssueAssigneeSelector
              issue={issue}
              members={users}
              projectId={project.id}
              currentUserRole={currentUserRole}
            />
          </div>

          {/* Actions Dropdown */}
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-lg p-0 text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card text-card-foreground border-border">
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
                <DropdownMenuSeparator className="bg-border" />
                {sprints?.length ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="mr-2 h-3.5 w-3.5" />{" "}
                      {t("backlogView.table.move_to_sprint")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="bg-card text-card-foreground border-border">
                        {sprints.map((s) => {
                          const isCompleted = s.status === "COMPLETED";

                          return (
                            <DropdownMenuItem
                              key={s.id}
                              onClick={() => !isCompleted && onMove(issue.id, s.id)}
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