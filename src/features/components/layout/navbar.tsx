"use client";

import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { LogOut, Settings, Menu, Home, Info, User } from "lucide-react";
import { formatName, getInitials } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const initials = getInitials(session?.user.name, session?.user.email);
  const name = formatName(session?.user.name);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    // { name: "About", href: "/about", icon: Info },
  ];

  return (
    <header
      className="
        sticky top-0 z-50 w-full
        border-b
        bg-white/90 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 shadow-sm
      "
    >
      {/* max-w-7xl içindeki nav elementi ile tüm içeriğin sola ve sağa yaslı kalmasını sağlıyoruz */}
      <nav
        className=" flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 
      "
      >
        <div className="flex items-center gap-10">
          <Image
            alt="Planora Logo"
            src="/images/logo-yazı.png"
            width={72}
            height={32}
            className="inline-block mr-2 "
          />
          {/* Masaüstü Navigasyon Linkleri */}
          <div className="md:flex hidden items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                variant="link"
                className="text-base font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => router.push(link.href)}
              >
                {link.name}
              </Button>
            ))}
          </div>
        </div>

        {/* SAĞ KISIM: Kullanıcı Durumu / Giriş Butonu (Sağda sabit) */}
        <div className="flex items-center justify-end  gap-3">
          {status === "loading" ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner className="size-4 animate-spin text-gray-500" />{" "}
              {/* Spinner rengi nötr */}
              <span>Loading...</span>
            </div>
          ) : session?.user ? (
            /* Giriş Yapmış Kullanıcı Dropdown Menüsü */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User menu"
                  className="group relative h-9 w-9 overflow-hidden rounded-full cursor-pointer ring-2 ring-gray-200 hover:ring-gray-400 transition-all"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User Avatar"}
                      className="object-cover"
                    />
                    {/* Avatar Fallback rengi gri tonlarına döndü */}
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
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || "User Avatar"}
                      />
                      <AvatarFallback className="text-sm font-semibold bg-gray-200 text-gray-600">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm leading-tight truncate">
                        {name || "User"}
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
                  onSelect={() => router.push("/dashboard/profile")}
                >
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
                  onSelect={() => signOut({ callbackUrl: "/sign-in" })}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push("/sign-in")}
              className="h-9 px-4 text-sm transition-colors"
            >
              Sign In
            </Button>
          )}

          {/* Mobil Menü Butonu (Sadece Küçük Ekranlarda) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-gray-700 border-gray-300 hover:bg-gray-50"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] ">
                <SheetHeader>
                  {/* Logo rengi nötr */}
                  <SheetTitle className="text-2xl font-extrabold text-gray-900">
                    Planora
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2 mt-6 px-4 w-full">
                  {/* Navigasyon Linkleri */}
                  {navLinks.map((link) => (
                    <Button
                      key={link.name}
                      variant="ghost"
                      // Hover rengi nötr
                      className="justify-start text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors h-10 px-4"
                      onClick={() => {
                        router.push(link.href);
                      }}
                    >
                      <link.icon className="mr-3 h-5 w-5" />
                      {link.name}
                    </Button>
                  ))}

                  <div className="my-4 border-t border-gray-200" />

                  {/* Mobil Kullanıcı Menüsü/Giriş Butonu */}
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={session.user.image || ""}
                            alt="User Avatar"
                          />
                          <AvatarFallback className="text-xs font-semibold bg-gray-200 text-gray-600">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm leading-tight truncate">
                            {name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        className="justify-start text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors h-10 px-4"
                        onClick={() => router.push("/dashboard/profile")}
                      >
                        <Settings className="mr-3 h-5 w-5" />
                        Profile Settings
                      </Button>

                      <Button
                        variant="ghost"
                        className="justify-start text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors h-10 px-4 mt-2"
                        onClick={() => signOut({ callbackUrl: "/sign-in" })}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => router.push("/sign-in")}
                      className="w-full h-10 text-base font-semibold border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      Sign In
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
