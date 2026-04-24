"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { HEADER_H, ROW_H, SPRINT_H, STATUS_STYLES, TimelineData } from "@/types/timeline.types";

interface TimelineLeftPanelProps {
  project: Project;
  data: TimelineData;
  collapsed: Set<string>;
  onToggle: (label: string) => void;
}

export function TimelineLeftPanel({ project, data, collapsed, onToggle }: TimelineLeftPanelProps) {
  return (
    <>
      {/* Header spacer */}
      <div
        className="flex items-end border-b bg-muted/30 px-4 pb-2"
        style={{ height: HEADER_H }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {project.projectName}
        </span>
      </div>

      {/* Sprint groups */}
      {data.groups.map((group) => {
        const isCollapsed = collapsed.has(group.label);
        return (
          <div key={group.label} className="border-b last:border-b-0">
            {/* Sprint toggle button */}
            <button
              type="button"
              onClick={() => onToggle(group.label)}
              className="flex w-full items-center gap-2 border-b bg-muted/25 px-4 text-left transition-colors hover:bg-muted/40"
              style={{ height: SPRINT_H }}
            >
              {isCollapsed
                ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                : <ChevronDown  className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              }
              <span className="truncate text-xs font-semibold text-foreground">
                {group.label}
              </span>
              <Badge variant="secondary" className="ml-auto h-5 shrink-0 text-[10px]">
                {group.items.length}
              </Badge>
            </button>

            {/* Lane rows */}
            {!isCollapsed && Array.from({ length: group.laneCount }, (_, lane) => {
              const laneIssues = group.items.filter((i) => i.lane === lane);
              return (
                <div
                  key={lane}
                  className="flex items-center gap-2 border-b border-border/30 px-4 last:border-b-0"
                  style={{ height: ROW_H }}
                >
                  {laneIssues.length === 1 ? (
                    <>
                      <span className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        STATUS_STYLES[laneIssues[0].issue.status]?.dot ?? "bg-slate-400",
                      )} />
                      <span className="truncate text-xs text-foreground">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {project.projectKey}-{laneIssues[0].issue.number}
                        </span>
                        {" "}{laneIssues[0].issue.title}
                      </span>
                    </>
                  ) : laneIssues.length > 1 ? (
                    <span className="truncate text-[10px] text-muted-foreground italic">
                      {laneIssues.length} issues
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40">—</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}