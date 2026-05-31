"use client";

// 👇 1. Link (Dil destekli)
import { Link } from "@/i18n/routing";
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
} from "lucide-react";
import { useDeleteProject } from "@/hooks/useDeleteProject";
import { Spinner } from "@/components/ui/spinner";
// 👇 2. Translation importu
import { useTranslations } from "next-intl";

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
}

export function ProjectActions({
  projectId,
  projectName,
}: ProjectActionsProps) {
  const t = useTranslations("ProjectActions");

  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteProject, isDeleting } = useDeleteProject();

  const onConfirmDelete = async () => {
    const success = await deleteProject(projectId);
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
                {isFavorite ? t("menu.favoriteRemove") : t("menu.favoriteAdd")}{" "}
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
                <span className="font-medium">{t("menu.settings")}</span>{" "}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          {/* SİLME TETİKLEYİCİSİ — ARTIK ÜZERİNE GELİNDİĞİNDE SİYAH OLMUYOR */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
            className="py-2.5 cursor-pointer transition-colors text-destructive focus:bg-destructive/10 focus:text-destructive w-full flex items-center"
          >
            <Trash2 className="mr-3 h-4 w-4 text-destructive" />
            <span className="font-medium">{t("menu.delete")}</span>{" "}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <div className="px-2 py-2 flex items-start gap-3">
            <div className="mt-0.5 p-1 bg-muted border border-border rounded text-primary">
              <ExternalLink className="h-3 w-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">
                {t("info.type")}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t("info.managedBy")}
              </span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ONAY PENCERESİ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>{" "}
            <AlertDialogDescription>
              {t.rich("deleteDialog.description", {
                projectName: projectName,
                b: (chunks) => <b>{chunks}</b>,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive"
            >
              {isDeleting ? (
                <>
                  <Spinner className="size-8" />
                  {t("deleteDialog.deleting")}
                </>
              ) : (
                t("deleteDialog.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}