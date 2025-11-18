"use client";
// app/(main)/layout.tsx  (SERVER)
import Navbar from "@/features/components/layout/navbar";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/features/components/layout/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldHideNavbarAndSideBar = pathname.startsWith(
    "/main/create-project"
  );
  return (
    <div className="h-screen">
      {!shouldHideNavbarAndSideBar && <Navbar />}
      <div className="flex h-full">
        {!shouldHideNavbarAndSideBar && <Sidebar />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
