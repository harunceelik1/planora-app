"use client";

import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { LogOut, Settings, Menu, Home, Bell } from "lucide-react";
import { formatName, getInitials } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLocale, useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routest";
import { LanguageSwitcher } from "../language-switcher/language-switcher";
import useSWR from "swr";
import { ModeToggle } from "../theme/mode-toggle";

interface NavbarNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  issue?: {
    number: number;
    title: string;
    project: {
      id: string;
      projectKey: string;
    };
  } | null;
}

interface NotificationsResponse {
  notifications: NavbarNotification[];
  unreadCount: number;
}

export const Navbar = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: user } = useSWR(session?.user ? "/api/profile" : null, fetcher);
  const { data: notificationsData, mutate: mutateNotifications } = useSWR<NotificationsResponse>(
    session?.user ? "/api/notifications" : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  const t = useTranslations("Navbar");
  const locale = useLocale();

  const initials = getInitials(session?.user.name, session?.user.email);
  const name = formatName(session?.user.name);

  const navLinks = [{ name: t("links.home"), href: "/", icon: Home }];

  const displayImage = user?.image || session?.user?.image;
  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const formatNotificationTime = (value: string) => {
    const createdAt = new Date(value);
    const diffMs = createdAt.getTime() - Date.now();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (Math.abs(diffHours) < 24) {
      return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
        diffHours,
        "hour",
      );
    }

    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      diffDays,
      "day",
    );
  };

  const markNotificationAsRead = async (notificationId?: string) => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        notificationId ? { notificationId } : { markAll: true },
      ),
    });
    mutateNotifications();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/10 bg-background/95 backdrop-blur-sm">
      <nav className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <div className="md:flex hidden items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className="text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => router.push(ROUTES.MAIN)}
              >
                {link.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          <ModeToggle />

          {status === "loading" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4 animate-spin text-muted-foreground" />
              <span>{t("auth.loading")}</span>
            </div>
          ) : session?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label={t("aria.notifications")}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Bell className="h-4.5 w-4.5 " />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1  rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 border-border bg-popover text-popover-foreground shadow-lg"
                  sideOffset={12}
                >
                  <DropdownMenuLabel className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {t("notifications.title")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {unreadCount > 0
                          ? t("notifications.unreadCount", { count: unreadCount })
                          : t("notifications.empty")}
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => markNotificationAsRead()}
                      >
                        {t("notifications.markAll")}
                      </Button>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-border" />

                  <div className="max-h-96 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                        {t("notifications.empty")}
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          className={`w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent ${
                            notification.isRead ? "opacity-80  " : "bg-accent/40"
                          }`}
                          onClick={async () => {
                            await markNotificationAsRead(notification.id);
                            if (notification.issue?.project?.id) {
                              router.push(
                                `/main/projects/${notification.issue.project.id}`,
                              );
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {notification.title}
                              </p>
                              <p className="text-xs leading-5 text-muted-foreground">
                                {notification.message}
                              </p>
                              {notification.issue?.title && (
                                <p className="text-xs font-medium text-foreground/80">
                                  {notification.issue.project.projectKey}-
                                  {notification.issue.number} ·{" "}
                                  {notification.issue.title}
                                </p>
                              )}
                            </div>
                            {!notification.isRead && (
                              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                            )}
                          </div>
                          <div className="mt-2 text-[11px] text-muted-foreground">
                            {formatNotificationTime(notification.createdAt)}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label={t("aria.userMenu")}
                    className="group relative h-9 w-9 overflow-hidden rounded-full cursor-pointer ring-2 ring-border transition-all hover:ring-muted-foreground/50"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={displayImage || undefined}
                        alt={session.user.name || "User Avatar"}
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-64 border-border bg-popover text-popover-foreground shadow-lg md:w-72"
                  sideOffset={12}
                >
                  <DropdownMenuLabel className="p-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={displayImage || undefined}
                          alt={session.user.name || "User Avatar"}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold leading-tight text-foreground">
                          {user?.name || name || "User"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {session.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 focus:bg-accent focus:text-accent-foreground"
                    onSelect={() => router.push(ROUTES.PROFILE)}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>{t("auth.profile")}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 text-red-600 focus:bg-red-100 focus:text-red-600 dark:focus:bg-red-900/20"
                    onSelect={() => signOut({ callbackUrl: ROUTES.SIGN_IN })}
                  >
                    <LogOut className="h-4 w-4 text-red-600" />
                    <span>{t("auth.signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.SIGN_IN)}
              className="h-9 px-4 text-sm transition-colors border-input hover:bg-accent hover:text-accent-foreground"
            >
              {t("auth.signIn")}
            </Button>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[250px] sm:w-[300px] bg-background border-l-border"
              >
                <SheetHeader>
                  <SheetTitle className="text-2xl font-extrabold text-foreground">
                    Planora
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2 mt-6 px-4 w-full">
                  <div className="mb-4 flex items-center justify-start gap-3">
                    <LanguageSwitcher />
                    <ModeToggle />
                  </div>

                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className="justify-start text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors h-10 px-4"
                      onClick={() => router.push(link.href)}
                    >
                      <link.icon className="mr-3 h-5 w-5" />
                      {link.name}
                    </Button>
                  ))}

                  <div className="my-4 border-t border-border" />

                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={displayImage || undefined}
                            alt="User Avatar"
                          />
                          <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm leading-tight truncate text-foreground">
                            {user?.name || name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        className="justify-start text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors h-10 px-4"
                        onClick={() => router.push(ROUTES.PROFILE)}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        {t("auth.profile")}
                      </Button>

                      <Button
                        variant="ghost"
                        className="justify-start text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-colors h-10 px-4 mt-2"
                        onClick={() => signOut({ callbackUrl: "/sign-in" })}
                      >
                        <LogOut className="mr-3 h-5 w-5 text-red-600" />
                        {t("auth.signOut")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => router.push(ROUTES.SIGN_IN)}
                      className="w-full h-10 text-base font-semibold border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {t("auth.signIn")}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
