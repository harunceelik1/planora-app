"use client";

import { useTranslations } from "next-intl";

import { ROUTES } from "@/constants/routest";
import { useRouter } from "@/i18n/routing";

interface AuthFooterProps {
  isSignIn: boolean;
}

const AuthFooter = ({ isSignIn }: AuthFooterProps) => {
  const router = useRouter();
  const t = useTranslations("Auth.Footer");

  return (
    <div className="flex w-full justify-center rounded-b-lg pt-4 text-sm text-muted-foreground">
      {isSignIn ? (
        <>
          {t("dontHaveAccount")}
          <button
            className="cursor-pointer pl-2 font-semibold text-foreground transition-colors duration-300 hover:text-primary"
            onClick={() => router.push(ROUTES.SIGN_UP)}
          >
            {t("signUp")}
          </button>
        </>
      ) : (
        <>
          {t("alreadyHaveAccount")}
          <button
            className="cursor-pointer pl-2 font-semibold text-foreground transition-colors duration-300 hover:text-primary"
            onClick={() => router.push(ROUTES.SIGN_IN)}
          >
            {t("signIn")}
          </button>
        </>
      )}
    </div>
  );
};

export default AuthFooter;
