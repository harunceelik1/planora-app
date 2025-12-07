"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  Star,
  Settings,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useDeleteProject } from "@/hooks/useDeleteProject";
import { Spinner } from "@/components/ui/spinner";

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
}

export function ProjectActions({
  projectId,
  projectName,
}: ProjectActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteProject, isDeleting } = useDeleteProject();

  // Dialog içindeki buton için sarmalayıcı fonksiyon
  const onConfirmDelete = async () => {
    const success = await deleteProject(projectId);
    // Sadece başarılı olursa pencreyi kapat (Hata alırsa açık kalsın ki kullanıcı tekrar deneyebilsin)
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary data-[state=open]:bg-muted"
          >
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 p-2 shadow-xl rounded-xl"
        >
          <DropdownMenuGroup>
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

          {/* SİLME TETİKLEYİCİSİ */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
            className="py-2.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 w-full flex items-center"
          >
            <Trash2 className="mr-3 h-4 w-4 text-red-600" />
            <span className="font-medium">Alanı Sil</span>
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

      {/* ONAY PENCERESİ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. <b>{projectName}</b> projesi ve içindeki
              tüm veriler kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Spinner className="size-8" />
                  Siliniyor...
                </>
              ) : (
                "Evet, Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
