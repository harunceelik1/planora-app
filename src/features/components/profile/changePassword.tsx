"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Lock } from "lucide-react";
// 👇 1. IMPORT ET
import { useTranslations } from "next-intl";

type Form = { pwd: string; confirm: string };

export default function ChangePasswordDialog() {
  // 👇 2. HOOK'U BAŞLAT (ProfilePage.changePassword grubunu hedefliyoruz)
  const t = useTranslations("ProfilePage.changePassword");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<Form>({
    mode: "onChange",
    defaultValues: { pwd: "", confirm: "" },
  });

  const pwd = watch("pwd");
  const confirm = watch("confirm");
  const [showPwd, setShowPwd] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  function onOpenChange(isOpen: boolean) {
    if (!isOpen) reset({ pwd: "", confirm: "" });
  }

  const onSubmit = (data: Form) => {
    // backend’e bağlanınca burada PATCH/POST
    console.log("would change password", data);
  };

  return (
    <div className="space-y-3">
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="">
            <Lock className="mr-2 h-4 w-4" />{" "}
            {/* İkon ile yazı arasına boşluk için class ekledim */}
            {t("trigger")} {/* Çeviri: Şifreni Güncelle */}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>{" "}
            {/* Çeviri: Şifreni Güncelle */}
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New password */}
            <div className="space-y-2">
              <Label className="text-base">{t("labels.newPassword")}</Label>{" "}
              {/* Çeviri */}
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  {...register("pwd", { required: true, minLength: 8 })}
                  className={`pr-10 ${
                    errors.pwd
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-2 inline-flex items-center"
                >
                  {showPwd ? (
                    <EyeOff className="cursor-pointer h-4 w-4" />
                  ) : (
                    <Eye className="cursor-pointer h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.pwd && (
                <p className="text-sm text-destructive">
                  {t("errors.minLength")}{" "}
                  {/* Çeviri: Şifreniz en az 8 karakter... */}
                </p>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <Label className="text-base">{t("labels.confirmPassword")}</Label>{" "}
              {/* Çeviri */}
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirm", {
                    required: true,
                    // 👇 Dinamik validasyon mesajı
                    validate: (v) => v === pwd || t("errors.mismatch"),
                  })}
                  className={`pr-10 ${
                    errors.confirm
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute inset-y-0 right-2 inline-flex items-center"
                >
                  {showConfirm ? (
                    <EyeOff className="cursor-pointer h-4 w-4" />
                  ) : (
                    <Eye className="cursor-pointer h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-sm text-destructive">
                  {/* Hata mesajı varsa onu göster (validate fonksiyonundan gelen t çevirisi), yoksa varsayılanı */}
                  {errors.confirm.message || t("errors.mismatch")}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {/* Buradaki butonu sadece formu kapatmak için kullanıyorsak onClick eklenmeli veya DialogClose kullanılmalı. 
                  Şimdilik sadece görsel çeviri yapıldı. */}
              <Button type="button" variant="ghost">
                {t("buttons.cancel")} {/* Çeviri: İptal */}
              </Button>
              <Button type="submit" disabled={!isValid || pwd !== confirm}>
                {t("buttons.save")} {/* Çeviri: Kaydet */}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
