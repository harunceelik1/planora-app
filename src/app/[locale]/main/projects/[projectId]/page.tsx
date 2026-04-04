"use client";

import { use, useEffect } from "react";
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
import { Project } from "@/types/project";

// --- 1. Helper Bileşen: Circular Progress ---
const CircularProgress = ({
  value,
  total,
}: {
  value: number;
  total: number;
}) => {
  const t = useTranslations("ProjectDetails");
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="hidden md:flex items-center gap-3 rounded-full border border-border bg-card px-4 py-1.5 ml-4 shadow-sm transition-colors">
      <div className="relative h-8 w-8">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="transparent"
            className="stroke-muted transition-colors"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="transparent"
            className="stroke-primary transition-colors"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-foreground leading-tight">
          %{percentage} {t("views.overview.completed")}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium leading-tight">
          {value}/{total} {t("views.overview.totalTasks")}
        </span>
      </div>
    </div>
  );
};

// --- 2. Sayfa fetcher ---
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Project not found");
  return res.json();
};

interface ProjectDetailsPageProps {
  params: Promise<{ projectId: string }>;
}

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
      <div className="flex flex-col h-screen items-center justify-center bg-background space-y-4">
        <Spinner className="size-10 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {t("status.loading")}
        </p>
      </div>
    );

  if (error || !project)
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        {t("status.notFound")}
      </div>
    );

  // --- Tasarımdaki özel tab stili (Dark Mode Uyumlu) ---
  const tabTriggerStyle = cn(
    "group relative flex items-center gap-2 px-1 py-4 text-sm font-medium transition-colors outline-none",
    "text-muted-foreground hover:text-foreground",
    "data-[state=active]:text-primary",
    "after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-full after:bg-transparent after:transition-all",
    "data-[state=active]:after:bg-primary",
  );

  const members = project.members || [];
  const displayMembers = members.slice(0, 3);
  const remainingCount = members.length - 3;

  const allIssues = project.issues || [];
  const backlogCount = allIssues.filter((i) => !i.sprintId).length;
  const completedCount = allIssues.filter((i) => i.status === "DONE").length;

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <main className="flex flex-col h-screen bg-background transition-colors overflow-hidden">
      {/* HEADER */}
      <header className="flex-none px-8 pt-6 pb-0 bg-background z-20">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          <Link
            href="/main/projects"
            className="hover:text-foreground transition-colors"
          >
            {t("nav.workspace")}
          </Link>
          <span>/</span>
          <span className="text-foreground">{project.projectKey}</span>
        </div>

        <div className="flex items-start justify-between mb-2">
          {/* SOL TARAFI: Logo, Başlık, İlerleme */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm text-primary-foreground overflow-hidden">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={t("header.logoAlt")}
                  width={48}
                  height={48}
                  className="object-cover h-full w-full"
                />
              ) : (
                <RenderIcon
                  iconName={project.icon || "Layout"}
                  className="h-6 w-6 text-primary-foreground"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">
                  {project.projectName}
                </h1>
                <FavoriteButton
                  projectId={project.id}
                  isFavorited={project.isFavorited}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {t("status.updated")}
              </p>
            </div>
            <CircularProgress value={completedCount} total={allIssues.length} />
          </div>

          {/* SAĞ TARAF: Üyeler ve Aksiyon Butonları */}
          <div className="flex items-center gap-3">
            {members.length > 0 && (
              <div className="hidden md:flex items-center -space-x-2 mr-2">
                {displayMembers.map((member: Project["members"][number]) => (
                  <Avatar
                    key={member.id}
                    className="h-8 w-8 border-2 border-background ring-1 ring-border transition-transform hover:z-10 hover:scale-105 cursor-pointer"
                  >
                    <AvatarImage
                      src={member.user.image || ""}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-muted text-[10px] text-foreground font-bold">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}

                {remainingCount > 0 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground ring-1 ring-border z-0">
                    +{remainingCount}
                  </div>
                )}
              </div>
            )}

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

        {/* TABS */}
        <div className="mt-4">
          <Tabs
            defaultValue="backlog"
            className="w-full flex flex-col h-[calc(100vh-140px)]"
          >
            <div className="border-b border-border w-full px-1">
              <TabsList className="flex w-fit justify-start gap-8 bg-transparent p-0 h-auto rounded-none">
                <TabsTrigger value="overview" className={tabTriggerStyle}>
                  <LayoutDashboard className="h-4 w-4 mb-0.5" />{" "}
                  {t("tabs.overview")}
                </TabsTrigger>
                <TabsTrigger value="timeline" className={tabTriggerStyle}>
                  <CalendarDays className="h-4 w-4 mb-0.5" />{" "}
                  {t("tabs.timeline")}
                </TabsTrigger>
                <TabsTrigger value="backlog" className={tabTriggerStyle}>
                  <ListTodo className="h-4 w-4 mb-0.5" /> {t("tabs.backlog")}
                  {backlogCount > 0 && (
                    <span className="ml-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold text-primary">
                      {backlogCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="board" className={tabTriggerStyle}>
                  <KanbanSquare className="h-4 w-4 mb-0.5" /> {t("tabs.board")}
                </TabsTrigger>
                <TabsTrigger value="archive" className={tabTriggerStyle}>
                  <Archive className="h-4 w-4 mb-0.5" /> {t("tabs.archive")}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* SEKMELERİN İÇERİĞİ - bg-transparent yapılarak arka plan uyumu sağlandı */}
            <div className="flex-1 bg-transparent overflow-hidden relative">
              <TabsContent
                value="backlog"
                className="h-full m-0 border-none outline-none"
              >
                <div className="flex flex-col h-full overflow-y-auto animate-in fade-in duration-500">
                  <BacklogView
                    project={project}
                    issues={project.issues || []}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="board"
                className="h-full m-0 p-6 overflow-y-auto"
              >
                <BoardView project={project} />
              </TabsContent>
              <TabsContent value="overview" className="h-full p-6">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("views.overview.title")}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 max-w-md">
                    {t("views.overview.description")}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="timeline" className="h-full p-6">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("views.timeline.title")}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 max-w-md">
                    {t("views.timeline.description")}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="archive" className="h-full p-6">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("views.archive.title")}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 max-w-md">
                    {t("views.archive.description")}
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </header>
    </main>
  );
}

// Helper Board View
const BoardView = ({ project }: { project: Project }) => {
  const t = useTranslations("ProjectDetails");
  return (
    <div className="flex h-full flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
      <KanbanSquare className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground">
        {t("views.board.title")}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        {t("views.board.description")}
      </p>
    </div>
  );
};
