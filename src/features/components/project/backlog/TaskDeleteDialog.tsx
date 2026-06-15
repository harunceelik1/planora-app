"use client";

import { useTranslations } from "next-intl";
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
import { Loader2 } from "lucide-react";

interface TaskDeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function TaskDeleteDialog({
  isOpen,
  isDeleting,
  onOpenChange,
  onConfirmDelete,
}: TaskDeleteDialogProps) {
  const t = useTranslations("TaskDetail");

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background text-foreground border-border max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground font-semibold tracking-tight">
            {t("deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm leading-normal">
            {t("deleteDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* gap-2 sm:gap-0 yerine sm:gap-3 yapılarak butonların yapışması engellendi */}
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="border-input bg-background hover:bg-muted text-foreground transition-colors m-0"
          >
            {t("deleteDialog.cancel")}
          </AlertDialogCancel>
          
          <AlertDialogAction
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all font-medium flex items-center justify-center min-w-24"
            onClick={(event) => {
              event.preventDefault();
              if (!isDeleting) {
                onConfirmDelete();
              }
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                {t("deleteDialog.deleting")}
              </>
            ) : (
              t("deleteDialog.confirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}