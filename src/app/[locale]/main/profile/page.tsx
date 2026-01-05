"use client";

import * as React from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatName, getInitials } from "@/lib/utils";
import { MapPin, BriefcaseBusiness, Calendar, Phone } from "lucide-react";
import EditProfileDialog from "@/features/components/profile/editeProfile";
import ChangePasswordDialog from "@/features/components/profile/changePassword";
import { useTranslations, useFormatter } from "next-intl"; // ✅ useFormatter eklendi
import { FcGoogle } from "react-icons/fc";
import { Spinner } from "@/components/ui/spinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
        <Icon className="h-4 w-4 text-blue-500" />
        <div className="break-all">{children}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const t = useTranslations("ProfilePage");
  const format = useFormatter(); // ✅ Tarih formatlayıcı çağırıldı

  const {
    data: user,
    isLoading,
    mutate,
  } = useSWR(session?.user ? "/api/profile" : null, fetcher);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!user) return null;

  const hasPassword = user.hasPassword;
  const fName = formatName(user.name);
  const initials = getInitials(user.name, user.email);

  return (
    <div className="p-4 sm:p-28">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("header.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("header.description")}
          </p>
        </div>
        <Separator />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t("account.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("account.description")}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-gray-50 border-2 border-white shadow-sm">
                    <AvatarImage
                      src={user.image || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {fName ?? "—"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user.email ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <EditProfileDialog
                    user={user}
                    initials={initials}
                    onSuccess={() => mutate()}
                  />
                  {hasPassword && <ChangePasswordDialog />}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  label={t("jobTitle") || "İş Unvanı"}
                  icon={BriefcaseBusiness}
                >
                  {/* 👇 Çeviri eklendi */}
                  {user.jobTitle || (
                    <span className="text-gray-400 italic">
                      {t("notSpecified")}
                    </span>
                  )}
                </Field>

                <Field label={t("location") || "Konum"} icon={MapPin}>
                  {/* 👇 Çeviri eklendi */}
                  {user.location || (
                    <span className="text-gray-400 italic">
                      {t("notSpecified")}
                    </span>
                  )}
                </Field>

                <Field label={t("phone") || "Telefon"} icon={Phone}>
                  {/* 👇 Çeviri eklendi */}
                  {user.phone || (
                    <span className="text-gray-400 italic">
                      {t("notSpecified")}
                    </span>
                  )}
                </Field>

                <Field label={t("birthdate") || "Doğum Tarihi"} icon={Calendar}>
                  {/* 👇 Tarih formatlama ve çeviri düzeltildi */}
                  {user.birthdate ? (
                    format.dateTime(new Date(user.birthdate), {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  ) : (
                    <span className="text-gray-400 italic">
                      {t("notSpecified")}
                    </span>
                  )}
                </Field>
              </div>

              {!hasPassword && (
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-blue-100">
                    <FcGoogle size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                      {t("googleManaged.title")}
                    </p>
                    <p className="text-xs text-blue-700/80 dark:text-blue-400/80">
                      {t("googleManaged.description")}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
