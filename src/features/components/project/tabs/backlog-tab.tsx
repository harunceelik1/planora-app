"use client";

import { useTranslations } from "next-intl"; // 1. Import ekledik
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BacklogView from "@/features/components/project/backlog/backlog-view";

export function BacklogTab({ project }: { project: any }) {
  // 2. Hook'u tanımlıyoruz.
  // "ProjectDetails" namespace'ini kullanıyoruz.
  const t = useTranslations("ProjectDetails");

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 gap-6">
      {/* 🟢 SPRINT ALANI */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <div className="flex items-center gap-3">
            <button className="hover:bg-slate-200 dark:hover:bg-slate-800 p-1 rounded transition-colors">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {/* Sprint Başlığı: Dinamik numara alabilir */}
                <h3 className="font-semibold text-sm">
                  {t("sprintPanel.title", { number: 1 })}
                </h3>
                {/* Görev Sayısı: Dinamik sayı alabilir */}
                <span className="text-xs text-muted-foreground">
                  {t("sprintPanel.taskCount", { count: 0 })}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("sprintPanel.statusUnplanned")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "h-8 text-xs opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800",
              )}
            >
              {t("sprintPanel.startBtn")}
            </div>
            <button className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Boş Durum (Empty State) */}
        <div className="min-h-[120px] p-2">
          <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-8 gap-2 bg-slate-50/30 dark:bg-slate-900/10">
            <p className="text-sm text-muted-foreground font-medium">
              {t("sprintPanel.empty.title")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("sprintPanel.empty.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 ">
        <BacklogView project={project} issues={project.issues || []} />
      </div>
    </div>
  );
}
