"use client";
import { ProjectInitialization } from "@/features/components/project/project-initialization";
import useSWR from "swr";
import { Link } from "@/i18n/routing";
import { Spinner } from "@/components/ui/spinner";
import { ProjectList } from "@/features/components/project/project-list";
import { Button } from "@/components/ui/button";
import Home from "../page";
import { useTranslations } from "next-intl";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Veri çekilirken bir hata oluştu.");
  }
  return res.json();
};

export default function Projects() {
  const t = useTranslations("Projects");
  const {
    data: projects,
    error,
    isLoading,
  } = useSWR("/api/project", fetcher, {
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-col h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  // 4. Hata durumu
  if (error) {
    // Hata mesajı varsa onu, yoksa çeviri dosyasındaki varsayılanı göster
    const errorMessage = error.message || t("error.unknown");

    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-red-200 dark:border-red-800/50">
          {/* Hata Başlığı */}
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center">
            {t("error.title")} {/* 👇 Çeviri */}
          </h2>

          <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
            {errorMessage}
          </p>

          {/* Yetki Hatası Kontrolü */}
          {/* Not: API'den dönen "Giriş Yapın" mesajı dilden bağımsız olabilir, 
              o yüzden include kontrolünü backend'den gelen error code ile yapmak daha sağlıklıdır 
              ama şimdilik string kontrolüyle devam ediyoruz. */}
          {errorMessage.includes("Giriş") ||
          errorMessage.includes("Unauthorized") ? (
            <Link href="/auth/sign-in">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                {t("error.signInButton")}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              {t("error.retryButton")} {/* 👇 Çeviri */}
            </Button>
          )}

          {/* Destek Metni */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            {t("error.support")} {/* 👇 Çeviri */}
          </p>
        </div>
      </div>
    );
  }

  // 5. Başarılı Veri
  return (
    <>
      <ProjectList projects={projects} />
    </>
  );
}
