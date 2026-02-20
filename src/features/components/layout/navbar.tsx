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
import { LogOut, Settings, Menu, Home } from "lucide-react";
import { formatName, getInitials } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routest";
import { LanguageSwitcher } from "../language-switcher/language-switcher";
import useSWR from "swr";

export const Navbar = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: user } = useSWR(session?.user ? "/api/profile" : null, fetcher);

  const t = useTranslations("Navbar");

  const initials = getInitials(session?.user.name, session?.user.email);
  const name = formatName(session?.user.name);

  const navLinks = [{ name: t("links.home"), href: "/", icon: Home }];

  const displayImage = user?.image || session?.user?.image;

  return (
    // DÜZELTME 1: bg-white yerine bg-background, border-b border-border
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-10">
          <div
            onClick={() => router.push(ROUTES.MAIN)}
            className="cursor-pointer flex items-center"
          >
            {/* NOT: Eğer logo siyah yazılıysa dark modda görünmez olabilir. 
                Gerekirse className'e 'dark:invert' ekleyebilirsin. */}
            <Image
              alt="Planora Logo"
              src="/images/logo-yazı.png"
              width={72}
              height={32}
              className="inline-block mr-2"
            />
          </div>

          <div className="md:flex hidden items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost" // Link yerine Ghost daha modern durur
                // DÜZELTME 2: text-gray-700 yerine text-muted-foreground
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

          {status === "loading" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4 animate-spin text-muted-foreground" />
              <span>{t("auth.loading")}</span>
            </div>
          ) : session?.user ? (
            /* Giriş Yapmış Kullanıcı */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={t("aria.userMenu")}
                  // DÜZELTME 3: ring-gray-200 yerine ring-border
                  className="group relative h-9 w-9 overflow-hidden rounded-full cursor-pointer ring-2 ring-border hover:ring-muted-foreground/50 transition-all"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={displayImage || undefined}
                      alt={session.user.name || "User Avatar"}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* DÜZELTME 4: Fallback renkleri */}
                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 md:w-72 shadow-lg bg-popover text-popover-foreground border-border" // Renkleri garantiye aldık
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
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm leading-tight truncate text-foreground">
                        {user?.name || name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 focus:bg-accent focus:text-accent-foreground"
                  onSelect={() => router.push(ROUTES.PROFILE)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>{t("auth.profile")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/20"
                  onSelect={() => signOut({ callbackUrl: ROUTES.SIGN_IN })}
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  <span>{t("auth.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Giriş Yapmamış Kullanıcı */
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.SIGN_IN)}
              className="h-9 px-4 text-sm transition-colors border-input hover:bg-accent hover:text-accent-foreground"
            >
              {t("auth.signIn")}
            </Button>
          )}

          {/* Mobil Menü */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  // DÜZELTME 5: Mobil menü butonu renkleri
                  className="h-9 w-9 text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              {/* DÜZELTME 6: Sheet arka planı */}
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
                  <div className="mb-4 flex justify-start">
                    <LanguageSwitcher />
                  </div>

                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      // DÜZELTME 7: Mobil link renkleri
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
                      {/* DÜZELTME 8: Kullanıcı bilgi kartı bg-muted oldu */}
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
