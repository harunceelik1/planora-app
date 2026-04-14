"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
  const t = useTranslations("ProjectDetails");

  return (
    <div className="flex flex-col mt-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-bold outline-none"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          {t("backlogView.backlog.title")}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {t("backlogView.backlog.issuesCount", { count: issues.length })}
          </span>
        </button>
        <Button
          onClick={onCreateSprint}
          disabled={creatingSprint}
          variant="secondary"
          size="sm"
        >
          {creatingSprint
            ? t("backlogView.noSprints.creating")
            : t("backlogView.noSprints.createButton")}
        </Button>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mb-4">
            <InlineIssueCreator
              projectId={project.id}
              isSprint={false}
              className="border-none bg-transparent shadow-none"
            />
          </div>

          {issues.length > 0 && (
            <div className="grid grid-cols-[30px_30px_minmax(200px,1fr)_120px_150px_50px] gap-2 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <div></div>
              <div></div>
              <div>{t("backlogView.table.task_name")}</div>
              <div>{t("backlogView.table.priority")}</div>
              <div>{t("backlogView.table.assignee")}</div>
              <div className="text-right pr-2">
                {t("backlogView.table.actions_header")}
              </div>
            </div>
          )}

          <Droppable droppableId="backlog" type="task">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "flex flex-col gap-1 min-h-37.5 rounded-xl pb-10 transition-colors",
                  snapshot.isDraggingOver &&
                    "bg-slate-50/80 ring-1 ring-slate-200",
                )}
              >
                {issues.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
                    {t("backlogView.backlog.emptyTitle")}
                    <br />
                    {t("backlogView.backlog.emptyDescription")}
                  </p>
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
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </div>
  );
}
