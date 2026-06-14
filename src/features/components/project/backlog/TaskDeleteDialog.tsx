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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            onClick={(event) => {
              event.preventDefault();
              if (!isDeleting) {
                onConfirmDelete();
              }
            }}
          >
            {isDeleting ? t("deleteDialog.deleting") : t("deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
