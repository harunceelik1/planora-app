"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation"; // Not: i18n/navigation.ts kullanmak daha iyidir

import { useAuthForm } from "@/hooks/useAuthForm";
import AuthFooter from "./authFooter";
import { useTranslations } from "next-intl";

interface AuthCardProps {
  type: "signin" | "signup";
}

const AuthCard = ({ type }: AuthCardProps) => {
  const router = useRouter();
  const t = useTranslations("Auth");

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordError,
    handleSubmit,
    isSignIn,
    error,
  } = useAuthForm(type);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full items-center flex flex-col min-h-screen bg-gray-100 py-10">
      <Card className="w-full md:w-[487px] bg-white shadow-xl rounded-xl flex flex-col">
        <CardHeader className="flex flex-col items-center justify-center text-center pt-8 pb-4 space-y-1">
          <CardTitle className="text-2xl font-bold">
            {/* 👇 Çeviri */}
            {isSignIn ? t("SignIn.title") : t("SignUp.title")}
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {/* 👇 Çeviri */}
            {isSignIn ? t("SignIn.description") : t("SignUp.description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-7 flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google")}
            className="w-full h-10 transition-colors duration-300 border-gray-300"
          >
            <FcGoogle size={24} className="mr-3" />
            {/* 👇 Çeviri */}
            {isSignIn ? t("buttons.googleSignIn") : t("buttons.googleSignUp")}
          </Button>

          {/* 2. VEYA AYIRICISI */}
          <div className="relative flex justify-center text-xs uppercase">
            <Separator />
            <span className="absolute px-2 text-xs font-medium text-gray-500 bg-white -top-2">
              {t("buttons.or")} {/* 👇 YA DA */}
            </span>
          </div>

          {/* 3. MANUEL FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              {!isSignIn && (
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t("labels.name")} {/* 👇 İsim */}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("placeholders.name")} // 👇 Placeholder
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 border-gray-300 transition-all duration-300"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("labels.email")} {/* 👇 E-posta */}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("placeholders.email")} // 👇 Placeholder
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 border-gray-300 transition-all duration-300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t("labels.password")} {/* 👇 Şifre */}
                </Label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("placeholders.password")} // 👇 Placeholder
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 border-gray-300 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={
                      // 👇 Erişimilirlik çevirisi
                      showPassword
                        ? t("aria.hidePassword")
                        : t("aria.showPassword")
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
              {/* {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                  <span>{error}</span>
                </div>
              )} */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-10 font-semibold text-base transition-colors duration-300 text-white"
                >
                  {/* 👇 Buton metni */}
                  {isSignIn ? t("buttons.signIn") : t("buttons.signUp")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="pt-4 pb-8 justify-center border-t border-gray-100 mt-2">
          <AuthFooter isSignIn={isSignIn} />
        </CardFooter>
      </Card>
    </div>
  );
};
export default AuthCard;
