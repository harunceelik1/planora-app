"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  ListTodo,
  CalendarDays,
  Users,
  Star,
  Plus,
  ChevronLeft,
  UserCog,
  Timer,
  Settings,
} from "lucide-react";
import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ROUTES } from "@/constants/routest";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const mainItems: NavItem[] = [
  /*
  {
    href: ROUTES.DASHBOARD,
    label: "Ev",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  */
  {
    href: ROUTES.PROJECTS.LIST,
    label: "Kontrol Paneli",
    icon: <ListTodo className="h-4 w-4" />,
  },
  // {
  //   href: ROUTES.MAIN,
  //   label: "Çalışmalarım",
  //   icon: <ListTodo className="h-4 w-4" />,
  // },
  // proje listesinden seçilecek ve route dinamik olacak
  // ROUTES.PROJECTS.CALENDAR("1")
  {
    href: "/main/projects/calendar/:id",
    label: "En Son",
    icon: <Timer className="h-4 w-4" />,
  },

  {
    href: ROUTES.PROFILE,
    label: "Profile",
    icon: <UserCog className="h-4 w-4" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [favOpen, setFavOpen] = React.useState(true);
  const [wsOpen, setWsOpen] = React.useState(true);

  // 👇 768px (md) altına inince kapat, üstüne çıkınca aç
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    // Sayfa ilk yüklendiğinde sidebar’ın açık mı kapalı mı olacağını belirler.

    setCollapsed(!mediaQuery.matches);

    const onChange = (e: MediaQueryListEvent) => {
      //Bu fonksiyon, ekran boyutu değiştiğinde çağrılıyor.
      setCollapsed(!e.matches); // >=768 => açık, <768 => kapalı
    };

    if (mediaQuery.addEventListener) {
      // “mediaQuery nesnesinde değişim (change) olayı meydana geldiğinde onChange fonksiyonunu çalıştır.”
      //addEventListener(eventName: string, callback: Function). Change olayında tarayıcı hangi olayın gerçekleştiğini callback fonksiyonuna bir argüman olarak geçirir.
      mediaQuery.addEventListener("change", onChange);

      return () => mediaQuery.removeEventListener("change", onChange);
    } else {
    }
  }, []);

  return (
    <aside
      className={cn(
        "transition-[width] duration-300",
        "relative flex flex-col shrink-0 border-r backdrop-blur pl-2",
        collapsed ? "w-16" : "w-64",
        "overflow-x-visible"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-3",
          collapsed && "px-2 relative"
        )}
      >
        <span
          className={cn(
            "text-sm font-semibold transition-[max-width,opacity] duration-300 overflow-hidden whitespace-nowrap",
            collapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
          )}
          aria-hidden={collapsed}
        >
          Workspace
        </span>

        <button
          onClick={() => setCollapsed((state) => !state)}
          title={collapsed ? "Expand" : "Collapse"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "group absolute top-3 -right-3 z-20 grid place-items-center",
            "h-8 w-8 rounded-full border bg-white shadow-md",
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

      {/* İçerik */}
      {!collapsed && (
        <div className="animate-in fade-in-0 zoom-in-95 duration-400">
          {/* Create board */}
          <div className="px-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {}}
            >
              <Plus className="h-4 w-4" />
              <span>New board</span>
            </Button>
          </div>

          {/* Main nav */}
          <nav className="mt-3 px-2 space-y-1">
            {mainItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer",
                      "hover:bg-gray-100",
                      active && "bg-gray-100 font-medium"
                    )}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          {/* Favorites */}
          <div className="mt-4 px-2">
            <Collapsible open={favOpen} onOpenChange={setFavOpen}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase text-gray-500">
                  Favorites
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 cursor-pointer"
                  >
                    {favOpen ? "Hide" : "Show"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-1 space-y-1">
                  {
                    <Link href="/dashboard/favorites">
                      <div
                        className={cn(
                          "flex gap-2 text-sm rounded-md items-center px-2 py-2",
                          "hover:bg-gray-100",
                          pathname === "/dashboard/favorites" &&
                            "bg-gray-100 font-medium"
                        )}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4 transition-all duration-300",
                            pathname === "/dashboard/favorites" && "fill-black"
                          )}
                        />
                        <span className="truncate">Favoriler</span>
                      </div>
                    </Link>
                  }
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Workspaces */}
          {/* <div className="mt-4 px-2">
            <Collapsible open={wsOpen} onOpenChange={setWsOpen}>
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase text-gray-500">
                  Workspaces
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    {wsOpen ? "Hide" : "Show"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-1 space-y-1">
                  <Link href="/dashboard/boards/design">
                    <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100">
                      <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                      <span className="truncate">Design team</span>
                    </div>
                  </Link>
                  <Link href="/dashboard/boards/engineering">
                    <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                      <span className="truncate">Engineering</span>
                    </div>
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div> */}

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t p-2 bg-white/60 backdrop-blur-sm">
            <Link href="/main/settings">
              <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
