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

type Form = { pwd: string; confirm: string };

export default function ChangePasswordDialog() {
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
      <Label>Şifre</Label>

      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="">
            <Lock />
            Şifreni Güncelle
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Şifreni Güncelle</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New password */}
            <div className="space-y-2">
              <Label className="text-base">Yeni Şifre</Label>
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
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.pwd && (
                <p className="text-sm text-destructive">
                  Your password must contain 8 or more characters.
                </p>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <Label className="text-base">Şifreyi Onaylayın</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirm", {
                    required: true,
                    validate: (v) => v === pwd || "Passwords do not match.",
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
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-sm text-destructive">
                  {errors.confirm.message || "Passwords do not match."}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || pwd !== confirm}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
