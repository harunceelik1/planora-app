"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import {
  DAY_W,
  HEADER_H,
  PRIORITY_STRIPE,
  ROW_H,
  SPRINT_H,
  STATUS_STYLES,
  TimelineData,
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

  const safeFormat = (
    dateLike?: string | Date | null,
    opts?: Intl.DateTimeFormatOptions,
  ) => {
    if (!dateLike) return "";
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (isNaN(d.getTime())) return "";
    try { return format.dateTime(d, opts as any); } catch { return ""; }
  };

  const todayOffset = diffDays(data.minDate, new Date());
  const showToday   = todayOffset >= 0 && todayOffset < data.totalDays;

  // Total canvas height for absolute overlays (today line, weekend shading)
  const totalGroupsHeight = data.groups.reduce((acc, group) => {
    const bodyH = collapsed.has(group.label) ? 0 : group.laneCount * ROW_H;
    return acc + SPRINT_H + bodyH;
  }, 0);

  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-border bg-background shadow-sm">
      
      <div 
        className="relative" 
        style={{ minWidth: data.totalDays * DAY_W }}
      >
        
        {/* ══ DATE HEADER ══ */}
        <div
          className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm"
          style={{ height: HEADER_H }}
        >
          {/* Month band */}
          <div className="flex overflow-hidden" style={{ height: HEADER_H / 2 }}>
            {data.months.map((m, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center justify-center border-b border-r border-border bg-muted/40 px-3"
                style={{ width: m.days * DAY_W }}
              >
                <span className="select-none truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* Day band */}
          <div className="relative overflow-hidden" style={{ height: HEADER_H / 2 }}>
            {Array.from({ length: data.totalDays }, (_, i) => {
              const d   = addDays(data.minDate, i);
              const dow = d.getDay();
              const isMonday  = dow === 1;
              const isWeekend = dow === 0 || dow === 6;
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute top-0 flex h-full flex-col items-center justify-center border-r",
                    isMonday  ? "border-border" : "border-border/20",
                    isWeekend ? "bg-muted/30"   : "",
                  )}
                  style={{ left: i * DAY_W, width: DAY_W }}
                >
                  {isMonday && (
                    <>
                      <span className="select-none text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        {format.dateTime(d, { weekday: "short" })}
                      </span>
                      <span className="select-none text-[11px] font-bold leading-tight text-foreground/80">
                        {format.dateTime(d, { day: "numeric" })}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ BODY (groups stack in normal flow) ══ */}
        <div className="relative">

          {/* Today line — spans full body height */}
          {showToday && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-px bg-destructive"
              style={{
                left:   todayOffset * DAY_W + DAY_W / 2,
                height: totalGroupsHeight,
              }}
            >
              <div className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-b-md bg-destructive px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive-foreground shadow-lg">
                Today
              </div>
            </div>
          )}

          {/* Weekend shading — spans full body height */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: totalGroupsHeight }}
          >
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

          {/* ══ SPRINT GROUPS (normal flow, stack vertically) ══ */}
          {data.groups.map((group) => {
            const isCollapsed = collapsed.has(group.label);
            const bodyH       = isCollapsed ? 0 : group.laneCount * ROW_H;

            return (
              <div key={group.label} className="border-b border-border last:border-b-0">

                {/* ── Sprint header row ── */}
                <div
                  className="relative border-b border-border bg-muted/20"
                  style={{ height: SPRINT_H }}
                >
                  {/* Monday grid ticks */}
                  {data.mondayTicks.map((d) => (
                    <div
                      key={d}
                      className="absolute top-0 h-full w-px bg-border/40"
                      style={{ left: d * DAY_W }}
                    />
                  ))}

                  {/* Sprint pill — only rendered when sprint exists */}
                  {group.sprint ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute flex cursor-default items-center gap-2 overflow-hidden rounded-md border border-primary/30 bg-primary/10 px-3 transition-colors hover:bg-primary/20"
                          style={{
                            top:    (SPRINT_H - 28) / 2,
                            height: 28,
                            left:   group.startDay * DAY_W + 4,
                            width:  Math.max((group.endDay - group.startDay + 1) * DAY_W - 8, 64),
                          }}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                          <span className="truncate text-[12px] font-semibold text-primary">
                            {group.label}
                          </span>
                          {group.sprint.endDate && (
                            <span className="ml-auto shrink-0 text-[10px] font-medium text-primary/60">
                              {safeFormat(group.sprint.endDate, { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-[13px] font-bold">{group.label}</p>
                        {group.sprint.startDate && group.sprint.endDate && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {safeFormat(group.sprint.startDate, { dateStyle: "medium" })}
                            {" → "}
                            {safeFormat(group.sprint.endDate, { dateStyle: "medium" })}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    /* No Sprint — just show the label text, no pill */
                    <div
                      className="absolute flex items-center px-4"
                      style={{ top: 0, height: SPRINT_H }}
                    >
                      <span className="text-[11px] font-semibold italic text-muted-foreground/60">
                        {group.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Issue lanes ── */}
                {!isCollapsed && bodyH > 0 && (
                  <div
                    className="relative bg-background"
                    style={{ height: bodyH }}
                  >
                    {/* Monday grid lines */}
                    {data.mondayTicks.map((d) => (
                      <div
                        key={d}
                        className="absolute top-0 h-full w-px bg-border/25"
                        style={{ left: d * DAY_W }}
                      />
                    ))}

                    {/* Row separator lines */}
                    {Array.from({ length: group.laneCount }, (_, lane) => (
                      <div
                        key={lane}
                        className="absolute w-full border-b border-border/30"
                        style={{ top: (lane + 1) * ROW_H - 1 }}
                      />
                    ))}

                    {/* Issue bars */}
                    {group.items.map(({ issue, startDay, durationDays, lane }) => {
                      const s    = STATUS_STYLES[issue.status] ?? STATUS_STYLES.TODO;
                      const p    = PRIORITY_STRIPE[issue.priority] ?? "bg-muted-foreground/40";
                      const barW = Math.max(durationDays * DAY_W - 6, 24);
                      const barH = ROW_H - 12;

                      return (
                        <Tooltip key={issue.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "absolute flex cursor-pointer select-none items-center overflow-hidden",
                                "rounded-md border shadow-sm",
                                "transition-all duration-150 hover:-translate-y-px hover:shadow-md",
                                s.bar,
                              )}
                              style={{
                                left:   startDay * DAY_W + 4,
                                top:    lane * ROW_H + 6,
                                width:  barW,
                                height: barH,
                              }}
                            >
                              {/* Priority accent stripe */}
                              <div className={cn("h-full w-1 shrink-0", p)} />

                              {/* Title */}
                              <span className="truncate px-2 text-[11px] font-semibold text-white drop-shadow-sm">
                                {issue.title}
                              </span>

                              {/* Duration badge */}
                              {durationDays > 3 && (
                                <span className="ml-auto mr-1.5 shrink-0 rounded bg-secondary px-1 py-px text-[9px] font-bold text-secondary-foreground">
                                  {durationDays}d
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>

                          {/* Tooltip */}
                          <TooltipContent
                            side="top"
                            align="start"
                            className="w-72 overflow-hidden rounded-xl p-0 shadow-xl"
                          >
                            <div className="flex items-start justify-between gap-3 bg-card px-4 py-3 border-b border-border">
                              <div className="min-w-0">
                                <p className="font-mono text-[10px] font-semibold text-muted-foreground">
                                  {project.projectKey}-{issue.number}
                                </p>
                                <p className="mt-0.5 text-[13px] font-semibold leading-snug text-foreground">
                                  {issue.title}
                                </p>
                              </div>
                              <span className={cn(
                                "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                s.badge,
                              )}>
                                {issue.status}
                              </span>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-[12px]">
                              <span className="text-muted-foreground">Priority</span>
                              <span className="font-semibold">{issue.priority}</span>

                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-semibold">{durationDays}d</span>

                              {issue.dueDate && (
                                <>
                                  <span className="text-muted-foreground">Due</span>
                                  <span className="font-semibold">
                                    {safeFormat(issue.dueDate, { dateStyle: "medium" })}
                                  </span>
                                </>
                              )}

                              <span className="text-muted-foreground">
                                {t("views.timeline.assigneeLabel")}
                              </span>
                              <span className="flex items-center gap-1.5 font-semibold">
                                <User className="h-3 w-3 shrink-0 text-muted-foreground" />
                                {issue.assignee?.name || t("views.board.noAssignee")}
                              </span>
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
        </div>
      </div>
    </div>
  );
}