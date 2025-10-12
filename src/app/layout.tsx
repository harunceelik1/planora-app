// @ts-ignore
import "./globals.css";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { Providers } from "./providers";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Planora App",
  description:
    "A productivity app to plan your tasks and manage your time effectively.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased min-h-screen ")}>
        {/* <div className="circlePosition w-[50%] h-[50%] bg-[#6177f8da] rounded-[100%] absolute z-[-1] top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 blur-[180px]" /> */}

        <Providers>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </Providers>
      </body>
    </html>
  );
}
