"use client";

import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import {
  Plus,
  UserPlus,
  BadgeCheck,
  Folder,
  LayoutList,
  CalendarClock,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import type { Project, Issue } from "@/types/project";

import { Card, CardContent } from "@/components/ui/card";
import { ActiveProjects } from "./active-projects";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routest";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Veri çekilemedi");
  return res.json();
};

export default function ProjectInitialization() {
  const { data: session, status } = useSession();
  const t = useTranslations("ProjectInitialization");

  const { data: projects, isLoading } = useSWR("/api/project", fetcher, {
    revalidateOnFocus: true,
  });

  const isPageLoading = status === "loading" || isLoading;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Spinner className="size-12 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {t("loadingWorkspace")}
        </p>
      </div>
    );
  }

  const userName = session?.user?.name || t("defaultUser");
  const hasProjects = projects && projects.length > 0;

  let openTasksCount = 0;
  let criticalTasksCount = 0;
  let upcomingTasksCount = 0;
  let dueThisWeekCount = 0;

  if (hasProjects) {
    const allIssues: Issue[] = projects.flatMap((project: Project) => project.issues || []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    allIssues.forEach((issue: Issue) => {
      const isOpen = issue.status !== "DONE" && issue.status !== "CANCELLED";

      if (!isOpen) return;

      openTasksCount++;

      if (issue.priority === "HIGH" || issue.priority === "HIGHEST") {
        criticalTasksCount++;
      }

      if (issue.dueDate) {
        const dueDate = new Date(issue.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate >= today) {
          upcomingTasksCount++;
        }

        if (dueDate >= today && dueDate <= nextWeek) {
          dueThisWeekCount++;
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-12 transition-colors duration-300 overflow-x-hidden">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* --- SOL TARAF --- */}
        <div className="col-span-1 lg:col-span-8 flex flex-col space-y-6 md:space-y-8 animate-in fade-in duration-700">
          {/* Başlık Alanı */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight break-words">
              {t("greeting", { name: userName })}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              {hasProjects ? t("activeSummary") : t("subGreeting")}
            </p>
          </div>

          {/* MANTIK AYRIMI */}
          {hasProjects ? (
            /* DURUM B: AKTİF KULLANICI (KPI KARTLARI) */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Kart 1: Görevler */}
              <Card className="border-border shadow-sm hover:shadow-md transition-all h-full min-w-0">
                <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full shrink-0">
                      <LayoutList className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {t("kpi.openTasks")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                      {openTasksCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">
                      {criticalTasksCount} {t("kpi.criticalTasks")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Kart 2: Teslim Tarihleri */}
              <Card className="border-border shadow-sm hover:shadow-md transition-all h-full min-w-0">
                <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full shrink-0">
                      <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {t("kpi.upcoming")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                      {upcomingTasksCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">
                      {dueThisWeekCount} {t("kpi.dueThisWeek")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-1 sm:col-span-2 xl:col-span-3 mt-2">
                <p className="text-sm text-muted-foreground">
                  {t("recentActivitiesPlaceholder")}
                </p>
              </div>
            </div>
          ) : (
            /* DURUM A: YENİ KULLANICI (ONBOARDING KARTLARI) */
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-blue-500/10 border border-blue-200/20 rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                <div className="bg-background p-2 rounded-full shadow-sm shrink-0">
                  <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                    {t("quickStart.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm md:text-base">
                    {t("quickStart.description")}
                  </p>
                </div>
              </div>

              {/* Onboarding grid yapısı dar ekranlarda alt alta geniş ekranlarda yan yana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Link href="/main/create-project" className="group block min-w-0">
                  <Card className="h-full border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer rounded-2xl bg-card">
                    <CardContent className="p-5 sm:p-6 flex flex-col items-start h-full justify-between gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform shrink-0">
                        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-1.5 truncate">
                          {t("actions.createProject.title")}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-normal line-clamp-3">
                          {t("actions.createProject.description")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/main/profile" className="group block min-w-0">
  <Card className="h-full border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer rounded-2xl bg-card">
    <CardContent className="p-5 sm:p-6 flex flex-col items-start h-full justify-between gap-4">
      
      {/* İkon Alanı */}
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-secondary-foreground group-hover:bg-secondary/80 transition-colors shrink-0">
        <User className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      
      {/* Metin Alanı */}
      <div className="min-w-0 w-full">
        <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-1.5 truncate">
          {/* İstersen doğrudan i18n dosyasından çek, istersen geçici olarak düz yaz */}
          {t("actions.completeProfile.title") || "Profilini Özelleştir"}
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-normal line-clamp-3">
          {t("actions.completeProfile.description") || "Profil fotoğrafını ekle, bildirim ayarlarını düzenle ve çalışma alanını kişiselleştir."}
        </p>
      </div>

    </CardContent>
  </Card>
</Link>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {t("footerNote")}
              </p>
            </div>
          )}
        </div>

        {/* --- SAĞ TARAF (Sidebar) --- */}
        <div className="col-span-1 lg:col-span-4 flex flex-col animate-in fade-in duration-700 delay-150 mt-4 lg:mt-0">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
              {t("sidebar.activeProjects")}
            </h2>
            <Link
              href={ROUTES.PROJECTS.LIST}
              className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 shrink-0"
            >
              {t("sidebar.viewAll")}
            </Link>
          </div>

          {hasProjects ? (
            <ActiveProjects projects={projects} />
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[40vh] lg:min-h-[50vh]">
              <div className="relative mb-4 sm:mb-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-background rounded-full flex items-center justify-center shadow-sm">
                  <Folder className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
                </div>
                <div className="absolute top-0.5 right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-orange-400 rounded-full border-2 border-background"></div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                {t("sidebar.noProject.title")}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-[240px] leading-relaxed">
                {t("sidebar.noProject.description")}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}