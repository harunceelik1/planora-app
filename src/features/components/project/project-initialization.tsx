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
  Bell,
} from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";

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

  // ⭐ Hem oturum hem de projeler yüklenene kadar bekleme durumu
  const isPageLoading = status === "loading" || isLoading;

  // ⭐ Tam ekran, ortalanmış profesyonel yükleme (Spinner) ekranı
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Spinner className="size-12 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {t("loadingWorkspace")}
          {/* Çeviri Dosyasına Eklenecek: "Çalışma alanınız hazırlanıyor..." */}
        </p>
      </div>
    );
  }

  // Veriler yüklendikten sonraki kısım
  const userName = session?.user?.name || t("defaultUser");
  const hasProjects = projects && projects.length > 0;

  // ⭐ DİNAMİK HESAPLAMA (API'den dönen güncel şemaya göre)
  let openTasksCount = 0;
  let criticalTasksCount = 0;
  let upcomingTasksCount = 0;
  let dueThisWeekCount = 0;

  if (hasProjects) {
    // API backend'den zaten status: "DONE" veya "CANCELLED" olmayanları getirdiği için,
    // dönen tüm issue'lar aktif/açık görevlerdir.
    const allIssues = projects.flatMap((project: any) => project.issues || []);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Sadece gün bazlı karşılaştırma için saatleri sıfırlıyoruz

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    allIssues.forEach((issue: any) => {
      openTasksCount++; // Her gelen issue açık bir görev

      // Önceliği HIGH veya HIGHEST olanlar (Şemadaki IssuePriority enum'una göre)
      if (issue.priority === "HIGH" || issue.priority === "HIGHEST") {
        criticalTasksCount++;
      }

      // Teslim tarihi hesaplamaları
      if (issue.dueDate) {
        const dueDate = new Date(issue.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate >= today) {
          upcomingTasksCount++; // Bugünden ileri tarihteki tüm teslimler
        }

        if (dueDate >= today && dueDate <= nextWeek) {
          dueThisWeekCount++; // Önümüzdeki 7 gün içindeki teslimler
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* --- SOL TARAF --- */}
        <div className="lg:col-span-8 flex flex-col space-y-8 animate-in fade-in duration-700">
          {/* Başlık Alanı */}
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              {t("greeting", { name: userName })}
            </h1>
            <p className="text-lg text-muted-foreground">
              {hasProjects
                ? t("activeSummary") // Çeviri Dosyasına Eklenecek: "İşte bugünkü işlerinin özeti."
                : t("subGreeting")}
            </p>
          </div>

          {/* MANTIK AYRIMI */}
          {hasProjects ? (
            /* DURUM B: AKTİF KULLANICI (KPI KARTLARI) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Kart 1: Görevler */}
              <Card className="border-border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      <LayoutList className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("kpi.openTasks")}
                      {/* Çeviri Dosyasına Eklenecek: "Açık Görevler" */}
                    </span>
                  </div>
                  <div>
                    {/* Dinamik açık görev sayısı */}
                    <div className="text-3xl font-bold text-foreground">
                      {openTasksCount}
                    </div>
                    {/* Dinamik kritik görev sayısı */}
                    <p className="text-xs text-muted-foreground mt-1">
                      {criticalTasksCount} {t("kpi.criticalTasks")}
                      {/* Çeviri Dosyasına Eklenecek: "kritik öncelikli" */}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Kart 2: Teslim Tarihleri */}
              <Card className="border-border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                      <CalendarClock className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("kpi.upcoming")}
                      {/* Çeviri Dosyasına Eklenecek: "Yaklaşan" */}
                    </span>
                  </div>
                  <div>
                    {/* Dinamik yaklaşan teslim sayısı */}
                    <div className="text-3xl font-bold text-foreground">
                      {upcomingTasksCount}
                    </div>
                    {/* Dinamik bu hafta bitecek olanların sayısı */}
                    <p className="text-xs text-muted-foreground mt-1">
                      {dueThisWeekCount} {t("kpi.dueThisWeek")}
                      {/* Çeviri Dosyasına Eklenecek: "bu hafta teslim" */}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  {t("recentActivitiesPlaceholder")}
                  {/* Çeviri Dosyasına Eklenecek: "Son aktiviteler buraya gelecek..." */}
                </p>
              </div>
            </div>
          ) : (
            /* DURUM A: YENİ KULLANICI (ONBOARDING) */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-blue-500/10 border border-blue-200/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="bg-background p-2 rounded-full shadow-sm shrink-0">
                  <BadgeCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {t("quickStart.title")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {t("quickStart.description")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/main/create-project" className="group">
                  <Card className="h-full border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer rounded-2xl p-2 bg-card">
                    <CardContent className="p-6 flex flex-col items-start h-full justify-between gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground mb-2">
                          {t("actions.createProject.title")}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {t("actions.createProject.description")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <div className="group cursor-pointer">
                  <Card className="h-full border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all rounded-2xl p-2 bg-card">
                    <CardContent className="p-6 flex flex-col items-start h-full justify-between gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-secondary-foreground group-hover:bg-secondary/80 transition-colors">
                        <UserPlus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground mb-2">
                          {t("actions.inviteTeam.title")}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {t("actions.inviteTeam.description")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                {t("footerNote")}
              </p>
            </div>
          )}
        </div>

        {/* --- SAĞ TARAF (Sidebar) --- */}
        <div className="lg:col-span-4 flex flex-col animate-in fade-in duration-700 delay-150">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {t("sidebar.activeProjects")}
            </h2>
            <Link
              href={ROUTES.PROJECTS.LIST}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              {t("sidebar.viewAll")}
            </Link>
          </div>

          {hasProjects ? (
            <ActiveProjects projects={projects} />
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
              <div className="relative mb-6">
                <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center shadow-sm">
                  <Folder className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="absolute top-1 right-1 h-3 w-3 bg-orange-400 rounded-full border-2 border-background"></div>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">
                {t("sidebar.noProject.title")}
              </h3>
              <p className="text-muted-foreground text-sm max-w-[240px] leading-relaxed">
                {t("sidebar.noProject.description")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
