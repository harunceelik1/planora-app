"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl"; // 👈 1. Import
import { ROUTES } from "@/constants/routest";

export const useAuthForm = (type: "signin" | "signup") => {
  const router = useRouter();
  const t = useTranslations("Auth.Form"); // 👈 2. Hook'u başlattık

  const isSignIn = type === "signin";
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isSignIn && !passwordRegex.test(password)) {
      // 👇 Çeviri: Şifre kuralı hatası
      setPasswordError(t("validation.password"));
      setLoading(false);
      return;
    }
    setPasswordError("");

    try {
      // ------------------------------------------------
      // 🔑 GİRİŞ YAPMA (SIGN IN)
      // ------------------------------------------------
      if (isSignIn) {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/",
        });

        if (res?.error) {
          // Eğer backend özel bir hata mesajı dönmüyorsa standart mesaj göster
          const errorMsg =
            res.error === "CredentialsSignin"
              ? t("errors.signInFailed")
              : res.error;

          toast.error(errorMsg);
          setError(errorMsg);
          return;
        }

        toast.success(t("success.signIn")); // 👇 Çeviri: Giriş Başarılı
        router.push("/");
        router.refresh();
        return;
      }

      // ------------------------------------------------
      // 📝 KAYIT OLMA (SIGN UP)
      // ------------------------------------------------
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 👇 Çeviri: API hatası veya varsayılan hata
        const message = data?.error ?? t("errors.signUpDefault");
        toast.error(message);
        setError(message);
        return;
      }
      toast.success(t("success.signUp"));
      router.push(ROUTES.NEW_VERIFICATION(email));

      router.refresh();
    } catch (err: any) {
      // 👇 Çeviri: Beklenmeyen hata
      const message = err?.message ?? t("errors.unexpected");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    passwordError,
    handleSubmit,
    isSignIn,
    error,
  };
};
