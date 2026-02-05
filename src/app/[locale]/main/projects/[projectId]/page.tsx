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
  Globe,
  Archive,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { ProjectActions } from "@/features/components/project/proejct-actions/actions";
import { AddMemberDialog } from "@/features/components/project/project-data/add-member-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BacklogView from "@/features/components/project/backlog/backlog-view";
import { FavoriteButton } from "@/features/components/project/favorite-button";
import { BacklogTab } from "@/features/components/project/tabs/backlog-tab";

// --- Board View Component ---
const BoardView = ({ project }: { project: any }) => {
  const t = useTranslations("ProjectDetails");

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <KanbanSquare className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold">{t("views.board.title")}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("views.board.description")}
      </p>
    </div>
  );
};

interface ProjectDetailsPageProps {
  params: Promise<{ projectId: string }>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Project not found");
    throw error;
  }
  return res.json();
};

export default function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const router = useRouter();
  const { projectId } = use(params);
  const t = useTranslations("ProjectDetails");

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

  const {
    data: project,
    isLoading,
    error,
  } = useSWR(`/api/project/${projectId}`, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (!isLoading && (error || !project)) {
      router.replace("/main/projects");
    }
  }, [isLoading, error, project, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Spinner className="size-8 " />
        <p className="text-muted-foreground font-medium animate-pulse">
          {t("error.notFound")}
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen  dark:bg-background ">
      <header className="flex-none px-6 py-4 border-b bg-background z-20 ">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-slate-50 overflow-hidden">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={t("header.logoAlt")}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: project.color || "#f1f5f9" }}
                >
                  <RenderIcon
                    iconName={project.icon || "Layout"}
                    className="h-5 w-5 text-white mix-blend-hard-light"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link
                  href="/main/projects"
                  className="hover:text-foreground transition-colors"
                >
                  {t("nav.workspace")}
                </Link>
                <span className="text-slate-300">/</span>
                <span>{project.projectKey}</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold leading-tight text-foreground">
                  {project.projectName}
                </h1>

                <FavoriteButton
                  projectId={project.id}
                  isFavorited={project.isFavorited}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
      </header>

      {/* 2. TABS */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="backlog" className="flex-1 flex flex-col">
          {/* TAB LİSTESİ */}
          <div className="flex-none border-b border-gray-200 dark:border-gray-800 bg-background z-10 px-6">
            <TabsList className="flex h-14 w-full justify-start gap-4 bg-transparent p-0 m-0">
              <TabsTrigger
                value=""
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "relative h-10 rounded-md font-medium text-muted-foreground",
                  "border-b-2 border-transparent",
                  "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
                  "data-[state=active]:border-b-blue-600",
                  "data-[state=active]:text-blue-600"
                )}
              >
                <Globe className="h-4 w-4 mr-2" />
                {t("tabs.overview")}
              </TabsTrigger>

              {/* Sekme: Zaman Çizelgesi */}
              <TabsTrigger
                value="timeline"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "relative h-10 rounded-md font-medium text-muted-foreground",
                  "border-b-2 border-transparent",
                  "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
                  "data-[state=active]:border-b-blue-600",
                  "data-[state=active]:text-blue-600"
                )}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {t("tabs.timeline")}
              </TabsTrigger>

              {/* Sekme: Kapsam (Backlog) */}
              <TabsTrigger
                value="backlog"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "relative h-10 rounded-md font-medium text-muted-foreground",
                  "border-b-2 border-transparent",
                  "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
                  "data-[state=active]:border-b-blue-600",
                  "data-[state=active]:text-blue-600"
                )}
              >
                <ListTodo className="h-4 w-4 mr-2" />
                {t("tabs.backlog")}
                {/* Rozet */}
                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600 group-hover:bg-white group-data-[state=active]:bg-blue-100 group-data-[state=active]:text-blue-700">
                  {project.issues?.length || 0}
                </span>
              </TabsTrigger>

              {/* Sekme: Pano */}
              <TabsTrigger
                value="board"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "relative h-10 rounded-md font-medium text-muted-foreground",
                  "border-b-2 border-transparent",
                  "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
                  "data-[state=active]:border-b-blue-600",
                  "data-[state=active]:text-blue-600"
                )}
              >
                <KanbanSquare className="h-4 w-4 mr-2" />
                {t("tabs.board")}
              </TabsTrigger>

              {/* Sekme: Arşiv */}
              <TabsTrigger
                value="/"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "relative h-10 rounded-md font-medium text-muted-foreground",
                  "border-b-2 border-transparent",
                  "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
                  "data-[state=active]:border-b-blue-600",
                  "data-[state=active]:text-blue-600"
                )}
              >
                <Archive className="h-4 w-4 mr-2" />
                {t("tabs.archive")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB İÇERİKLERİ */}
          <div className="flex-1 bg-slate-50/30 dark:bg-slate-950 p-0 overflow-hidden">
            {/* TIMELINE */}
            <TabsContent
              value="timeline"
              className="h-full p-6 mt-0 focus-visible:outline-none overflow-y-auto custom-scrollbar"
            >
              <div className="flex h-full flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                  <LayoutDashboard className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold">
                  {t("views.timeline.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("views.timeline.description")}
                </p>
              </div>
            </TabsContent>

            {/* BACKLOG (GÜNCELLENEN KISIM) */}
            <TabsContent
              value="backlog"
              className="h-full mt-0 focus-visible:outline-none flex flex-col"
            >
              <BacklogTab project={project} />
            </TabsContent>

            {/* BOARD */}
            <TabsContent
              value="board"
              className="h-full p-6 mt-0 focus-visible:outline-none overflow-y-auto custom-scrollbar"
            >
              <BoardView project={project} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
