"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { CircleCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export const ProjectInitialization = () => {
  const { data: session } = useSession();

  // 👇 3. Hook'u başlat
  const t = useTranslations("ProjectInitialization");

  // Kullanıcı adı varsa onu, yoksa çevirideki varsayılanı ("Kullanıcı" veya "User") kullan
  const userName = session?.user?.name || t("common.defaultUser");

  return (
    // Tailwind CSS sınıfları ile şık bir container
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="">
        {/* Başlık ve karşılama mesajı */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            {t("header.greeting", { name: userName })}
          </h1>
          <p className="opacity-50 font-mono">
            {t("header.subtitle")} {/* Çeviri */}
          </p>
        </div>

        {/* Ana içerik bölümü */}
        <div className="space-y-6">
          <div className="bg-indigo-50 border-l-4 p-4 rounded-md">
            <div className="flex items-center">
              <CircleCheck className="w-6 h-6 mr-3" />
              <p className="text-md">
                {t("info.text")} {/* Çeviri */}
              </p>
            </div>
          </div>

          {/* Aksiyon Butonları (Örnek) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link href="/main/create-project">
              <Button className="p-8 w-full" variant={"default"}>
                {t("actions.createProject")} {/* Çeviri */}
              </Button>
            </Link>
            <Button className="p-8" variant={"outline"}>
              {t("actions.manageTeam")} {/* Çeviri */}
            </Button>
          </div>
        </div>

        <Separator className="my-8" />
        <p className="text-sm text-center text-gray-500">
          {t("footer.note")} {/* Çeviri */}
        </p>
      </div>
    </div>
  );
};
