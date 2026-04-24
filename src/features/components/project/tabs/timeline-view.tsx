"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Project } from "@/types/project";
import { buildTimelineData } from "@/features/components/project/timeline/timeline.utils";

import { DAY_W, LEFT_W } from "@/types/timeline.types";
import { TimelineHeader } from "../timeline/timeline-header";
import { TimelineLeftPanel } from "../timeline/timeline-leftpanel";
import { TimelineCanvas } from "../timeline/timeline-canvas";

interface TimelineViewProps {
  project: Project;
}

export default function TimelineView({ project }: TimelineViewProps) {
  const t = useTranslations("ProjectDetails");
  const format = useFormatter();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const data = useMemo(
    () => buildTimelineData(project, (date) =>
      format.dateTime(date, { month: "long", year: "numeric" }),
    ),
    [project.issues, project.sprints],
  );

  const toggle = (label: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  // ── Empty state ──
  if (!data) {
    return (
      <Card className="flex h-full items-center justify-center border-dashed bg-card/50">
        <CardContent className="flex max-w-xl flex-col items-center px-8 py-14 text-center">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary">
            <CalendarRange className="h-8 w-8" />
          </div>
          <p className="mt-5 text-lg font-semibold">{t("views.timeline.emptyTitle")}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("views.timeline.emptyDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const canvasW = data.totalDays * DAY_W;

  return (
    <TooltipProvider delayDuration={80}>
      <div className="flex h-full flex-col gap-2 overflow-hidden">

        <TimelineHeader project={project} data={data} />

        <Card className="min-h-0 flex-1 overflow-hidden border-border/70 bg-card/70">
          <CardContent className="h-full p-0">
            <ScrollArea className="h-full">
              <div className="flex" style={{ minWidth: LEFT_W + canvasW }}>

                {/* Left label panel */}
                <div
                  className="sticky left-0 z-30 flex-shrink-0 border-r bg-card/98 backdrop-blur-sm"
                  style={{ width: LEFT_W }}
                >
                  <TimelineLeftPanel
                    project={project}
                    data={data}
                    collapsed={collapsed}
                    onToggle={toggle}
                  />
                </div>

                {/* Right canvas */}
                <div className="relative" style={{ width: canvasW }}>
                  <TimelineCanvas
                    project={project}
                    data={data}
                    collapsed={collapsed}
                  />
                </div>

              </div>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </TooltipProvider>
  );
}