"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChartColumn,
  ListChecks,
  LogIn,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routest";

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();
  const t = useTranslations("HomePage");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(ROUTES.MAIN);
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  const featureCards = [
    {
      title: t("features.timeline.title"),
      subTitle: t("features.timeline.subTitle"),
      icon: ChartColumn,
      slug: "zaman-cizelgesi",
      shortDescription: t("features.timeline.shortDesc"),
      longDescription: t("features.timeline.longDesc"),
      sectionClassName:
        "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-950",
      headingClassName: "text-white",
      textClassName: "text-slate-300/90",
      iconClassName: "text-blue-400/80",
      reverse: false,
    },
    {
      title: t("features.tasks.title"),
      subTitle: t("features.tasks.subTitle"),
      icon: ListChecks,
      slug: "gorev-yonetimi",
      shortDescription: t("features.tasks.shortDesc"),
      longDescription: t("features.tasks.longDesc"),
      sectionClassName:
        "border-y border-border/40 bg-gradient-to-b from-slate-50/60 to-blue-50/40 text-foreground dark:from-zinc-900/50 dark:to-slate-900/30",
      headingClassName: "text-foreground",
      textClassName: "text-muted-foreground",
      iconClassName: "text-primary/80",
      reverse: true,
    },
    {
      title: t("features.account.title"),
      subTitle: t("features.account.subTitle"),
      icon: LogIn,
      slug: "hesap-yonetimi",
      shortDescription: t("features.account.shortDesc"),
      longDescription: t("features.account.longDesc"),
      sectionClassName:
        "bg-gradient-to-br from-blue-950 via-slate-900 to-blue-950 text-slate-100 dark:from-slate-950 dark:via-zinc-950 dark:to-slate-950",
      headingClassName: "text-white",
      textClassName: "text-slate-300/90",
      iconClassName: "text-blue-400/80",
      reverse: false,
    },
  ];

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      {/* Üst gradyan ışığı */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-112 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_54%)]" />

      {/* HERO SECTION */}
      <section className="relative mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-6 py-20 md:px-12 lg:flex-row lg:px-16 lg:py-32">
        <div className="flex flex-col justify-center items-center text-center lg:w-5/12 lg:items-start lg:text-left">
          <h1 className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl md:text-7xl lg:text-8xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 w-full max-w-xl text-base text-muted-foreground md:text-xl leading-relaxed">
            {t("heroDescription")}
          </p>
          <Button
            className="mt-8 w-full sm:w-fit gap-2 px-8 py-6 text-base shadow-md transition-all duration-300 ease-in-out hover:shadow-lg active:scale-98"
            onClick={() => router.push(ROUTES.SIGN_UP)}
          >
            {t("getStarted")}
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* ÜST KARTLAR GRID YAPISI */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:w-7/12 lg:grid-cols-3 lg:pt-0">
          {featureCards.map((card, index) => (
            <Card
              key={index}
              className="flex h-full w-full flex-col border-border/70 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-primary hover:shadow-xl dark:bg-card/80"
            >
              <CardHeader className="flex flex-col items-center space-y-4 border-b p-6 text-center lg:items-start lg:text-left">
                <div className="w-fit rounded-full bg-primary/10 p-4 text-primary">
                  <card.icon size={28} />
                </div>
                <CardTitle className="text-xl font-extrabold tracking-tight">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex h-full flex-col items-center justify-between p-6 text-center lg:items-start lg:text-left">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {card.shortDescription}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 h-auto px-0 text-sm md:text-base font-semibold text-primary transition-colors hover:bg-transparent hover:text-primary/80 group"
                  onClick={() => scrollToSection(card.slug + "-detay")}
                >
                  {t("buttons.moreInfo")}
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* DETAY SECTIONS */}
      {featureCards.map((card, index) => (
        <section
          key={index}
          id={card.slug + "-detay"}
          className={`${card.sectionClassName} relative w-full overflow-hidden py-16 md:py-28 transition-colors duration-300`}
        >
          <div className="relative z-10 mx-auto flex max-w-screen-xl flex-col items-center gap-12 px-6 sm:px-12 md:px-16 lg:flex-row lg:gap-16 lg:px-8">
            
            {/* CANLI UYGULAMA MOCKUP ALANI */}
            <div
              className={`flex w-full items-center justify-center lg:w-1/2 ${
                card.reverse ? "lg:order-2" : "lg:order-1"
              }`}
            >
              {/* 📊 MOCKUP 1: ZAMAN ÇİZGELGESİ (GANTT CHART) */}
              {card.slug === "zaman-cizelgesi" && (
                <div className="w-full max-w-md md:max-w-xl rounded-xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30 overflow-hidden">
                  {/* Pencere Kontrolleri */}
                  <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="font-mono text-[10px] tracking-wider text-slate-500">Gantt_Timeline.tsx</span>
                  </div>
                  
                  {/* Simüle Edilmiş Gantt Şeması */}
                  <div className="relative space-y-3.5 py-1 min-h-[120px]">
                    {/* Grid Çizgisi İllüzyonları */}
                    <div className="absolute inset-y-0 left-1/4 w-px bg-white/5 pointer-events-none" />
                    <div className="absolute inset-y-0 left-2/4 w-px bg-white/5 pointer-events-none" />
                    <div className="absolute inset-y-0 left-3/4 w-px bg-white/5 pointer-events-none" />

                    {/* Gantt Görev Barları */}
                    <div className="relative h-7 rounded bg-blue-500/20 border border-blue-500/30 px-2.5 flex items-center ml-[5%] w-[60%] z-10">
                      <span className="text-[10px] font-bold text-blue-400 truncate">Sprint 1: Altyapı Kurulumu</span>
                    </div>
                    
                    <div className="relative h-7 rounded bg-indigo-500/20 border border-indigo-500/30 px-2.5 flex items-center ml-[25%] w-[55%] z-10">
                      <span className="text-[10px] font-bold text-indigo-400 truncate">Auth Entegrasyonu</span>
                    </div>
                    
                    <div className="relative h-7 rounded bg-purple-500/20 border border-purple-500/30 px-2.5 flex items-center ml-[40%] w-[55%] z-10">
                      <span className="text-[10px] font-bold text-purple-400 truncate">Sprint 2: Dashboard Tasarımı</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 📋 MOCKUP 2: GÖREV YÖNETİMİ (KANBAN BOARD) */}
              {card.slug === "gorev-yonetimi" && (
                <div className="w-full max-w-md md:max-w-xl rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-4 shadow-2xl backdrop-blur-md transition-all duration-500 hover:scale-[1.02]">
                  {/* Kanban Sütunları Yapısı */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Sütun 1 */}
                    <div className="rounded-lg bg-slate-100/70 dark:bg-zinc-900/60 p-2.5">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Yapılacaklar</span>
                      <div className="mt-2 space-y-2">
                        <div className="rounded-md border border-border/60 bg-background p-2 shadow-xs">
                          <p className="text-[11px] font-semibold">API Dokümantasyonu</p>
                          <div className="mt-2 h-1 w-8 rounded bg-amber-400" />
                        </div>
                        <div className="rounded-md border border-border/60 bg-background p-2 shadow-xs">
                          <p className="text-[11px] font-semibold">Responsive Bugfix</p>
                          <div className="mt-2 h-1 w-8 rounded bg-rose-500" />
                        </div>
                      </div>
                    </div>
                    {/* Sütun 2 */}
                    <div className="rounded-lg bg-slate-100/70 dark:bg-zinc-900/60 p-2.5">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Tamamlananlar</span>
                      <div className="mt-2 space-y-2">
                        <div className="rounded-md border border-border/40 bg-background/50 dark:bg-background/40 p-2 shadow-2xs opacity-75">
                          <p className="text-[11px] font-semibold line-through text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                            Database Kurulumu
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🔐 MOCKUP 3: HESAP YÖNETİMİ (SECURE ACCESS) */}
              {card.slug === "hesap-yonetimi" && (
                <div className="grid w-full max-w-md md:max-w-xl grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                  <div className="group/btn flex min-h-[14rem] sm:min-h-[16rem] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-900/80">
                    <div className="flex flex-col items-center transition-transform duration-300 group-hover/btn:scale-105">
                      <FcGoogle size={44} className="mb-4 sm:size-12 drop-shadow-xs" />
                      <span className="text-center text-base font-bold tracking-tight">
                        {t("buttons.googleLogin")}
                      </span>
                      <p className="mt-1.5 text-center text-xs text-slate-400">
                        {t("buttons.quickStart")}
                      </p>
                    </div>
                  </div>

                  <div className="group/btn flex min-h-[14rem] sm:min-h-[16rem] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center shadow-xl backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-900/80">
                    <div className="flex flex-col items-center transition-transform duration-300 group-hover/btn:scale-105">
                      <div className="mb-4 rounded-full bg-blue-500/10 p-3 text-blue-400 border border-blue-500/20">
                        <Mail size={24} />
                      </div>
                      <span className="text-xl font-extrabold tracking-tight">
                        {t("buttons.register")}
                      </span>
                      <p className="mt-1.5 text-xs text-slate-400">
                        {t("buttons.emailPassword")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* METİN VE AÇIKLAMA ALANI */}
            <div
              className={`flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left ${
                card.reverse ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <p
                className={`mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] ${card.textClassName}`}
              >
                {card.subTitle}
              </p>
              <h2
                className={`mb-5 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl ${card.headingClassName}`}
              >
                {card.title}
              </h2>
              <p className={`mb-6 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl ${card.textClassName}`}>
                {card.longDescription}
              </p>
            </div>

          </div>
        </section>
      ))}
    </main>
  );
}