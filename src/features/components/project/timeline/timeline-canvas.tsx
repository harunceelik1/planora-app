"use client";

import { useEffect, useRef } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Calendar, MoveRight } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Mobil cihazlarda sayfa açıldığında otomatik olarak "Bugün" çizgisine kaydırır (UX İyileştirmesi)
  useEffect(() => {
    if (showToday && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayPosition = todayOffset * DAY_W;
      const fallbackOffset = container.clientWidth / 3; // Çizgiyi ekranın 1/3'üne ortalar
      
      container.scrollTo({
        left: todayPosition - fallbackOffset,
        behavior: "smooth",
      });
    }
  }, [showToday, todayOffset]);

  const totalGroupsHeight = data.groups.reduce((acc, group) => {
    const bodyH = collapsed.has(group.label) ? 0 : group.laneCount * ROW_H;
    return acc + SPRINT_H + bodyH;
  }, 0);

  return (
    <div className="group/timeline relative w-full rounded-2xl border border-border/80 bg-background/50 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-md">
      
      {/* Mobil Kaydırma İndikatörü (Sadece küçük ekranlarda görünür, kullanıcı kaydırdıkça kaybolur) */}
      <div className="pointer-events-none absolute right-4 bottom-4 z-30 flex items-center gap-2 rounded-full bg-foreground/90 px-3 py-1.5 text-[11px] font-medium text-background opacity-0 shadow-lg transition-opacity duration-500 md:hidden group-hover/timeline:opacity-100 animate-pulse">
        <span>Sağa Kaydırın</span>
        <MoveRight className="h-3 w-3" />
      </div>

      {/* Ana Kaydırma Kapsayıcısı (Özel Scrollbar ve Akıcı Kaydırma ile) */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto rounded-2xl scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scroll-smooth"
      >
        <div 
          className="relative transition-all duration-200" 
          style={{ minWidth: data.totalDays * DAY_W }}
        >
          
          {/* ══ DATE HEADER (Sabit Cam Efektli Üst Bölüm) ══ */}
          <div
            className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md select-none"
            style={{ height: HEADER_H }}
          >
            {/* Month band */}
            <div className="flex overflow-hidden" style={{ height: HEADER_H / 2 }}>
              {data.months.map((m, i) => (
                <div
                  key={i}
                  className="flex shrink-0 items-center justify-center border-b border-r border-border/40 bg-muted/30 px-3 transition-colors hover:bg-muted/50"
                  style={{ width: m.days * DAY_W }}
                >
                  <span className="truncate text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90">
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
                      "absolute top-0 flex h-full flex-col items-center justify-center border-r transition-colors",
                      isMonday  ? "border-border/60" : "border-border/10",
                      isWeekend ? "bg-muted/20 dark:bg-muted/5" : "",
                    )}
                    style={{ left: i * DAY_W, width: DAY_W }}
                  >
                    {isMonday && (
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-0.5">
                          {format.dateTime(d, { weekday: "short" })}
                        </span>
                        <span className="text-[10px] md:text-[11px] font-black text-foreground/70">
                          {format.dateTime(d, { day: "numeric" })}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══ BODY ══ */}
          <div className="relative">

            {/* Today Line (Daha Profesyonel Pulse Efektli Gösterge) */}
            {showToday && (
              <div
                className="pointer-events-none absolute top-0 z-20 w-px bg-destructive/60"
                style={{
                  left: todayOffset * DAY_W + DAY_W / 2,
                  height: totalGroupsHeight,
                }}
              >
                <div className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-destructive px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-md shadow-destructive/20 backdrop-blur-sm">
                  Bugün
                </div>
              </div>
            )}

            {/* Weekend Shading Layer */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-0"
              style={{ height: totalGroupsHeight }}
            >
              {Array.from({ length: data.totalDays }, (_, i) => {
                const dow = addDays(data.minDate, i).getDay();
                if (dow !== 0 && dow !== 6) return null;
                return (
                  <div
                    key={i}
                    className="absolute top-0 h-full bg-muted/10 dark:bg-muted/5"
                    style={{ left: i * DAY_W, width: DAY_W }}
                  />
                );
              })}
            </div>

            {/* ══ SPRINT GROUPS (Flow Stack) ══ */}
            {data.groups.map((group) => {
              const isCollapsed = collapsed.has(group.label);
              const bodyH       = isCollapsed ? 0 : group.laneCount * ROW_H;

              return (
                <div key={group.label} className="relative z-10 border-b border-border/40 last:border-b-0 bg-background/20">

                  {/* ── Sprint Header Row ── */}
                  <div
                    className={cn(
                      "relative border-b border-border/30 bg-muted/10 transition-colors duration-150",
                      isCollapsed && "bg-muted/20"
                    )}
                    style={{ height: SPRINT_H }}
                  >
                    {/* Grid Ticks */}
                    {data.mondayTicks.map((d) => (
                      <div
                        key={d}
                        className="absolute top-0 h-full w-px bg-border/20"
                        style={{ left: d * DAY_W }}
                      />
                    ))}

                    {/* Sprint Pill */}
                    {group.sprint ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-primary/20 bg-primary/5 px-2.5 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:shadow-xs"
                            style={{
                              top: (SPRINT_H - 28) / 2,
                              height: 28,
                              left: group.startDay * DAY_W + 4,
                              width: Math.max((group.endDay - group.startDay + 1) * DAY_W - 8, 80),
                            }}
                          >
                            <Calendar className="h-3 w-3 shrink-0 text-primary/70" />
                            <span className="truncate text-[11px] font-bold tracking-tight text-primary">
                              {group.label}
                            </span>
                            {group.sprint.endDate && (
                              <span className="ml-auto shrink-0 font-mono text-[9px] font-semibold bg-primary/10 px-1.5 py-0.5 rounded text-primary/80 hidden sm:inline-block">
                                {safeFormat(group.sprint.endDate, { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-xl px-3 py-2 shadow-xl border border-border/50 backdrop-blur-md bg-popover/95">
                          <p className="text-[12px] font-bold text-foreground">{group.label}</p>
                          {group.sprint.startDate && group.sprint.endDate && (
                            <p className="mt-1 font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                              <span>{safeFormat(group.sprint.startDate, { dateStyle: "medium" })}</span>
                              <span>→</span>
                              <span>{safeFormat(group.sprint.endDate, { dateStyle: "medium" })}</span>
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div
                        className="absolute flex items-center px-4"
                        style={{ top: 0, height: SPRINT_H }}
                      >
                        <span className="text-[11px] font-semibold italic text-muted-foreground/50 tracking-wide">
                          {group.label}
                        </span>
                        {isCollapsed && (
                          <span className="ml-2 text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full uppercase scale-90">
                            Gizli
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Issue Lanes ── */}
                  {!isCollapsed && bodyH > 0 && (
                    <div
                      className="relative bg-background/30 transition-all duration-300"
                      style={{ height: bodyH }}
                    >
                      {/* Monday Grid Lines */}
                      {data.mondayTicks.map((d) => (
                        <div
                          key={d}
                          className="absolute top-0 h-full w-px bg-border/10"
                          style={{ left: d * DAY_W }}
                        />
                      ))}

                      {/* Row Separator Lines */}
                      {Array.from({ length: group.laneCount }, (_, lane) => (
                        <div
                          key={lane}
                          className="absolute w-full border-b border-border/15"
                          style={{ top: (lane + 1) * ROW_H - 1 }}
                        />
                      ))}

                      {/* Issue Bars */}
                      {group.items.map(({ issue, startDay, durationDays, lane }) => {
                        const s = STATUS_STYLES[issue.status] ?? STATUS_STYLES.TODO;
                        const p = PRIORITY_STRIPE[issue.priority] ?? "bg-muted-foreground/30";
                        const barW = Math.max(durationDays * DAY_W - 6, 28);
                        const barH = ROW_H - 12;

                        return (
                          <Tooltip key={issue.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "absolute flex cursor-pointer select-none items-center overflow-hidden",
                                  "rounded-lg border shadow-xs transition-all duration-200",
                                  "hover:-translate-y-[0.5px] hover:shadow-md hover:filter hover:brightness-105 active:scale-[0.99]",
                                  s.bar,
                                )}
                                style={{
                                  left: startDay * DAY_W + 4,
                                  top: lane * ROW_H + 6,
                                  width: barW,
                                  height: barH,
                                }}
                              >
                                {/* Sol Kenar Öncelik Şeridi */}
                                <div className={cn("h-full w-1 shrink-0 opacity-90", p)} />

                                {/* İş Unvanı */}
                                <span className="truncate px-2.5 font-sans text-[11px] font-bold text-white tracking-wide antialiased drop-shadow-xs">
                                  {issue.title}
                                </span>

                                {/* Gün Rozeti */}
                                {durationDays > 2 && barW > 55 && (
                                  <span className="ml-auto mr-2 shrink-0 rounded bg-white/15 backdrop-blur-xs px-1.5 py-0.5 font-mono text-[9px] font-bold text-white/90">
                                    {durationDays}g
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>

                            {/* Detaylı ve Premium Tooltip */}
                            <TooltipContent
                              side="top"
                              align="start"
                              sideOffset={6}
                              className="w-72 overflow-hidden rounded-xl border border-border/50 p-0 shadow-2xl bg-popover/98 backdrop-blur-lg animate-in fade-in-50 zoom-in-95 duration-150"
                            >
                              <div className="flex items-start justify-between gap-3 bg-muted/30 px-4 py-3 border-b border-border/50">
                                <div className="min-w-0">
                                  <p className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                                    {project.projectKey}-{issue.number}
                                  </p>
                                  <p className="mt-1 text-[13px] font-bold leading-snug text-foreground tracking-tight">
                                    {issue.title}
                                  </p>
                                </div>
                                <span className={cn(
                                  "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-2xs",
                                  s.badge,
                                )}>
                                  {issue.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3 text.5 text-[11px] md:text-[12px]">
                                <span className="text-muted-foreground font-medium">Öncelik</span>
                                <span className="font-bold text-foreground flex items-center gap-1.5">
                                  <span className={cn("h-1.5 w-1.5 rounded-full", p)} />
                                  {issue.priority}
                                </span>

                                <span className="text-muted-foreground font-medium">Süre</span>
                                <span className="font-bold text-foreground font-mono">{durationDays} Gün</span>

                                {issue.dueDate && (
                                  <>
                                    <span className="text-muted-foreground font-medium">Bitiş Tarihi</span>
                                    <span className="font-bold text-foreground font-mono">
                                      {safeFormat(issue.dueDate, { dateStyle: "medium" })}
                                    </span>
                                  </>
                                )}

                                <span className="text-muted-foreground font-medium">
                                  {t("views.timeline.assigneeLabel")}
                                </span>
                                <span className="flex items-center gap-1.5 font-bold text-foreground truncate">
                                  <User className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                  <span className="truncate">
                                    {issue.assignee?.name || t("views.board.noAssignee")}
                                  </span>
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
    </div>
  );
}