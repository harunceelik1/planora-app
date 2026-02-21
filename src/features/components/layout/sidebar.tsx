"use client";

import { Link, useRouter, usePathname } from "@/i18n/routing";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  UserCog,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Plus,
  FolderKanban,
  Star,
  Moon,
  Sun,
} from "lucide-react";
import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ROUTES } from "@/constants/routest";
import { getInitials } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "next-themes";
import { Project } from "@/types/project";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Veri çekilemedi");
  }
  return res.json();
};

type NavItem = { href: string; label: string; icon: React.ReactNode };

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Sidebar");
  const { setTheme, theme } = useTheme();

  const [collapsed, setCollapsed] = React.useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true);
  const [favOpen, setFavOpen] = React.useState(true);

  const { data: projects, isLoading } = useSWR("/api/project", fetcher);
  const { data: favoriteProjects, isLoading: isFavLoading } = useSWR(
    "/api/project?favorite=true",
    fetcher,
  );

  const recentProjects = Array.isArray(projects)
    ? [...projects]
        .sort(
          (a: Project, b: Project) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5)
    : [];

  const mainItems: NavItem[] = [
    {
      href: ROUTES.PROFILE,
      label: t("menu.profile"),
      icon: <UserCog className="h-4 w-4" />,
    },
  ];

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setCollapsed(!mediaQuery.matches);
    const onChange = (e: MediaQueryListEvent) => {
      setCollapsed(!e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }
  }, []);

  return (
    <aside
      className={cn(
        "sticky top-4 h-[calc(100vh-2rem)]",
        "ml-4 mr-4 md:mr-0",
        "border border-border/60 rounded-2xl shadow-lg shadow-black/5",
        "transition-[width] duration-300",
        "flex flex-col shrink-0 backdrop-blur pl-2",
        collapsed ? "w-16" : "w-64",
        "overflow-x-visible bg-background/95 z-50",
      )}
    >
      {/* 👇 YENİ LOGO VE ÜST KISIM TASARIMI 👇 */}
      <div className="relative flex items-center w-full px-3 pt-6 pb-4">
        <div
          onClick={() => router.push(ROUTES.MAIN)}
          className={cn(
            "cursor-pointer flex items-center gap-3 transition-all",
            collapsed && "mx-auto", // Sidebar kapalıysa ikonu ortala
          )}
        >
          {/* Kare "P" İkonu */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e293b] text-white dark:bg-white dark:text-[#1e293b] font-bold text-lg shadow-sm">
            P
          </div>

          {/* PLANORA Yazısı */}
          {!collapsed && (
            <span className="font-bold text-[15px] tracking-[0.15em] text-[#1e293b] dark:text-white">
              PLANORA
            </span>
          )}
        </div>

        {/* Kapatma Butonu */}
        <button
          onClick={() => setCollapsed((state) => !state)}
          aria-label={t("aria.toggleSidebar")}
          className={cn(
            "group absolute top-6 -right-3 z-20 grid place-items-center",
            "h-8 w-8 rounded-full border bg-background shadow-md",
            "transition-transform hover:-translate-x-[2px]",
          )}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform cursor-pointer",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>
      {/* 👆 YENİ LOGO TASARIMI BİTİŞİ 👆 */}

      {!collapsed && (
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 px-2">
            <div className="mt-3">
              <Collapsible
                open={isProjectsOpen}
                onOpenChange={setIsProjectsOpen}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center justify-between w-full p-2 rounded-md cursor-pointer group",
                      "hover:bg-accent hover:text-accent-foreground",
                      !isProjectsOpen &&
                        pathname.includes("/projects") &&
                        "bg-accent text-accent-foreground font-medium",
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <LayoutGrid className="h-4 w-4 group-hover:hidden transition-all" />
                        <div className="hidden group-hover:block">
                          {isProjectsOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          )}
                        </div>
                      </div>
                      <span>{t("menu.dashboard")}</span>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          router.push(ROUTES.CREATE_PROJECT);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="pl-4 pr-1 mt-1 space-y-0.5 border-l ml-3 border-border/50">
                  {isLoading ? (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      {t("status.loading")}
                    </div>
                  ) : recentProjects.length > 0 ? (
                    <>
                      {recentProjects.map((project: Project) => {
                        const projectLink = ROUTES.PROJECTS.DETAILS(project.id);
                        const active = pathname === projectLink;

                        return (
                          <Link key={project.id} href={projectLink}>
                            <div
                              className={cn(
                                "flex gap-2 text-sm rounded-md items-center px-2 py-1.5 transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                active &&
                                  "bg-accent/50 text-accent-foreground font-medium",
                              )}
                            >
                              <Avatar className="h-4 w-4 rounded-[3px]">
                                <AvatarImage
                                  src={project.image}
                                  alt={project.projectName}
                                  className="object-cover rounded-[3px]"
                                />
                                <AvatarFallback className="rounded-[3px] bg-primary/10 text-[9px] font-bold text-primary uppercase flex items-center justify-center h-full w-full">
                                  {getInitials(project.projectName, "").slice(
                                    0,
                                    1,
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              <span className="truncate">
                                {project.projectName}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                      <Link href={ROUTES.PROJECTS.LIST}>
                        <div className="flex items-center gap-2 mt-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-accent/50 transition-colors">
                          <FolderKanban className="h-3 w-3" />
                          <span>{t("actions.viewAllProjects")}</span>
                        </div>
                      </Link>
                      <Link href={ROUTES.CREATE_PROJECT}>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-accent/50 transition-colors">
                          <Plus className="h-3 w-3" />
                          <span>{t("actions.createProject")}</span>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      <Label>{t("status.noProjects")}</Label>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <nav className="mt-1 space-y-1">
              {mainItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        active &&
                          "bg-accent text-accent-foreground font-medium",
                      )}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4">
              <Collapsible open={favOpen} onOpenChange={setFavOpen}>
                <div className="flex items-center justify-between mb-1 px-2 group cursor-pointer">
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                    {t("menu.favorites")}
                  </div>
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      {favOpen ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {isFavLoading ? (
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      <Spinner className="sm" />
                    </div>
                  ) : favoriteProjects && favoriteProjects.length > 0 ? (
                    <div className="space-y-0.5">
                      {favoriteProjects.map((project: Project) => {
                        const projectLink = ROUTES.PROJECTS.DETAILS(project.id);
                        const active = pathname === projectLink;
                        return (
                          <Link key={project.id} href={projectLink}>
                            <div
                              className={cn(
                                "flex gap-2 text-sm rounded-md items-center px-2 py-1.5 transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                active &&
                                  "bg-accent/50 text-accent-foreground font-medium",
                              )}
                            >
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="truncate text-xs">
                                {project.projectName}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      {t("status.noFavorites")}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Alt Kısım */}
          <div className="mt-auto border-t border-border/60 bg-background p-2 shrink-0 z-10 rounded-b-2xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full justify-start gap-2 px-3 text-muted-foreground hover:text-foreground"
            >
              <div className="relative flex items-center justify-center">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              <span>Görünüm</span>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
