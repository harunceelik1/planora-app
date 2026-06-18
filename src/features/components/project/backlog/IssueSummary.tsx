"use client";

import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Issue, Project } from "@/types/project";
import { Calendar, User, Layers, CheckCircle2, FileText } from "lucide-react";

type IssueSummarySheetProps = {
  issue: Issue | null;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
};

// Durum badge'leri için göz yormayan stiller
const STATUS_BADGES: Record<string, string> = {
  TODO: "bg-muted text-muted-foreground border-muted-foreground/20",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
  DONE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export function IssueSummarySheet({ issue, project, isOpen, onClose }: IssueSummarySheetProps) {
  const t = useTranslations("ProjectSummary");

  if (!issue) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[480px] border-l border-border bg-card p-6 overflow-y-auto shadow-2xl">
        
        {/* Header - Görev Kimliği */}
        <SheetHeader className="space-y-1 border-b border-border/60 pb-4 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
            {project.projectKey}-{issue.number}
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground leading-tight">
            {issue.title}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground/80">
            {/* JSON'ındaki ipucunu veya genel bilgilendirmeyi buraya bağladık */}
            {t("stats.totalTasksHint")}
          </SheetDescription>
        </SheetHeader>

        {/* Bilgi Alanları */}
        <div className="mt-6 space-y-5">
          
          {/* Liste Biçiminde Temiz Bilgi Kartları (Read-Only Düzen) */}
          <div className="divide-y divide-border/40 rounded-2xl border border-border/60 bg-muted/10 px-4 py-2">
            
            {/* Durum */}
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/70" /> {t("sprint.title")}
              </span>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${STATUS_BADGES[issue.status] || STATUS_BADGES.TODO}`}>
                {issue.status}
              </span>
            </div>

            {/* Öncelik */}
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Layers className="h-3.5 w-3.5 text-muted-foreground/70" /> {t("stats.totalTasks")}
              </span>
              <span className="text-xs font-bold text-foreground bg-background border border-border rounded-lg px-2 py-0.5 capitalize shadow-sm">
                {issue.priority?.toLowerCase() || "Orta"}
              </span>
            </div>

            {/* Atanan Kişi */}
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <User className="h-3.5 w-3.5 text-muted-foreground/70" /> {t("stats.members")}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {issue.assigneeId ? t("stats.members") : t("common.unknownUser")}
              </span>
            </div>

            {/* Son Tarih */}
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" /> {t("dates.title")}
              </span>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "-"}
              </span>
            </div>

          </div>

          {/* Salt Okunur Açıklama Alanı */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {t("recent.title")}
            </h4>
            <div className="rounded-2xl border border-border/50 bg-background/60 p-4 text-sm text-foreground/90 leading-relaxed min-h-[140px] whitespace-pre-wrap shadow-inner">
              {issue.description || t("recent.empty")}
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}