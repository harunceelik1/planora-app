"use client";
// app/(main)/layout.tsx  (SERVER)
import Navbar from "@/features/components/layout/navbar";
import { usePathname } from "next/navigation";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Navbar />

        {/* children'ı (sayfa içeriğini) her zaman render et */}
        {children}
      </main>
    </div>
  );
}
