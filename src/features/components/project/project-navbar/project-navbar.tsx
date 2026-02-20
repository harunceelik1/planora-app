"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  CalendarDays,
  Settings,
} from "lucide-react";

interface ProjectNavbarProps {
  projectId: string;
}

export function ProjectNavbar({ projectId }: ProjectNavbarProps) {
  const pathname = usePathname();

  // Menü elemanlarını burada tanımlıyoruz
  const navItems = [
    {
      label: "Özet",
      href: `/main/projects/${projectId}`, // Ana sayfa (Genelde özet olur)
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Pano",
      href: `/main/projects/${projectId}/board`,
      icon: <KanbanSquare className="h-4 w-4" />,
    },
    {
      label: "Liste",
      href: `/main/projects/${projectId}/list`,
      icon: <ListTodo className="h-4 w-4" />,
    },
    {
      label: "Takvim",
      href: `/main/projects/${projectId}/calendar`,
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Ayarlar",
      href: `/main/projects/${projectId}/settings`,
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b bg-background px-2 pb-2 pt-1">
      {navItems.map((item) => {
        // O anki sayfadaysak aktif olduğunu anlamak için kontrol
        // Basit kontrol: pathname tam eşleşiyor mu?
        // Daha gelişmiş kontrol: pathname, href ile başlıyor mu?
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              isActive && "bg-muted text-primary font-semibold",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
