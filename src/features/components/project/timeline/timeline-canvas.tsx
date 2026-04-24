"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import {
  DAY_W, HEADER_H, PRIORITY_STRIPE, ROW_H, SPRINT_H,
  STATUS_STYLES, TimelineData,
} from "@/types/timeline.types";
import { addDays, diffDays } from "@/features/components/project/timeline/timeline.utils";

interface TimelineCanvasProps {
  project: Project;
  data: TimelineData;
  collapsed: Set<string>;
}

export function TimelineCanvas({ project, data, collapsed }: TimelineCanvasProps) {
  const t = useTranslations("ProjectDetails");
  const format = useFormatter();

  const safeFormat = (dateLike?: string | Date | null, opts?: Intl.DateTimeFormatOptions) => {
    if (!dateLike) return "";
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (isNaN(d.getTime())) return "";
    try {
      return format.dateTime(d, opts as any);
    } catch {
      return "";
    }
  };

  const todayOffset = diffDays(data.minDate, new Date());
  const showToday   = todayOffset >= 0 && todayOffset < data.totalDays;

  return (
    <>
      {/* ── Date Header ── */}
      <div
        className="sticky top-0 z-20 border-b bg-card/98 backdrop-blur-sm"
        style={{ height: HEADER_H }}
      >
        {/* Month band */}
        <div className="flex overflow-hidden" style={{ height: HEADER_H / 2 }}>
          {data.months.map((m, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center justify-center border-b border-r bg-muted/25 px-2"
              style={{ width: m.days * DAY_W }}
            >
              <span className="truncate text-[11px] font-semibold text-foreground">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Week band */}
        <div className="relative overflow-hidden" style={{ height: HEADER_H / 2 }}>
          {Array.from({ length: data.totalDays }, (_, i) => {
            const d = addDays(data.minDate, i);
            const dow = d.getDay();
            const isMonday  = dow === 1;
            const isWeekend = dow === 0 || dow === 6;
            return (
              <div
                key={i}
                className={cn(
                  "absolute top-0 flex h-full flex-col items-center justify-center border-r",
                  isMonday  ? "border-border/50" : "border-border/15",
                  isWeekend ? "bg-muted/20" : "",
                )}
                style={{ left: i * DAY_W, width: DAY_W }}
              >
                {isMonday && (
                  <>
                    <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">
                      {format.dateTime(d, { weekday: "short" })}
                    </span>
                    <span className="text-[10px] font-semibold leading-none text-foreground">
                      {format.dateTime(d, { day: "numeric" })}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Today Line ── */}
      {showToday && (
        <div
          className="pointer-events-none absolute z-10 w-px bg-rose-500"
          style={{ left: todayOffset * DAY_W + DAY_W / 2, top: 0, bottom: 0 }}
        >
          <div className="absolute -top-0 left-1/2 -translate-x-1/2 rounded-b-sm bg-rose-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white">
            TODAY
          </div>
        </div>
      )}

      {/* ── Weekend Shading ── */}
      <div className="pointer-events-none absolute inset-x-0" style={{ top: HEADER_H, bottom: 0 }}>
        {Array.from({ length: data.totalDays }, (_, i) => {
          const dow = addDays(data.minDate, i).getDay();
          if (dow !== 0 && dow !== 6) return null;
          return (
            <div
              key={i}
              className="absolute top-0 h-full bg-muted/20"
              style={{ left: i * DAY_W, width: DAY_W }}
            />
          );
        })}
      </div>

      {/* ── Sprint Groups ── */}
      {data.groups.map((group) => {
        const isCollapsed = collapsed.has(group.label);
        const bodyH = isCollapsed ? 0 : group.laneCount * ROW_H;

        return (
          <div key={group.label} className="border-b last:border-b-0">
            {/* Sprint bar row */}
            <div className="relative border-b bg-muted/15" style={{ height: SPRINT_H }}>
              {data.mondayTicks.map((d) => (
                <div key={d} className="absolute top-0 h-full w-px bg-border/30" style={{ left: d * DAY_W }} />
              ))}

              {group.sprint && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute flex cursor-default items-center gap-2 overflow-hidden rounded-lg border border-primary/35 bg-primary/12 px-3 shadow-sm"
                      style={{
                        top: (SPRINT_H - 28) / 2,
                        height: 28,
                        left: group.startDay * DAY_W + 2,
                        width: Math.max((group.endDay - group.startDay + 1) * DAY_W - 4, 60),
                      }}
                    >
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-primary/30" />
                      <span className="truncate text-xs font-bold text-primary">{group.label}</span>
                      {group.sprint.endDate && (
                        <span className="ml-auto shrink-0 text-[10px] font-medium text-primary/70">
                          {safeFormat(group.sprint.endDate, { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-semibold">{group.label}</p>
                    {group.sprint.startDate && group.sprint.endDate && (
                      <p className="text-[11px] text-muted-foreground">
                        {safeFormat(group.sprint.startDate, { dateStyle: "medium" })}
                        {" → "}
                        {safeFormat(group.sprint.endDate, { dateStyle: "medium" })}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Issue lanes */}
            {!isCollapsed && (
              <div className="relative" style={{ height: bodyH }}>
                {data.mondayTicks.map((d) => (
                  <div key={d} className="absolute top-0 h-full w-px bg-border/20" style={{ left: d * DAY_W }} />
                ))}
                {Array.from({ length: group.laneCount }, (_, lane) => (
                  <div
                    key={lane}
                    className="absolute w-full border-b border-border/20"
                    style={{ top: (lane + 1) * ROW_H - 1 }}
                  />
                ))}

                {group.items.map(({ issue, startDay, durationDays, lane }) => {
                  const s = STATUS_STYLES[issue.status] ?? STATUS_STYLES.TODO;
                  const p = PRIORITY_STRIPE[issue.priority] ?? "bg-slate-400";
                  const barW = Math.max(durationDays * DAY_W - 4, 28);

                  return (
                    <Tooltip key={issue.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "absolute flex cursor-pointer items-center overflow-hidden rounded-md border shadow-sm transition-all hover:brightness-110 hover:shadow-md",
                            s.bar,
                          )}
                          style={{
                            left: startDay * DAY_W + 2,
                            top: lane * ROW_H + 5,
                            width: barW,
                            height: ROW_H - 10,
                          }}
                        >
                          <div className={cn("h-full w-1 shrink-0", p)} />
                          <span className="truncate px-1.5 text-[11px] font-semibold text-white drop-shadow-sm">
                            {issue.title}
                          </span>
                          {durationDays > 4 && (
                            <span className="ml-auto mr-1 shrink-0 rounded bg-black/25 px-1 text-[9px] font-bold text-white/90">
                              {durationDays}d
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="w-72 p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-tight">
                              {project.projectKey}-{issue.number} · {issue.title}
                            </p>
                            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", s.badge)}>
                              {issue.status}
                            </span>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <span className="text-muted-foreground">Priority</span>
                            <span className="font-medium">{issue.priority}</span>
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">{durationDays} days</span>
                            {issue.dueDate && (
                              <>
                                <span className="text-muted-foreground">Due</span>
                                <span className="font-medium">
                                  {safeFormat(issue.dueDate, { dateStyle: "medium" })}
                                </span>
                              </>
                            )}
                            <span className="text-muted-foreground">{t("views.timeline.assigneeLabel")}</span>
                            <span className="flex items-center gap-1 font-medium">
                              <User className="h-3 w-3" />
                              {issue.assignee?.name || t("views.board.noAssignee")}
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}