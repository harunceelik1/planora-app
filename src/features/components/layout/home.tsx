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
        "bg-[linear-gradient(135deg,rgba(10,37,73,0.98),rgba(21,72,135,0.92))] text-white dark:bg-[linear-gradient(135deg,rgba(7,20,39,0.98),rgba(18,53,97,0.94))]",
      headingClassName: "text-white",
      textClassName: "text-white/78",
      iconClassName: "text-white/80",
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
        "border-y border-border/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.94),rgba(239,244,255,0.98))] text-foreground dark:bg-[linear-gradient(180deg,rgba(23,23,23,0.92),rgba(30,41,59,0.78))]",
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
        "bg-[linear-gradient(135deg,rgba(13,31,56,0.98),rgba(10,37,73,0.92))] text-white dark:bg-[linear-gradient(135deg,rgba(8,17,31,0.98),rgba(20,35,58,0.94))]",
      headingClassName: "text-white",
      textClassName: "text-white/78",
      iconClassName: "text-white/80",
      reverse: true,
    },
  ];

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_54%)]" />

      <section className="relative flex flex-col gap-12 px-4 py-20 md:px-8 lg:flex-row lg:px-16 lg:py-32">
        <div className="flex flex-col justify-center lg:w-5/12">
          <h1 className="text-5xl font-extrabold leading-none tracking-tight md:text-7xl lg:text-8xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            {t("heroDescription")}
          </p>
          <Button
            className="mt-8 w-fit gap-2 px-8 py-4 shadow-md transition-all duration-500 ease-in-out hover:shadow-lg"
            onClick={() => router.push(ROUTES.SIGN_UP)}
          >
            {t("getStarted")}
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-12 sm:grid-cols-2 lg:w-7/12 lg:grid-cols-3 lg:pt-0">
          {featureCards.map((card, index) => (
            <Card
              key={index}
              className="flex h-full w-full flex-col border-border/70 bg-card/80 shadow-lg shadow-black/5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:border-primary hover:shadow-2xl dark:bg-card/90 dark:shadow-black/20"
            >
              <CardHeader className="flex flex-col space-y-4 border-b p-6">
                <div className="w-fit rounded-full bg-primary/10 p-4 text-primary">
                  <card.icon size={32} />
                </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex h-full flex-col items-start justify-between p-6">
                <p className="text-lg text-muted-foreground">
                  {card.shortDescription}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 h-auto px-0 text-base font-semibold text-primary transition-colors hover:bg-transparent hover:text-primary/80"
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

      {featureCards.map((card, index) => (
        <section
          key={index}
          id={card.slug + "-detay"}
          className={`${card.sectionClassName} relative w-full overflow-hidden py-20 md:py-32`}
        >
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 md:px-8 lg:flex-row lg:px-0">
            <div
              className={`flex items-center justify-center lg:w-1/2 ${
                card.reverse ? "lg:order-2" : "lg:order-1"
              }`}
            >
              {card.slug === "hesap-yonetimi" ? (
                <div className="relative flex w-full px-6 py-12">
                  <div className="z-0 flex h-96 w-1/2 flex-col items-center justify-center rounded-3xl border border-border/70 bg-card/95 p-6 text-card-foreground shadow-xl shadow-black/10 lg:translate-x-[-4px] dark:bg-card/90 dark:shadow-black/30">
                    <div className="flex flex-col items-center">
                      <FcGoogle size={64} className="mb-4" />
                      <span className="text-center text-xl font-semibold text-card-foreground">
                        {t("buttons.googleLogin")}
                      </span>
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        {t("buttons.quickStart")}
                      </p>
                    </div>
                  </div>

                  <div className="z-10 flex h-96 w-1/2 flex-col items-center justify-center rounded-3xl border border-border/70 bg-card/95 p-6 text-center shadow-xl shadow-black/10 lg:-translate-x-16 dark:bg-card/90 dark:shadow-black/30">
                    <Mail size={48} className="mb-4 text-primary" />
                    <span className="text-5xl font-extrabold leading-none text-card-foreground">
                      {t("buttons.register")}
                    </span>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("buttons.emailPassword")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-96 w-full max-w-md flex-col items-center justify-center">
                  <card.icon size={160} className={card.iconClassName} />
                </div>
              )}
            </div>

            <div
              className={`flex flex-col items-start text-left lg:w-1/2 ${
                card.reverse ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <p
                className={`mb-4 text-sm font-semibold uppercase tracking-[0.28em] ${card.textClassName}`}
              >
                {card.subTitle}
              </p>
              <h2
                className={`mb-6 text-5xl font-extrabold leading-tight md:text-6xl ${card.headingClassName}`}
              >
                {card.title}
              </h2>
              <p className={`mb-8 text-xl leading-relaxed ${card.textClassName}`}>
                {card.longDescription}
              </p>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
