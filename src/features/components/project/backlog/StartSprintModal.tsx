"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { startSprint, updateSprint } from "@/actions/sprint-actions";
import { Sprint } from "@/types/project";

interface StartSprintModalProps {
  sprint: Sprint | null;
  mode: "start" | "settings";
  onClose: () => void;
  onSuccess: () => void;
}

export default function StartSprintModal({
  sprint,
  mode,
  onClose,
  onSuccess,
}: StartSprintModalProps) {
  const t = useTranslations("ProjectDetails");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!sprint) return null;

  const today = new Date();
  const defaultStart = sprint.startDate
    ? sprint.startDate.slice(0, 10)
    : today.toISOString().slice(0, 10);
  const defaultEnd = sprint.endDate
    ? sprint.endDate.slice(0, 10)
    : new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("sprintName") || sprint.name).trim();
    const goal = String(formData.get("sprintGoal") || "").trim();
    const startDate = String(formData.get("startDate") || "");
    const endDate = String(formData.get("endDate") || "");

    if (!name) {
      setFormError(t("backlogView.modal.errors.nameRequired"));
      return;
    }
    if (!startDate || !endDate) {
      setFormError(t("backlogView.modal.errors.dateRequired"));
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setFormError(t("backlogView.modal.errors.invalidDate"));
      return;
    }
    if (start > end) {
      setFormError(t("backlogView.modal.errors.dateOrder"));
      return;
    }

    setIsLoading(true);
    try {
      const result =
        mode === "start"
          ? await startSprint(sprint.id, { name, goal, startDate, endDate })
          : await updateSprint(sprint.id, { name, goal, startDate, endDate });

      if (!result.success) {
        setFormError(
          result.error ||
            (mode === "start"
              ? t("backlogView.modal.errors.genericStart")
              : t("backlogView.modal.errors.genericUpdate")),
        );
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      setFormError(
        mode === "start"
          ? t("backlogView.modal.errors.genericStart")
          : t("backlogView.modal.errors.genericUpdate"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!sprint} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-115">
        <DialogHeader>
          <DialogTitle>
            {mode === "start"
              ? t("backlogView.modal.title.start")
              : t("backlogView.modal.title.settings")}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "start"
              ? t("backlogView.modal.description.start")
              : t("backlogView.modal.description.settings")}
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sprintName">
              {t("backlogView.modal.fields.name")}
            </Label>
            <Input
              id="sprintName"
              name="sprintName"
              defaultValue={sprint.name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">
                {t("backlogView.modal.fields.startDate")}
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={defaultStart}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">
                {t("backlogView.modal.fields.endDate")}
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={defaultEnd}
                  required
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
              <Label htmlFor="sprintGoal">
                {t("backlogView.modal.fields.goal")}
              </Label>
              <span className="text-xs text-muted-foreground">
                {t("backlogView.modal.fieldOptional")}
              </span>
            </div>
            <Textarea
              id="sprintGoal"
              name="sprintGoal"
              defaultValue={sprint.goal || ""}
              placeholder={t("backlogView.modal.goalPlaceholder")}
              rows={3}
            />
          </div>

          {formError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <DialogFooter className="mt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("backlogView.modal.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "start"
                  ? t("backlogView.modal.buttons.starting")
                  : t("backlogView.modal.buttons.saving")
                : mode === "start"
                  ? t("backlogView.modal.buttons.submitStart")
                  : t("backlogView.modal.buttons.submitSave")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
