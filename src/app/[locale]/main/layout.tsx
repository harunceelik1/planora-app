"use client";
// app/(main)/layout.tsx
import Navbar from "@/features/components/layout/navbar";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/features/components/layout/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldHideNavbarAndSideBar = pathname.includes("/main/create-project");

  // Eğer create-project sayfasındaysak sadece ana içeriği göster
  if (shouldHideNavbarAndSideBar) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    // Ana kapsayıcı: Ekranı yan yana (flex) bölüyoruz
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 1. SOL TARAF: Sidebar tüm yüksekliği alarak burada duracak */}
      <Sidebar />

      {/* 2. SAĞ TARAF: Sidebar'ın bitiminden başlayan ana sütun */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Navbar artık sadece sağ tarafın en tepesinde duruyor */}
        <Navbar />

        {/* Ana içerik alanı (Sayfalar buraya gelecek ve sadece burası kaydırılacak) */}
        <main className="flex-1 overflow-y-auto pb-4">{children}</main>
      </div>
    </div>
  );
}
