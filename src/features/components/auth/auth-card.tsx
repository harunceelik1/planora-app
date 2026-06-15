"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";

import { useAuthForm } from "@/hooks/useAuthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AuthFooter from "./authFooter";

interface AuthCardProps {
  type: "signin" | "signup";
}

const AuthCard = ({ type }: AuthCardProps) => {
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
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center py-8 md:py-12 px-4 sm:px-6">
      <Card className="relative flex w-full max-w-lg mx-auto flex-col overflow-hidden rounded-3xl border-border/60 bg-card/90 shadow-2xl shadow-black/5 backdrop-blur dark:border-border dark:bg-card/95 dark:shadow-black/30">

        <CardHeader className="space-y-1 pt-8 pb-4 px-6 sm:px-7 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {isSignIn ? t("SignIn.title") : t("SignUp.title")}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {isSignIn ? t("SignIn.description") : t("SignUp.description")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6 px-6 sm:px-7">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google")}
            className="h-11 w-full border-border/70 bg-background/70 text-foreground transition-colors duration-300 hover:bg-accent/70"
          >
            <FcGoogle size={24} className="mr-3" />
            {isSignIn ? t("buttons.googleSignIn") : t("buttons.googleSignUp")}
          </Button>

          <div className="relative flex justify-center text-xs uppercase">
            <Separator />
            <span className="absolute -top-2 bg-card px-2 text-xs font-medium tracking-[0.2em] text-muted-foreground">
              {t("buttons.or")}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              {!isSignIn && (
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("labels.name")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("placeholders.name")}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 border-border/70 bg-background/60 transition-all duration-300 focus-visible:bg-background"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">{t("labels.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("placeholders.email")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-border/70 bg-background/60 transition-all duration-300 focus-visible:bg-background"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">{t("labels.password")}</Label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("placeholders.password")}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-border/70 bg-background/60 pr-11 transition-all duration-300 focus-visible:bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
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
                <p className="mt-1 text-xs text-destructive">{passwordError}</p>
              )}

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="default"
                  className="h-11 w-full text-base font-semibold transition-colors duration-300"
                >
                  {isSignIn ? t("buttons.signIn") : t("buttons.signUp")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="mt-2 justify-center border-t border-border/60 pt-4 pb-8">
          <AuthFooter isSignIn={isSignIn} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthCard;
