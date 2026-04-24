"use client";

import { useFormatter, useTranslations } from "next-intl";
import { CalendarRange, Flag, Layers3, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { STATUS_STYLES, TimelineData } from "@/types/timeline.types";

interface TimelineHeaderProps {
  project: Project;
  data: TimelineData;
}

export function TimelineHeader({ project, data }: TimelineHeaderProps) {
  const t = useTranslations("ProjectDetails");
  const format = useFormatter();

  const totalIssues  = data.groups.reduce((s, g) => s + g.items.length, 0);
  const totalSprints = data.groups.filter((g) => g.sprint !== null).length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-card/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <CalendarRange className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">{t("views.timeline.title")}</span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <Badge variant="outline" className="h-6 text-xs">{project.projectKey}</Badge>
        <Badge variant="secondary" className="h-6 text-xs">{project.projectName}</Badge>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1.5 text-xs">
          <Timer className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t("views.timeline.summary.range")}:</span>
          <span className="font-semibold">
            {format.dateTime(data.minDate, { month: "short", day: "2-digit" })} –{" "}
            {format.dateTime(data.maxDate, { month: "short", day: "2-digit", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Layers3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t("views.timeline.summary.datedIssues")}:</span>
          <span className="font-semibold">{totalIssues}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Flag className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t("views.timeline.summary.sprints")}:</span>
          <span className="font-semibold">{totalSprints}</span>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-3 m-4">
        {Object.entries(STATUS_STYLES).map(([status, c]) => (
          <div key={status} className="flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-full", c.dot)} />
            <span className="text-[10px] text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>
    </>
  );
}