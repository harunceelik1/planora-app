"use client";

import { ROUTES } from "@/constants/routest";
// 👇 1. DOĞRU ROUTER'I IMPORT ET (Dil desteği için)
import { useRouter } from "@/i18n/routing";
// 👇 2. TRANSLATION IMPORTU
import { useTranslations } from "next-intl";

interface AuthFooterProps {
  isSignIn: boolean;
}

const AuthFooter = ({ isSignIn }: AuthFooterProps) => {
  const router = useRouter();

  // 👇 3. HOOK'U BAŞLAT (Auth.Footer grubuna odaklandık)
  const t = useTranslations("Auth.Footer");

  return (
    <div className="flex justify-center text-sm pt-4 border-t rounded-b-lg w-full">
      {isSignIn ? (
        <>
          {/* 👇 Çeviri */}
          {t("dontHaveAccount")}
          <button
            className="pl-2 hover:text-[#303030] cursor-pointer transition duration-300 font-semibold "
            onClick={() => router.push(ROUTES.SIGN_UP)}
          >
            {/* 👇 Çeviri */}
            {t("signUp")}
          </button>
        </>
      ) : (
        <>
          {/* 👇 Çeviri */}
          {t("alreadyHaveAccount")}
          <button
            className="pl-2 hover:text-[#303030] cursor-pointer transition duration-300 font-semibold "
            onClick={() => router.push(ROUTES.SIGN_IN)}
          >
            {/* 👇 Çeviri */}
            {t("signIn")}
          </button>
        </>
      )}
    </div>
  );
};

export default AuthFooter;
