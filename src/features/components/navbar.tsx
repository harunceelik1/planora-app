"use client";

import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { LogOut, Settings } from "lucide-react";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const name = session?.user?.name
    ?.split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const initials = (session?.user?.name || session?.user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  // Split fonksiyonu stringi parçalara ayırır ve bunu dizi olarak döndürür örneğin: "John Doe" -> ["John", "Doe"]
  // Map fonksiyonu ise bu dizinin her bir elemanına uygulanır. Örneğin yukarıdaki örnekte her ismin ilk harfini alır.
  // Join fonksiyonu ise bu harfleri tekrar birleştirir. Örneğin: ["J", "D"] -> "JD"
  // Slice fonksiyonu ise stringin belirli bir kısmını alır. Örneğin: "JD" -> "JD" (ilk 2 karakter)
  // Charat fonksiyonu ise stringin belirli bir indeksindeki karakteri alır. Örneğin: "John" -> 'J' (0. indeks)
  return (
    <header
      className="
        sticky top-0 z-50 w-full
        border-b
        bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm
      "
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
        {/* Sol: Logo + Menü */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold cursor-pointer"
            aria-label="Planora Home"
          >
            Planora
          </button>

          <div className="hidden md:flex items-center gap-1 text-lg">
            <Button
              variant="link"
              className="hover:bg-gray-100 transition-colors font-semibold"
              onClick={() => router.push("/")}
            >
              Home
            </Button>
            <Button
              variant="link"
              className="hover:bg-gray-100 transition-colors font-semibold"
              onClick={() => router.push("/about")}
            >
              About
            </Button>
          </div>
        </div>

        {/* Sağ: Auth durumu */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <Spinner className="size-4" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Kullanıcı menüsü"
                  className="group relative h-9 w-9 overflow-hidden rounded-full cursor-pointer"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "Kullanıcı"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-[350px]"
                sideOffset={8}
              >
                <DropdownMenuLabel className="pb-3">
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || "Kullanıcı"}
                      />
                      <AvatarFallback className="text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[15px] leading-tight truncate">
                        {name || "Kullanıcı"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mt-3 px-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs h-7 px-3 cursor-pointer"
                      onClick={() => router.push("/dashboard/profile")}
                    >
                      <Settings className="h-4 w-4" />
                      Hesap ayarları
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs h-7 px-3 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              className="h-8 px-3 text-sm cursor-pointer"
              onClick={() => router.push("/sign-in")}
            >
              Giriş Yap
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
