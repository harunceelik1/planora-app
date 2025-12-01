"use client";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Avatar } from "@radix-ui/react-avatar";
import { ColumnDef } from "@tanstack/react-table";
import { Star, ArrowUp, ArrowDown, ChevronsUpDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routest";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AddMemberDialog } from "./add-member-dialog";
import Link from "next/link";
export const columns: ColumnDef<Project>[] = [
  {
    id: "favorites",
    header: "",
    cell: ({ row }) => {
      const project = row.original;
      const isFavorite = project.isFavorite;

      const toggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation(); // Satırın tıklanmasını engelle
        console.log("PROJECT:", project.ownerId);
        console.log("Favori değiştirildi:", project.id);
        // BURADA API'YE MUTATION (POST/PATCH) İSTEĞİ ATMANIZ GEREKİR
        // Örn: await fetch(`/api/project/${project.id}/favorite`, { method: 'POST' });
      };

      return (
        <Star
          className={cn(
            "h-4 w-4  cursor-pointer",
            isFavorite
              ? "fill-yellow-400 text-yellow-500" // Dolu yıldız
              : "text-muted-foreground" // Boş yıldız
          )}
          // --- DÜZELTME BURADA ---
          onClick={toggleFavorite} // 'onclick' değil, 'onClick'
        />
      );
    },
  },

  {
    accessorKey: "projectName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ad
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4 " /> // A-Z sıralıysa Yukarı Ok
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" /> // Z-A sıralıysa Aşağı Ok
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" /> // Sıralı değilken
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original;

      return (
        <Link
          // ROUTES.PROJECTS.DETAILS fonksiyonuna ID'yi gönderiyoruz
          href={ROUTES.PROJECTS.DETAILS(project.id)}
          className="font-medium text-foreground hover:underline  transition-colors"
        >
          <p className=" text-blue-600">{project.projectName}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "projectKey",
    header: "Anahtar",
  },

  {
    accessorKey: "owner.name", // Sıralama için bu kalabilir
    header: "Lider",
    cell: ({ row }) => {
      const owner = row.original.owner;
      if (!owner) {
        return <span>Atanmamış</span>;
      }
      const initials = getInitials(owner.name, ""); // Veya getInitials(owner.name)

      return (
        <div className="flex items-center gap-2">
          <HoverCard>
            {/* TETİKLEYİCİ (Küçük Avatar) */}
            <HoverCardTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage
                  src={owner.image || ""}
                  className="object-cover rounded-full"
                />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>

            {/* HOVERCARD İÇERİĞİ - GÖRSELDEKİ TASARIMA BENZETİLDİ */}
            <HoverCardContent className="w-80 p-0 overflow-hidden">
              {" "}
              {/* padding'i sıfırlayıp overflow'u gizledik */}
              {/* Üstteki Mavi Bant benzeri kısım */}
              <div className="bg-accent text-primary-foreground h-20 relative flex items-center justify-center">
                <Avatar className="h-16 w-16  absolute -bottom-8 left-4">
                  {" "}
                  {/* Bantın dışına taşacak şekilde */}
                  <AvatarImage
                    src={owner.image || ""}
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback className="bg-gray-200 text-primary-foreground text-2xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* İçerik Kısmı */}
              <div className="pt-10 px-4 pb-4">
                {" "}
                {/* Avatar'ın altından başlaması için pt-10 */}
                <h4 className="text-xl font-semibold mb-1">
                  {owner.name}
                </h4>{" "}
                {/* İsim */}
                {owner.email && (
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{owner.email}</span>
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  Profili Görüntüle
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
          <span>{owner.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "_count.issues",
    header: "Görev Sayısı",
  },
];
