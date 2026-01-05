import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation"; // <-- DEĞİŞİKLİK BURADA

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
});

// createSharedPathnamesNavigation yerine createNavigation kullanıyoruz
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
