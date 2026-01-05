"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing"; // 👈 ÖNEMLİ: Kendi navigation dosyanızdan çekin
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher"); // JSON'a ekleyeceğiz
  const locale = useLocale(); // Şu anki aktif dil (tr veya en)
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (nextLocale: string) => {
    startTransition(() => {
      // Mevcut yolu koruyarak sadece dili değiştirir
      // Örn: /tr/projects -> /en/projects
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <Select
      defaultValue={locale}
      onValueChange={handleValueChange}
      disabled={isPending}
    >
      <SelectTrigger className="cursor-pointer h-9 gap-2 bg-transparent border-1 focus:ring-0 focus:ring-offset-0">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder={t("label")} />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="tr" className="cursor-pointer">
          Türkçe
        </SelectItem>
        <SelectItem value="en" className="cursor-pointer">
          English
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
