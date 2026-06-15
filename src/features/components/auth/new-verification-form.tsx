"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Mail, Loader2, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label"; // 👈 Radix yerine doğrudan Shadcn etiketini kullanmak uyumu artırır
import { ROUTES } from "@/constants/routest";

export const NewVerificationForm = () => {
  const t = useTranslations("Auth.Verification");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const onSubmit = async (value: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/new-verification", {
        method: "POST",
        body: JSON.stringify({ token: value }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("errors.generic"));
        setCode("");
      } else {
        toast.success(t("success"));
        router.push(ROUTES.SIGN_IN);
      }
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    if (value.length === 6) onSubmit(value);
  };

  const onResend = useCallback(async () => {
    if (!email) return toast.error(t("errors.noEmail"));

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success(t("resendSuccess"));
        setTimeLeft(60);
      } else {
        toast.error(t("errors.sendFailed"));
      }
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setIsResending(false);
    }
  }, [email, t]);

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8  text-foreground transition-colors duration-300">
      <Card className="w-full max-w-md shadow-xl border border-border bg-card">
        <CardHeader className="flex flex-col items-center justify-center space-y-2 pb-2">
          {/* İkon kutusu dark modda çok parlamasın diye primary/10 yapıldı */}
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center tracking-tight text-card-foreground">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t.rich("description", {
              email: email || "...",
              bold: (chunks) => (
                <span className="font-semibold text-foreground">{chunks}</span>
              ),
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={handleChange}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-12 w-12 text-lg border-input bg-background text-popover-foreground" />
              <InputOTPSlot index={1} className="h-12 w-12 text-lg border-input bg-background text-popover-foreground" />
              <InputOTPSlot index={2} className="h-12 w-12 text-lg border-input bg-background text-popover-foreground" />
              <InputOTPSlot index={3} className="h-12 w-12 text-lg border-input bg-background text-popover-foreground" />
              <InputOTPSlot index={4} className="h-12 w-12 text-lg border-input bg-background text-popover-foreground" />
              <InputOTPSlot index={5} className="h-12 w-12 text-lg border-input bg-background text-popover-foreground" />
            </InputOTPGroup>
          </InputOTP>

          <Button
            className="w-full mt-4"
            disabled={code.length < 6 || loading}
            onClick={() => onSubmit(code)}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              t("verifyBtn")
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <p>{t("noCode")}</p>
            <button
              onClick={onResend}
              disabled={timeLeft > 0 || isResending}
              className="text-primary font-medium hover:underline disabled:text-muted-foreground/50 disabled:no-underline flex items-center transition-colors"
            >
              {isResending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : timeLeft > 0 ? (
                t("resendTimer", { time: timeLeft })
              ) : (
                <>
                  <Label className="cursor-pointer text-primary hover:underline">{t("resendBtn")}</Label>
                  <RefreshCw className="h-3 w-3 ml-1" />
                </>
              )}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};