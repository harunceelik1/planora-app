"use client";

import { useState } from "react";
import { useTranslations } from "next-intl"; // 1. Import
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { IssueItem } from "./issue-item";
import { Issue, Project, Sprint } from "@/types/project";
import { InlineIssueCreator } from "../issue/inline-issue-creator";
import { useSWRConfig } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BacklogViewProps {
  project: Project;
  sprints: Sprint[];
  issues: Issue[];
}

export default function BacklogView({
  project,
  sprints,
  issues,
}: BacklogViewProps) {
  const [isBacklogOpen, setIsBacklogOpen] = useState(true);
  const { mutate } = useSWRConfig();

  // 2. Çeviri kancasını tanımla (Path: ProjectDetails.backlogView)
  const t = useTranslations("ProjectDetails.backlogView");

  return (
    <div className="flex flex-col gap-4  w-full max-w-6xl mx-auto ">
      {/* 1. SPRINTLER LİSTESİ */}
      <div className="space-y-4">
        {sprints.map((sprint) => (
          <Card key={sprint.id} className="border-slate-200 shadow-sm h-fit">
            <CardHeader className="p-2 px-3 bg-slate-50/50 border-b flex flex-row justify-between items-center space-y-0 rounded-t-xl">
              <div className="flex items-center gap-3">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  {sprint.name}
                </CardTitle>
                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                  {sprint.startDate
                    ? new Date(sprint.startDate).toLocaleDateString()
                    : t("sprint.noDate")}{" "}
                  -{" "}
                  {sprint.endDate
                    ? new Date(sprint.endDate).toLocaleDateString()
                    : t("sprint.noDate")}
                </span>
                <span className="text-xs bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600 font-medium">
                  {/* Dinamik Görev Sayısı */}
                  {t("sprint.issuesCount", { count: sprint.issues.length })}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-white px-2"
              >
                {t("sprint.editBtn")}
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="bg-white">
                {sprint.issues.length > 0 ? (
                  sprint.issues.map((issue) => (
                    <IssueItem
                      key={issue.id}
                      issue={issue}
                      projectKey={project.projectKey}
                      members={project.members}
                    />
                  ))
                ) : (
                  <div className="h-12 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-slate-100 m-2 rounded bg-slate-50/30">
                    {t("sprint.dragPlaceholder")}
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100">
                <InlineIssueCreator
                  projectId={project.id}
                  sprintId={sprint.id}
                  isSprint={true}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. BACKLOG ALANI */}
      <Card className="border-slate-200 shadow-sm h-fit">
        <CardHeader className="px-3 bg-slate-50/50 sticky top-0 z-10 flex flex-row justify-between items-center space-y-0 rounded-t-xl backdrop-blur-sm">
          <div
            className="flex items-center gap-2 cursor-pointer group select-none"
            onClick={() => setIsBacklogOpen(!isBacklogOpen)}
          >
            {isBacklogOpen ? (
              <ChevronDown size={16} className="text-slate-500" />
            ) : (
              <ChevronRight size={16} className="text-slate-500" />
            )}
            <CardTitle className="text-sm font-semibold text-slate-800">
              {t("backlog.title")}
            </CardTitle>
            <span className="text-xs text-muted-foreground bg-slate-200/60 px-2 py-0.5 rounded-full">
              {/* Dinamik Görev Sayısı */}
              {t("backlog.issuesCount", { count: issues.length })}
            </span>
          </div>
        </CardHeader>
        {isBacklogOpen && (
          <CardContent className="p-3 bg-white ">
            {issues.length > 0 ? (
              issues.map((issue) => (
                <IssueItem
                  key={issue.id}
                  issue={issue}
                  projectKey={project.projectKey}
                  members={project.members}
                />
              ))
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-1">
                <p>{t("backlog.emptyTitle")}</p>
                <p className="text-xs opacity-50">
                  {t("backlog.emptyDescription")}
                </p>
              </div>
            )}

            <div className="border-t border-slate-100">
              <InlineIssueCreator projectId={project.id} isSprint={false} />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
