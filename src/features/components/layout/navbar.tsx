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
import { LogOut, Settings, Menu, Home } from "lucide-react"; // Info ve User kullanılmıyordu sildim
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

  // SWR ile güncel veriyi çekiyoruz
  const { data: user } = useSWR(session?.user ? "/api/profile" : null, fetcher);

  const t = useTranslations("Navbar");

  const initials = getInitials(session?.user.name, session?.user.email);
  const name = formatName(session?.user.name);

  const navLinks = [{ name: t("links.home"), href: "/", icon: Home }];

  const displayImage = user ? user.image : session?.user?.image;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-10">
          <div
            onClick={() => router.push("/")}
            className="cursor-pointer flex items-center"
          >
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
                variant="link"
                className="text-base font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => router.push(link.href)}
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
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner className="size-4 animate-spin text-gray-500" />
              <span>{t("auth.loading")}</span>
            </div>
          ) : session?.user ? (
            /* Giriş Yapmış Kullanıcı */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={t("aria.userMenu")}
                  className="group relative h-9 w-9 overflow-hidden rounded-full cursor-pointer ring-2 ring-gray-200 hover:ring-gray-400 transition-all"
                >
                  <Avatar className="h-full w-full">
                    {/* 👇 DÜZELTİLDİ: displayImage kullanıyoruz */}
                    <AvatarImage
                      src={displayImage || undefined}
                      alt={session.user.name || "User Avatar"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs font-semibold bg-gray-200 text-gray-600">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 md:w-72 shadow-lg"
                sideOffset={12}
              >
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {/* 👇 DÜZELTİLDİ: displayImage kullanıyoruz */}
                      <AvatarImage
                        src={displayImage || undefined}
                        alt={session.user.name || "User Avatar"}
                      />
                      <AvatarFallback className="text-sm font-semibold bg-gray-200 text-gray-600">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm leading-tight truncate">
                        {user?.name || name || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onSelect={() => router.push(ROUTES.PROFILE)}
                >
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>{t("auth.profile")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
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
              className="h-9 px-4 text-sm transition-colors"
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
                  className="h-9 w-9 text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-extrabold text-gray-900">
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
                      className="justify-start text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors h-10 px-4"
                      onClick={() => router.push(link.href)}
                    >
                      <link.icon className="mr-3 h-5 w-5" />
                      {link.name}
                    </Button>
                  ))}

                  <div className="my-4 border-t border-gray-200" />

                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-9 w-9">
                          {/* 👇 DÜZELTİLDİ: displayImage kullanıyoruz */}
                          <AvatarImage
                            src={displayImage || undefined}
                            alt="User Avatar"
                          />
                          <AvatarFallback className="text-xs font-semibold bg-gray-200 text-gray-600">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm leading-tight truncate">
                            {user?.name || name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        className="justify-start text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors h-10 px-4"
                        onClick={() => router.push(ROUTES.PROFILE)}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        {t("auth.profile")}
                      </Button>

                      <Button
                        variant="ghost"
                        className="justify-start text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors h-10 px-4 mt-2"
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
                      className="w-full h-10 text-base font-semibold border-gray-300 hover:bg-gray-100 transition-colors"
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
