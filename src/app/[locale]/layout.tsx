import "../globals.css";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { Providers } from "./providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/features/components/theme/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Planora App",
  description:
    "A productivity app to plan your tasks and manage your time effectively.",
};

// 👇 TİP TANIMLAMASI GÜNCELLENDİ (Promise eklendi)
interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params, // 👈 BURADA 'params' OLARAK ALIYORUZ (Parçalamıyoruz)
}: RootLayoutProps) {
  // 👇 1. ADIM: AWAIT İLE LOCALE'İ ALIYORUZ (Next.js 15 Kuralı)
  const { locale } = await params;

  // 2. Mesajları çekiyoruz
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased min-h-screen ")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <Providers>
              {children}
              <ToastContainer position="top-right" autoClose={3000} />
            </Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
