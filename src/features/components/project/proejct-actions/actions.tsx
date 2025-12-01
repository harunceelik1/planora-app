"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  Star,
  Settings,
  Trash2,
  UserPlus,
  LayoutTemplate,
  Palette,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
}

export function ProjectActions({
  projectId,
  projectName,
}: ProjectActionsProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <DropdownMenu>
      {/* Tetikleyici Buton */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary data-[state=open]:bg-muted"
        >
          <Ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      {/* 👇 GENİŞLİK AYARI BURADA: w-80 */}
      <DropdownMenuContent
        align="end"
        className="w-80 p-2 shadow-xl rounded-xl"
      >
        <DropdownMenuGroup>
          {/* 1. FAVORİLERE EKLE */}
          <DropdownMenuItem
            onClick={() => setIsFavorite(!isFavorite)}
            className="py-2.5 cursor-pointer focus:bg-muted"
          >
            <Star
              className={`mr-3 h-4 w-4 ${
                isFavorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
            <span className="font-medium">
              {isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href={`/main/projects/${projectId}/settings`}
              className="py-2.5 cursor-pointer focus:bg-muted w-full flex items-center"
            >
              <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Alan ayarları</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        {/* 6. ALANI SİL (Kırmızı) */}
        <DropdownMenuItem className="py-2.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
          <Trash2 className="mr-3 h-4 w-4 text-red-600" />
          <span className="font-medium">Alanı sil</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <div className="px-2 py-2 flex items-start gap-3">
          <div className="mt-0.5 p-1 bg-blue-100 rounded text-blue-600">
            <ExternalLink className="h-3 w-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">
              Yazılım alanı
            </span>
            <span className="text-[10px] text-muted-foreground">
              Takım tarafından yönetilen
            </span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
