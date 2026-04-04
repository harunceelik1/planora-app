import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Plugin'i oluşturuyoruz ve request dosyasının yerini gösteriyoruz
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* Mevcut ayarların burada kalıyor */
  reactStrictMode: false,
  images: {
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

// Config'i next-intl ile sarmalayarak dışarı aktarıyoruz
export default withNextIntl(nextConfig);
