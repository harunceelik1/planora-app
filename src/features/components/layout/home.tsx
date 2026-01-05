"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Not: i18n/navigation.ts'den import etmek daha iyidir ama şimdilik kalsın
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ListChecks, LogIn, Mail, ChartColumn } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FcGoogle } from "react-icons/fc";
import { ROUTES } from "@/constants/routest";
import { useTranslations } from "next-intl"; // 👈 1. IMPORT ET

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  // 👇 2. HOOK'U BAŞLAT ("HomePage" anahtarı altındaki verilere erişir)
  const t = useTranslations("HomePage");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(ROUTES.PROJECTS.LIST);
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Kart Verileri (Metinler artık t() fonksiyonu ile geliyor)
  const featureCards = [
    {
      title: t("features.timeline.title"), // 👈 JSON'dan çekiyoruz
      subTitle: t("features.timeline.subTitle"),
      icon: ChartColumn,
      slug: "zaman-cizelgesi",
      shortDescription: t("features.timeline.shortDesc"),
      longDescription: t("features.timeline.longDesc"),
      bgColor: "bg-[#0b2e59]",
      subTextColor: "text-gray-100",
      reverse: false,
    },
    {
      title: t("features.tasks.title"),
      subTitle: t("features.tasks.subTitle"),
      icon: ListChecks,
      slug: "gorev-yonetimi",
      shortDescription: t("features.tasks.shortDesc"),
      longDescription: t("features.tasks.longDesc"),
      bgColor: "bg-indigo-50",
      subTextColor: "text-gray-700",
      reverse: true,
    },
    {
      title: t("features.account.title"),
      subTitle: t("features.account.subTitle"),
      icon: LogIn,
      slug: "hesap-yonetimi",
      shortDescription: t("features.account.shortDesc"),
      longDescription: t("features.account.longDesc"),
      bgColor: "bg-[#0b2e59]",
      subTextColor: "text-gray-100",
      reverse: true,
    },
  ];

  return (
    <main className="relative flex flex-col min-h-screen text-gray-800">
      {/* 1. HERO BÖLÜMÜ */}
      <section className="flex flex-col lg:flex-row gap-12 py-20 lg:py-32 bg-white px-4 md:px-8 lg:px-16">
        <div className="lg:w-5/12 flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight">
            {t("heroTitle")} {/* 👈 Sabit metin yerine t() */}
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl text-gray-600">
            {t("heroDescription")}
          </p>
          <Button
            className="mt-8 px-8 py-4 w-fit gap-2 shadow-md hover:shadow-lg transition-all duration-500 ease-in-out"
            onClick={() => router.push(ROUTES.SIGN_UP)}
          >
            {t("getStarted")}
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* ... Özellik Kartları (Küçük) */}
        <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 lg:pt-0">
          {featureCards.map((card, index) => (
            <Card
              key={index}
              className="flex flex-col w-full h-full border-2 shadow-lg transition-all duration-500 ease-in-out hover:border-primary hover:shadow-2xl hover:-translate-y-1"
            >
              <CardHeader className="flex flex-col space-y-4 p-6 border-b">
                <div className="p-4 rounded-full bg-primary/10 text-primary w-fit">
                  <card.icon size={32} />
                </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-start justify-between p-6 h-full">
                <p className="text-lg text-gray-600">{card.shortDescription}</p>
                <Button
                  variant="ghost"
                  className="mt-4 px-0 h-auto font-semibold text-base text-primary hover:bg-transparent hover:text-primary/80 transition-colors"
                  onClick={() => scrollToSection(card.slug + "-detay")}
                >
                  {t("buttons.moreInfo")}
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. DETAYLI AÇIKLAMA BÖLÜMÜ */}
      {featureCards.map((card, index) => (
        <section
          key={index}
          id={card.slug + "-detay"}
          className={`${card.bgColor} w-full py-20 md:py-32 overflow-hidden relative`}
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 px-4 md:px-8 lg:px-0">
            {/* GÖRSEL ALANI */}
            <div
              className={`lg:w-1/2 flex items-center justify-center ${
                card.reverse ? "lg:order-2" : "lg:order-1"
              }`}
            >
              {card.slug === "hesap-yonetimi" ? (
                // HESAP YÖNETİMİ ÖZEL KISMI
                <div className="flex w-full relative py-12 px-6">
                  {/* Sol Kart */}
                  <div
                    className={`w-1/2 h-96 rounded-3xl border flex flex-col items-center justify-center p-6 bg-gray-800 text-gray-200 border-gray-800 shadow-xl z-0 lg:translate-x-[-4px]`}
                  >
                    <div className="flex flex-col items-center">
                      <FcGoogle size={64} className="mb-4" />
                      <span className="text-xl font-semibold text-white text-center">
                        {t("buttons.googleLogin")}
                      </span>
                      <p className="text-sm text-center text-gray-400 mt-2">
                        {t("buttons.quickStart")}
                      </p>
                    </div>
                  </div>

                  {/* Sağ Kart */}
                  <div
                    className={`w-1/2 h-96 bg-white p-6 rounded-3xl flex flex-col items-center justify-center text-center z-10 border border-gray-300 shadow-xl lg:-translate-x-16`}
                  >
                    <Mail size={48} className="text-primary mb-4" />
                    <span className="text-5xl font-extrabold text-gray-900 leading-none">
                      {t("buttons.register")}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      {t("buttons.emailPassword")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 w-full max-w-md">
                  <card.icon
                    size={160}
                    className={`${
                      card.bgColor === "bg-[#0b2e59]"
                        ? "text-white/80"
                        : "text-primary/80"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* METİN ALANI */}
            <div
              className={`lg:w-1/2 flex flex-col items-start text-left ${
                card.reverse ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <h2
                className={`text-5xl md:text-6xl font-extrabold leading-tight mb-6 ${
                  card.bgColor === "bg-[#0b2e59]"
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                {card.title}
              </h2>
              <p
                className={`text-xl leading-relaxed ${card.subTextColor} mb-8`}
              >
                {card.longDescription}
              </p>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
