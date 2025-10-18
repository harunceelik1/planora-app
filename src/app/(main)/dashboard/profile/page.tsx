"use client";
import * as React from "react";
import { useSession } from "next-auth/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { formatName, getInitials } from "@/lib/utils";
import { MapPin, BriefcaseBusiness, Calendar } from "lucide-react";
import EditProfileDialog from "@/features/components/profile/editeProfile";
import ChangePasswordDialog from "@/features/components/profile/changePassword";

/** Reusable: label + left icon + input */
function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative w-full">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const fName = formatName(session?.user?.name);
  const initials = getInitials(session?.user?.name, session?.user?.email);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 sm:p-28">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Sayfa başlığı */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profilim</h1>
          <p className="text-sm text-muted-foreground">
            Kişisel bilgilerini, güvenliğini ve tercihlerini yönet.
          </p>
        </div>
        <Separator />

        {/* TEK CARD */}
        <Card className="  ">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Hesap</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hesabınla ilgili güncel veriler ve işlemler.
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Personal Info & Actions */}
            <section className="space-y-4">
              {/* Buradaki 'sm' breakpoint'leri mobil/tablet geçişi için kritik */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Avatar ve İsim/Email */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-gray-100">
                    {" "}
                    {/* Avatarı biraz büyüttük */}
                    <AvatarImage
                      src={session?.user?.image || ""}
                      className="object-cover rounded-full"
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="text-lg font-medium text-gray-900">
                      {fName ?? "—"}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {session?.user?.email ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center justify-start sm:justify-end">
                  <EditProfileDialog
                    initialImage={session?.user?.image || ""}
                    initialName={session?.user?.name || ""}
                    initials={initials}
                  />

                  <ChangePasswordDialog />
                </div>
              </div>

              <Separator />
            </section>

            <section className="space-y-4">
              <div className="text-sm font-semibold">Düzenlemeler</div>{" "}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="location" label="Konum" icon={MapPin}>
                  <Input
                    id="location"
                    placeholder="Şehir, Ülke"
                    className="h-10 pl-9 text-sm"
                    autoComplete="address-level2"
                  />
                </Field>

                <Field id="job" label="Meslek" icon={BriefcaseBusiness}>
                  <Input
                    id="job"
                    placeholder="Ör. Öğrenci / Yazılım Geliştiricisi"
                    className="h-10 pl-9 text-sm"
                    autoComplete="organization-title"
                  />
                </Field>

                <Field id="birthdate" label="Doğum Tarihi" icon={Calendar}>
                  <Input
                    id="birthdate"
                    type="date"
                    max={today}
                    className="h-10 pl-9 text-sm"
                  />
                </Field>

                <Field id="phone" label="Telefon Numarası" icon={Calendar}>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123 45 67"
                    className="h-10 pl-9 text-sm"
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
