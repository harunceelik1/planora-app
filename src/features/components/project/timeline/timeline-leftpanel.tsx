"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import {
  HEADER_H,
  ROW_H,
  SPRINT_H,
  STATUS_STYLES,
  TimelineData,
} from "@/types/timeline.types";

interface TimelineLeftPanelProps {
  project: Project;
  data: TimelineData;
  collapsed: Set<string>;
  onToggle: (label: string) => void;
}

export function TimelineLeftPanel({
  project,
  data,
  collapsed,
  onToggle,
}: TimelineLeftPanelProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-background">

      {/* ── Header — must match canvas HEADER_H exactly ── */}
      <div
        className="flex items-end border-b border-border bg-muted/40 px-4 pb-2.5"
        style={{ height: HEADER_H }}
      >
        <span className="select-none text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
          {project.projectName}
        </span>
      </div>

      {/* ── Groups — must mirror canvas group structure ── */}
      {data.groups.map((group) => {
        const isCollapsed = collapsed.has(group.label);

        return (
          <div key={group.label} className="border-b border-border last:border-b-0">

            {/* Sprint header — must match SPRINT_H exactly */}
            <button
              type="button"
              onClick={() => onToggle(group.label)}
              style={{ height: SPRINT_H }}
              className="group flex w-full items-center gap-2 border-b border-border bg-muted/20 px-3 text-left transition-colors hover:bg-muted/40"
            >
              <span className="text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70">
                {isCollapsed
                  ? <ChevronRight className="h-3.5 w-3.5" />
                  : <ChevronDown  className="h-3.5 w-3.5" />
                }
              </span>

              <span className="truncate text-[12px] font-semibold text-foreground/80">
                {group.label}
              </span>

              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                {group.items.length}
              </span>
            </button>

            {/* Lane rows — each must match ROW_H exactly */}
            {!isCollapsed &&
              Array.from({ length: group.laneCount }, (_, lane) => {
                const laneIssues = group.items.filter((i) => i.lane === lane);
                const single     = laneIssues.length === 1 ? laneIssues[0] : null;

                return (
                  <div
                    key={lane}
                    style={{ height: ROW_H }}
                    className="flex items-center gap-2 border-b border-border/30 bg-background px-3 last:border-b-0"
                  >
                    {single ? (
                      <>
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            STATUS_STYLES[single.issue.status]?.dot ?? "bg-slate-400",
                          )}
                        />
                        <span className="shrink-0 font-mono text-[10px] font-medium tabular-nums text-muted-foreground">
                          {project.projectKey}-{single.issue.number}
                        </span>
                        <span className="truncate text-[12px] text-foreground/70">
                          {single.issue.title}
                        </span>
                      </>
                    ) : laneIssues.length > 1 ? (
                      <span className="text-[11px] italic text-muted-foreground/60">
                        {laneIssues.length} issues
                      </span>
                    ) : (
                      <span className="select-none text-[11px] text-muted-foreground/30">—</span>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}