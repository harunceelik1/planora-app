"use client";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar"; // Radix-ui yerine shadcn component
import { ColumnDef } from "@tanstack/react-table";
import { Star, ArrowUp, ArrowDown, ChevronsUpDown, Mail } from "lucide-react";
import { Project, ProjectMember } from "@/types/project";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routest";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link as I18nLink, useRouter } from "@/i18n/routing";
import { FavoriteButton } from "../favorite-button";

export const getColumns = (
  t: (key: string) => string,
): ColumnDef<Project>[] => [
  {
    id: "favorite",
    // Başlık boş kalsın veya ikon koyabilirsin
    header: ({ table }) => <span className="sr-only">Favori</span>,
    cell: ({ row }) => {
      // Satırdaki veriyi alıyoruz
      const project = row.original;

      return (
        <div className="flex items-center justify-center w-8">
          <FavoriteButton
            projectId={project.id}
            isFavorited={project.isFavorite}
          />
        </div>
      );
    },
  },

  {
    accessorKey: "projectName",
    // 👇 Header'ı t fonksiyonu ile çeviriyoruz
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("columns.name")} {/* Çeviri: Ad */}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4 " />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original;
      return (
        <I18nLink
          href={ROUTES.PROJECTS.DETAILS(project.id)}
          className="font-medium text-foreground hover:underline transition-colors"
        >
          <p className="font-bold">{project.projectName}</p>
        </I18nLink>
      );
    },
  },
  {
    accessorKey: "projectKey",
    header: t("columns.key"), // Çeviri: Anahtar
  },

  {
    accessorKey: "owner.name",
    header: t("columns.lead"),
    cell: ({ row }) => {
      const owner = row.original.owner;
      if (!owner) {
        return <span>{t("columns.unassigned")}</span>; // Çeviri: Atanmamış
      }
      const initials = getInitials(owner.name, "");
      const router = useRouter();

      return (
        <div className="flex items-center gap-2">
          <HoverCard>
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

            <HoverCardContent className="w-80 p-0 overflow-hidden">
              <div className="bg-accent text-primary-foreground h-20 relative flex items-center justify-center">
                <Avatar className="h-16 w-16 absolute -bottom-8 left-4">
                  <AvatarImage
                    src={owner.image || ""}
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback className="bg-gray-200 text-primary-foreground text-2xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-10 px-4 pb-4">
                <h4 className="text-xl font-semibold mb-1">{owner.name}</h4>
                {owner.email && (
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{owner.email}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push(ROUTES.PROFILE)}
                  className="w-full"
                >
                  {t("hoverCard.viewProfile")} {/* Çeviri: Profili Görüntüle */}
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
    header: t("columns.tasks"), // Çeviri: Görev Sayısı
  },
  {
    id: "members",
    header: t("columns.members") || "Üyeler", // Çeviri anahtarın yoksa diye fallback
    cell: ({ row }) => {
      // TypeScript hatası alırsan: row.original.members kısmını kontrol et.
      // Genelde members: { user: { name, image } }[] şeklinde gelir.
      const members = row.original.members || [];

      const MAX_DISPLAY = 3; // En fazla kaç kişi görünsün?
      const displayMembers = members.slice(0, MAX_DISPLAY);
      const remainingCount = members.length - MAX_DISPLAY;

      return (
        <div className="flex items-center -space-x-3">
          {" "}
          {/* -space-x-2 üst üste bindirir */}
          {displayMembers.map((member: ProjectMember) => (
            // Not: member.user?.id yoksa member.id kullan. Veri yapına göre ayarla.
            <div key={member.id} className="relative group">
              {/* Tooltip istersen buraya title ekleyebilirsin */}
              <Avatar className="h-8 w-8 border-2 border-background  transition-transform hover:-translate-y-1">
                <AvatarImage src={member.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-xs">
                  {getInitials(member.user?.name || "")}
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
              +{remainingCount}
            </div>
          )}
        </div>
      );
    },
  },
];
