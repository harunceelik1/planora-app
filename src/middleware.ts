import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // Desteklenen diller
  locales: ["en", "tr"],

  // Varsayılan dil (URL'de dil yoksa buna yönlendirir)
  defaultLocale: "tr",

  // Dil önekini (prefix) her zaman göster (örn: /tr/main...)
  // 'as-needed' yaparsan varsayılan dilde (tr) gizler.
  localePrefix: "always",
});

export const config = {
  // Sadece bu yollarla eşleşen istekleri middleware'e sok
  // api, _next, static dosyalar hariç her şeyi yakala
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
