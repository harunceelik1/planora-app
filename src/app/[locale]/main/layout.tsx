"use client";

import Navbar from "@/features/components/layout/navbar";
import { Sidebar } from "@/features/components/layout/sidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldHideNavbarAndSideBar = pathname.includes("/main/create-project");

  if (shouldHideNavbarAndSideBar) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />

          <main className="flex-1 px-4 pb-6 pt-2 md:px-6 md:pb-8">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
