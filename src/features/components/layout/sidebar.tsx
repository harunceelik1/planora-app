"use client";

import Link from "next/link";
import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  UserCog,
  LayoutGrid,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  FolderKanban,
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

const fetcher = async (url: string) => {
  const res = await fetch(url);

  // Eğer API 200 OK dönmezse (örn: 401 Unauthorized), hata fırlat
  if (!res.ok) {
    throw new Error("Veri çekilemedi");
  }

  return res.json();
};

type NavItem = { href: string; label: string; icon: React.ReactNode };

const mainItems: NavItem[] = [
  {
    href: ROUTES.PROFILE,
    label: "Profil",
    icon: <UserCog className="h-4 w-4" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true);
  const [favOpen, setFavOpen] = React.useState(true);
  const router = useRouter(); // Router'ı tanımla
  const { data: projects, isLoading } = useSWR("/api/project", fetcher);

  const recentProjects = Array.isArray(projects)
    ? [...projects]
        .sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5)
    : [];

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
        "transition-[width] duration-300",
        // 1. DÜZELTME: h-screen EKLENDİ (Tüm ekranı kapla)
        "relative flex flex-col shrink-0 border-r backdrop-blur pl-2 h-screen",
        collapsed ? "w-16" : "w-64",
        "overflow-x-visible bg-background"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-3 shrink-0",
          collapsed && "px-2 relative"
        )}
      >
        <button
          onClick={() => setCollapsed((state) => !state)}
          className={cn(
            "group absolute top-3 -right-3 z-20 grid place-items-center",
            "h-8 w-8 rounded-full border bg-background shadow-md",
            "transition-transform hover:-translate-x-[2px]"
          )}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform cursor-pointer",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {!collapsed && (
        <div className="animate-in fade-in-0 zoom-in-95 duration-400 flex flex-col flex-1 min-h-0 ">
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
            <div className="mt-3 px-2">
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
                        "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {/* İKON DEĞİŞİM ALANI (Burası aynı kalıyor - Hover ile değişir) */}
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        {/* 1. Varsayılan İkon */}
                        <LayoutGrid className="h-4 w-4 group-hover:hidden transition-all" />

                        {/* 2. Hover İkonu */}
                        <div className="hidden group-hover:block">
                          {isProjectsOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                          )}
                        </div>
                      </div>

                      <span>Kontrol Paneli</span>
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
                      Yükleniyor...
                    </div>
                  ) : recentProjects.length > 0 ? (
                    <>
                      {recentProjects.map((project: any) => {
                        const projectLink = ROUTES.PROJECTS.DETAILS(project.id);
                        const active = pathname === projectLink;

                        return (
                          <Link key={project.id} href={projectLink}>
                            <div
                              className={cn(
                                "flex gap-2 text-sm rounded-md items-center px-2 py-1.5 transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                active &&
                                  "bg-accent/50 text-accent-foreground font-medium"
                              )}
                            >
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-primary/10 text-[9px] font-bold text-primary uppercase">
                                {getInitials(project.projectName, "").slice(
                                  0,
                                  1
                                )}
                              </div>
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
                          <span>Tüm Projeleri Gör</span>
                        </div>
                      </Link>
                      <Link href={ROUTES.CREATE_PROJECT}>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-accent/50 transition-colors">
                          <Plus className="h-3 w-3" />
                          <span>Proje Oluştur</span>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      <Label>Henüz proje yok.</Label>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* 2. DİĞER MENÜLER */}
            <nav className="mt-1 px-2 space-y-1">
              {mainItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        active && "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* 3. FAVORİLER */}
            <div className="mt-4 px-2">
              <Collapsible open={favOpen} onOpenChange={setFavOpen}>
                <div className="flex items-center justify-between mb-1 px-2 group cursor-pointer">
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                    Favoriler
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
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    Henüz favori yok.
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Footer / Settings */}
          {/* 3. DÜZELTME: Bu alan scroll alanının dışına taşındı ve mt-auto ile alta itildi */}
          <div className="mt-auto border-t p-2 bg-background z-10">
            <Link href="/main/settings">
              <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Ayarlar</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
