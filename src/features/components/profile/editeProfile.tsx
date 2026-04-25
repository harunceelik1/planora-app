"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { updateProfile } from "@/hooks/useUpdateProfile";
import type { UpdateProfileInput } from "@/types/shared";
import { FormDatePicker } from "../form/date-picker";
import { TimezoneSelect } from "../form/timezone-select";
import { User } from "@/types/user";

type ProfileFormValues = Omit<User, "birthdate"> & {
  birthdate: Date | null;
};

type Props = {
  user: User;
  initials: string;
  onSuccess?: () => void;
};

export default function EditProfileDialog({
  user,
  initials,
  onSuccess,
}: Props) {
  const t = useTranslations("ProfilePage");
  const { update } = useSession();
  const { startUpload } = useUploadThing("projectImage");

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<string>(user?.image || "");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const { register, handleSubmit, control, reset } = useForm<ProfileFormValues>(
    {
      defaultValues: {
        name: user?.name || "",
        jobTitle: user?.jobTitle || "",
        timezone: user?.timezone || "",
        location: user?.location || "",
        phone: user?.phone || "",
        birthdate: user?.birthdate ? new Date(user.birthdate) : null,
      },
    }
  );

  // Dialog açılınca verileri doldur
  React.useEffect(() => {
    if (open && user) {
      reset({
        name: user.name || "",
        jobTitle: user.jobTitle || "",
        timezone: user.timezone || "",
        location: user.location || "",
        phone: user.phone || "",
        birthdate: user.birthdate ? new Date(user.birthdate) : null,
      });
      setPreview(user.image || "");
      setSelectedFile(null);
    }
  }, [open, user, reset]);

  /* Avatar işlemleri */
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setPreview(""); // Görüntüyü kaldır
    setSelectedFile(null); // Seçili dosyayı iptal et
  }

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);

    try {
      let finalImage = user.image; // Varsayılan: Eskisini koru

      if (selectedFile) {
        // Durum 1: Yeni resim yükleniyor
        const res = await startUpload([selectedFile]);
        if (res?.[0]?.url) {
          finalImage = res[0].url;
        }
      } else if (!preview || preview === "") {
        // Durum 2: Dosya seçili değil VE Preview boş -> Kullanıcı "Kaldır"a basmış
        finalImage = null;
      }
      // Durum 3: Hiçbir şeye dokunmadıysa (preview == user.image) -> finalImage zaten user.image idi.

      const payload = {
        id: user.id,
        // Input boşsa eskiyi al, doluysa yeniyi al mantığı metinler için OK
        name: data.name || user.name,
        jobTitle: data.jobTitle || user.jobTitle,
        timezone: data.timezone || user.timezone,
        location: data.location || user.location,
        phone: data.phone || user.phone,

        // Resim için yukarıda hesapladığımız finalImage değişkenini kullanıyoruz
        image: finalImage,

        birthdate: data.birthdate
          ? data.birthdate.toISOString()
          : user.birthdate,
      };

      const result = await updateProfile(payload as UpdateProfileInput);

      if (!result.success) {
        toast.error(result.error || "Hata oluştu");
        return;
      }

      await update({
        ...user,
        ...payload,
      });

      toast.success("Profil güncellendi");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err || "Bir şeyler yanlış gitti");
      console.error(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("editProfile.trigger")}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editProfile.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Avatar Kısmı */}
          <div className="flex items-center gap-4 border-b pb-4">
            <Avatar className="h-20 w-20 border">
              {/* Preview boşsa fallback görünsün diye undefined veriyoruz */}
              <AvatarImage
                src={preview || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                  <span className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
                    {t("editProfile.buttons.upload")}
                  </span>
                </label>

                {/* Kaldır Butonu */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={handleRemoveImage}
                >
                  {t("editProfile.buttons.remove")}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("editProfile.helpText")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                400×400 • Max: 4MB
              </p>
            </div>
          </div>

          {/* Form Alanları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <Label>{t("editProfile.labels.name")}</Label>
              <Input
                {...register("name")}
                placeholder={t("editProfile.placeholders.name")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("jobTitle")}</Label>
              <Input
                {...register("jobTitle")}
                placeholder={t("details.job.placeholder")}
              />
            </div>

            <TimezoneSelect
              control={control}
              name="timezone"
              label={t("details.timezone.label")}
            />

            <div className="space-y-1.5">
              <Label>{t("location")}</Label>
              <Input
                {...register("location")}
                placeholder={t("details.location.placeholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("phone")}</Label>
              <Input
                {...register("phone")}
                type="tel"
                placeholder={t("details.phone.placeholder")}
              />
            </div>

            <FormDatePicker
              control={control}
              name="birthdate"
              label={t("birthdate")}
              placeholder={t("details.birthdate.label")}
            />
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t mt-4 z-10">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={loading}>
                {t("editProfile.buttons.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("editProfile.buttons.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
