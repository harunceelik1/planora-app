"use client";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatName, getInitials } from "@/lib/utils";
import { Smartphone, MapPin, BriefcaseBusiness, Calendar } from "lucide-react";
import EditProfileDialog from "@/features/components/profile/editeProfile";
import ChangePasswordDialog from "@/features/components/profile/changePassword";

export default function ProfilePage() {
  const { data: session } = useSession();
  const fName = formatName(session?.user?.name);
  const initials = getInitials(session?.user?.name, session?.user?.email);
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal info, security and preferences.
        </p>
      </div>
      {/* Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Personal</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2">
          <div className="flex items-center justify-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={session?.user?.image || ""}
                className="object-cover rounded-full"
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Label className="text-base font-medium">{fName ?? "—"}</Label>
          </div>

          <div className="flex items-center justify-center">
            <EditProfileDialog
              initialImage={session?.user.image || ""}
              initialName={session?.user.name || ""}
              initials={initials}
            />
          </div>
        </CardContent>
      </Card>
      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-x-4">
              <Label htmlFor="email">Email addresses</Label>
              <p className="text-sm opacity-50 pt-2">{session?.user.email}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <ChangePasswordDialog />
          </div>
        </CardContent>
      </Card>
      {/* Düzenlemeler */}

      <Card>
        <CardHeader>
          <CardTitle>Düzenlemeler</CardTitle>
        </CardHeader>

        <CardContent>
          {/* 2 sütun, mobilde 1 sütun */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Telefon */}
            {/* <div className="space-y-2">
              <Label className="text-sm">Telefon Numarası</Label>
              <div className="relative w-full max-w-sm">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground block" />
                </span>
                <Input
                  className="pl-9 w-full"
                  type="tel"
                  placeholder="5XXXXXXXXX"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]*"
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value.replace(/\D/g, "").slice(0, 10);
                  }}
                />
              </div>
            </div> */}

            {/* Konum */}
            <div className="space-y-2">
              <Label className="text-sm">Konum</Label>
              <div className="relative w-full max-w-sm">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="h-4 w-4 text-muted-foreground block" />
                </span>
                <Input className="pl-9 w-full" placeholder="Şehir, Ülke" />
              </div>
            </div>

            {/* Mesleğiniz */}
            <div className="space-y-2">
              <Label className="text-sm">Mesleğiniz</Label>
              <div className="relative w-full max-w-sm">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BriefcaseBusiness className="h-4 w-4 text-muted-foreground block" />
                </span>
                <Input
                  className="pl-9 w-full"
                  placeholder="Örn. Öğrenci / Yazılım Geliştirici"
                />
              </div>
            </div>

            {/* Doğum Tarihi */}
            <div className="space-y-2">
              <Label className="text-sm">Doğum Tarihi</Label>
              <div className="relative w-full max-w-sm">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-4 w-4 text-muted-foreground block" />
                </span>
                <Input className="pl-9 w-full" type="date" max={today} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
