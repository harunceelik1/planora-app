"use client";

import * as React from "react";
import useSWR from "swr";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  FolderKanban,
  LayoutGrid,
  Plus,
  Star,
  UserCog,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ROUTES } from "@/constants/routest";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { Project } from "@/types/project";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ─── Fetcher ─────────────────────────────────────────────────────────── */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

/* ─── Types ───────────────────────────────────────────────────────────── */
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

/* ─── NavLink ─────────────────────────────────────────────────────────── */
function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="block">
      <div
        title={collapsed ? item.label : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
          "transition-all duration-150 ease-out select-none",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-2",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            active ? "text-primary-foreground" : "text-muted-foreground/80",
          )}
        />
        {!collapsed && <span className="truncate leading-none">{item.label}</span>}
        {active && !collapsed && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
        )}
      </div>
    </Link>
  );
}

/* ─── ProjectLink ─────────────────────────────────────────────────────── */
function ProjectLink({
  project,
  active,
  href,
  collapsed,
}: {
  project: Project;
  active: boolean;
  href: string;
  collapsed?: boolean;
}) {
  return (
    <Link href={href} className="block" title={collapsed ? project.projectName : undefined}>
      <div
        className={cn(
          "flex items-center  gap-3 rounded-xl px-3 py-2 text-sm",
          "transition-all duration-150 ease-out select-none",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-2",
        )}
      >
        <Avatar className="h-6 w-6 shrink-0 rounded-lg border border-border">
          <AvatarImage src={project.image} alt={project.projectName} />
          <AvatarFallback className="rounded-lg bg-muted text-[9px] font-bold uppercase text-muted-foreground">
            {getInitials(project.projectName, "").slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium leading-none mb-0.5">
              {project.projectName}
            </div>
            <div
              className={cn(
                "truncate text-[10px] leading-none font-medium tracking-wide",
                active ? "text-primary-foreground/70" : "text-muted-foreground/60",
              )}
            >
              {project.projectKey}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── SectionHeader ───────────────────────────────────────────────────── */
function SectionHeader({
  label,
  isOpen,
  onToggle,
  onAdd,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onAdd?: () => void;
}) {
  return (
    <div className="mb-1 flex items-center justify-between px-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
        {label}
      </span>
      <div className="flex items-center gap-0.5">
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              !isOpen && "-rotate-90",
            )}
          />
        </button>
      </div>
    </div>
  );
}

/* ─── EmptyState ──────────────────────────────────────────────────────── */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="mx-1 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground/60">
      {text}
    </div>
  );
}

/* ─── LoadingRow ──────────────────────────────────────────────────────── */
function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground/70">
      <Spinner className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

/* ─── Divider ─────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="my-4 border-t border-border" />;
}

/* ─── Sidebar ─────────────────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Sidebar");

  const [collapsed, setCollapsed] = React.useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = React.useState(true);
  const [favoritesOpen, setFavoritesOpen] = React.useState(true);

  const { data: projects, isLoading } = useSWR("/api/project", fetcher);
  const { data: favoriteProjects, isLoading: isFavoritesLoading } = useSWR(
    "/api/project?favorite=true",
    fetcher,
  );

  const recentProjects: Project[] = Array.isArray(projects)
    ? [...projects]
        .sort(
          (a: Project, b: Project) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5)
    : [];

  const navItems: NavItem[] = [
    { href: ROUTES.MAIN, label: t("menu.dashboard"), icon: LayoutGrid },
    { href: ROUTES.PROFILE, label: t("menu.profile"), icon: UserCog },
  ];

  /* Responsive: collapse on <lg */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    setCollapsed(!mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCollapsed(!e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 md:flex flex-col border-r border-border bg-card text-card-foreground",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[68px] px-2 py-4" : "w-[220px] px-3 py-4",
      )}
    >
      <div className="flex h-full w-full flex-col overflow-hidden">
        {/* ── Logo / Brand ─────────────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center px-4 pt-4 pb-3",
            collapsed ? "justify-center px-3" : "justify-between",
          )}
        >
          <button
            onClick={() => router.push(ROUTES.MAIN)}
            className="flex items-center gap-2.5 rounded-xl outline-none ring-offset-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Planora"
          >
            {/* Logomark */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary shadow-sm text-primary-foreground">
              <span className="text-[11px] font-black tracking-[0.18em]">
                P
              </span>
            </div>
            {!collapsed && (
              <div className="leading-none text-left">
               
                <div className="text-[14px] font-bold text-card-foreground">
                  Planora
                </div>
              </div>
            )}
          </button>

          {/* Collapse toggle — only visible when expanded */}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label={t("aria.toggleSidebar")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label={t("aria.toggleSidebar")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        )}

        <Divider />

        {/* ── Scrollable nav ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2  scrollbar-none">
          {/* Main nav */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === ROUTES.MAIN && pathname === "/main");
              return (
                <NavLink
                  key={item.href}
                  item={item}
                  active={active}
                  collapsed={collapsed}
                />
              );
            })}
          </nav>

          {/* Sections — hidden when collapsed */}
          {!collapsed && (
            <>
              <div className="mt-5">
                <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
                  <SectionHeader
                    label={t("menu.projects")}
                    isOpen={isProjectsOpen}
                    onToggle={() => setIsProjectsOpen((v) => !v)}
                    onAdd={() => router.push(ROUTES.CREATE_PROJECT)}
                  />
                  <CollapsibleContent className="space-y-1.5">
                    {isLoading ? (
                      <LoadingRow label={t("status.loading")} />
                    ) : recentProjects.length > 0 ? (
                      <>
                        {recentProjects.map((project) => {
                          const href = ROUTES.PROJECTS.DETAILS(project.id);
                          return (
                            <ProjectLink
                              key={project.id}
                              project={project}
                              href={href}
                              active={pathname === href}
                            />
                          );
                        })}
                        <Link href={ROUTES.PROJECTS.LIST} className="block mt-1">
                          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                            <FolderKanban className="h-3.5 w-3.5" />
                            {t("actions.viewAllProjects")}
                          </div>
                        </Link>
                      </>
                    ) : (
                      <EmptyState text={t("status.noProjects")} />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="mt-5">
                <Collapsible open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                  <SectionHeader
                    label={t("menu.favorites")}
                    isOpen={favoritesOpen}
                    onToggle={() => setFavoritesOpen((v) => !v)}
                  />
                  <CollapsibleContent className="space-y-0.5">
                    {isFavoritesLoading ? (
                      <LoadingRow label={t("status.loading")} />
                    ) : favoriteProjects?.length > 0 ? (
                      favoriteProjects.map((project: Project) => {
                        const href = ROUTES.PROJECTS.DETAILS(project.id);
                        const isFavActive = pathname === href;
                        return (
                          <Link key={project.id} href={href} className="block">
                            <div
                              className={cn(
                                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium",
                                "transition-all duration-150 ease-out select-none",
                                isFavActive
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              )}
                            >
                              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                              <span className="truncate">{project.projectName}</span>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <EmptyState text={t("status.noFavorites")} />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </>
          )}
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <div className="border-t border-border px-2 pt-3">
          {collapsed ? (
            <button
              type="button"
              onClick={() => router.push(ROUTES.CREATE_PROJECT)}
              aria-label={t("actions.createProject")}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push(ROUTES.CREATE_PROJECT)}
              className="flex h-10 w-full items-center gap-2.5 rounded-2xl bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 hover:shadow-md active:scale-[0.99]"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>{t("actions.createProject")}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}