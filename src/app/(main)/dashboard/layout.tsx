// SERVER component
import { Sidebar } from "@/features/components/layout/sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-white p-6 ">{children}</main>
      </div>
    </div>
  );
}
