"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";

export const useAuthForm = (type: "signin" | "signup") => {
  const router = useRouter();
  const isSignIn = type === "signin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // En az 6 karakter, 1 büyük harf, 1 sayı
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isSignIn && !passwordRegex.test(password)) {
      setPasswordError(
        "Şifre en az 6 karakter olmalı, en az 1 büyük harf ve 1 sayı içermeli"
      );
      setLoading(false);
      return;
    }
    setPasswordError("");

    try {
      if (isSignIn) {
        // ---- SIGN IN ----
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/",
        });

        if (res?.error) {
          toast.error("E-posta veya şifre hatalı");
          return;
        }

        toast.success("Giriş başarılı!");
        // console.log("SIGN IN RES:", res?.url);
        router.push(res?.url ?? "/");
        router.refresh();
        return;
      }

      // ---- SIGN UP ----
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name,email, password }),
      });
  

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data?.error ?? "Kayıt sırasında bir hata oluştu";
        toast.error(message);
        return;
      }
      toast.success("Kayıt başarılı! Şimdi giriş yapabilirsin.");
      router.push("/sign-in");
      router.refresh();
      
    } catch (err: any) {
      const message = err?.message ?? "Beklenmeyen bir hata oluştu";
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
  };
};
