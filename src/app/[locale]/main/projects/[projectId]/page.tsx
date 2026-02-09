"use client";

import { use } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import * as Icons from "lucide-react";
import {
  ListTodo,
  KanbanSquare,
  CalendarDays,
  LayoutDashboard,
  Archive,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { ProjectActions } from "@/features/components/project/proejct-actions/actions";
import { AddMemberDialog } from "@/features/components/project/project-data/add-member-dialog";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BacklogView from "@/features/components/project/backlog/backlog-view";
import { FavoriteButton } from "@/features/components/project/favorite-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- 1. Helper Bileşen: Circular Progress (Halka Grafik) ---
const CircularProgress = ({
  value,
  total,
}: {
  value: number;
  total: number;
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="hidden md:flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-1.5 ml-4 shadow-sm">
      <div className="relative h-8 w-8">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
          {/* Gri Arka Plan Halkası */}
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="3"
          />
          {/* Turuncu İlerleme Halkası */}
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="transparent"
            stroke="#f97316"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-800 leading-tight">
          {percentage}% Complete
        </span>
        <span className="text-[10px] text-slate-500 font-medium leading-tight">
          {value}/{total} Tasks
        </span>
      </div>
    </div>
  );
};

// --- 2. Helper Bileşen: Board View Placeholder ---
const BoardView = ({ project }: { project: any }) => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <KanbanSquare className="h-10 w-10 text-slate-400 mb-4" />
    <h3 className="text-lg font-semibold">Board View</h3>
    <p className="text-sm text-slate-500">Kanban board content goes here.</p>
  </div>
);

// --- 3. Ana Sayfa Bileşeni ---
interface ProjectDetailsPageProps {
  params: Promise<{ projectId: string }>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Project not found");
  return res.json();
};

export default function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const router = useRouter();
  const { projectId } = use(params);
  const t = useTranslations("ProjectDetails");

  const {
    data: project,
    isLoading,
    error,
  } = useSWR(`/api/project/${projectId}`, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  });

  const RenderIcon = ({
    iconName,
    className,
  }: {
    iconName: string;
    className?: string;
  }) => {
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.Layout;
    return <IconComponent className={className} />;
  };

  useEffect(() => {
    if (!isLoading && (error || !project)) {
      router.replace("/main/projects");
    }
  }, [isLoading, error, project, router]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  if (error || !project)
    return (
      <div className="flex h-screen items-center justify-center">
        Project not found
      </div>
    );

  // Tasarımdaki özel tab stili (Altı çizili, turuncu aktif)
  const tabTriggerStyle = cn(
    "group relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition-colors outline-none",
    "text-slate-500 hover:text-slate-800",
    "data-[state=active]:text-orange-600", // Aktifken yazı turuncu
    // Alt çizgi efekti (Sadece aktifken görünür)
    "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-transparent after:transition-all",
    "data-[state=active]:after:bg-orange-600",
  );

  return (
    <main className="flex flex-col h-screen bg-white overflow-hidden">
      {/* --- HEADER ALANI --- */}
      <header className="flex-none px-8 pt-6 pb-0 bg-white z-20">
        {/* Breadcrumb (Sol Üst) */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
          <Link
            href="/main/projects"
            className="hover:text-slate-600 transition-colors"
          >
            Workspaces
          </Link>
          <span>/</span>
          <span className="text-slate-600">{project.projectKey}</span>
        </div>

        <div className="flex items-start justify-between mb-2">
          {/* SOL TARAFI: Logo, Başlık, İlerleme */}
          <div className="flex items-center gap-4">
            {/* Turuncu Logo Kutusu */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 shadow-sm text-white overflow-hidden">
              {project.image ? (
                <Image
                  src={project.image}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-cover h-full w-full"
                />
              ) : (
                <RenderIcon
                  iconName={project.icon || "Layout"}
                  className="h-6 w-6 text-white"
                />
              )}
            </div>

            {/* Başlık ve Bilgiler */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                  {project.projectName}
                </h1>
                <FavoriteButton
                  projectId={project.id}
                  isFavorited={project.isFavorited}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Updated just now
              </p>
            </div>

            {/* 🔥 Tamamlanma Oranı (Dinamik) */}
            {/* Buradaki 13 ve 20 değerlerini veritabanından gelen gerçek completedCount ile değiştirebilirsin */}
            <CircularProgress
              value={project.completedIssueCount || 0}
              total={project.issues?.length || 0}
            />
          </div>

          {/* SAĞ TARAF: Üyeler ve Aksiyon Butonları */}
          <div className="flex items-center gap-3">
            {/* Avatar Grubu (Görsel) */}
            <div className="hidden md:flex items-center -space-x-2 mr-2">
              <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-slate-100">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-slate-100">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 ring-1 ring-slate-100">
                +3
              </div>
            </div>

            {/* SENİN BUTONLARIN (Fonksiyonel) */}
            <AddMemberDialog
              projectId={project.id}
              projectName={project.projectName}
            />

            <ProjectActions
              projectId={project.id}
              projectName={project.projectName}
            />
          </div>
        </div>

        {/* --- TABS (HEADER İÇİNDE) --- */}
        <div className="mt-4">
          <Tabs
            defaultValue="backlog"
            className="w-full flex flex-col h-[calc(100vh-140px)]"
          >
            {/* Tab Listesi */}
            <div className="border-b border-slate-100 w-full px-1">
              <TabsList className="flex w-full justify-start gap-8 bg-transparent p-0 h-auto rounded-none">
                <TabsTrigger value="overview" className={tabTriggerStyle}>
                  <LayoutDashboard className="h-4 w-4 mb-0.5" />
                  {t("tabs.overview")}
                </TabsTrigger>

                <TabsTrigger value="timeline" className={tabTriggerStyle}>
                  <CalendarDays className="h-4 w-4 mb-0.5" />
                  {t("tabs.timeline")}
                </TabsTrigger>

                <TabsTrigger value="backlog" className={tabTriggerStyle}>
                  <ListTodo className="h-4 w-4 mb-0.5" />
                  {t("tabs.backlog")}
                  {/* Sayı Rozeti */}
                  {(project.issues?.length || 0) > 0 && (
                    <span className="ml-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-100 px-1.5 text-[11px] font-bold text-orange-600">
                      {project.issues.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger value="board" className={tabTriggerStyle}>
                  <KanbanSquare className="h-4 w-4 mb-0.5" />
                  {t("tabs.board")}
                </TabsTrigger>

                <TabsTrigger value="archive" className={tabTriggerStyle}>
                  <Archive className="h-4 w-4 mb-0.5" />
                  {t("tabs.archive")}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB İÇERİKLERİ */}
            <div className="flex-1 bg-[#F9FAFB] overflow-hidden relative">
              {/* BACKLOG TAB (Düzeltilen Kısım) */}
              <TabsContent
                value="backlog"
                className="h-full m-0 border-none outline-none"
              >
                <BacklogView
                  project={project}
                  issues={project.issues || []} // HATA ÇÖZÜMÜ: || [] eklendi
                />
              </TabsContent>

              {/* BOARD TAB */}
              <TabsContent
                value="board"
                className="h-full m-0 p-6 overflow-y-auto"
              >
                <BoardView project={project} />
              </TabsContent>

              {/* DİĞER TABLAR (Placeholder) */}
              <TabsContent value="overview" className="h-full p-6">
                <div className="flex items-center justify-center h-full text-slate-400">
                  Overview Content
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="h-full p-6">
                <div className="flex items-center justify-center h-full text-slate-400">
                  Timeline Content
                </div>
              </TabsContent>

              <TabsContent value="archive" className="h-full p-6">
                <div className="flex items-center justify-center h-full text-slate-400">
                  Archive Content
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </header>
    </main>
  );
}
