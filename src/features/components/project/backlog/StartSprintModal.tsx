"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useLocale, useTranslations } from "next-intl";
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
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sprintName, setSprintName] = useState(sprint?.name || "");
  const [sprintGoal, setSprintGoal] = useState(sprint?.goal || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    sprint?.startDate ? new Date(sprint.startDate) : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    sprint?.endDate
      ? new Date(sprint.endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  const dateLocale = useMemo(
    () => (locale === "tr" ? tr : enUS),
    [locale],
  );

  useEffect(() => {
    if (!sprint) return;

    const now = new Date();
    const fallbackEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setSprintName(sprint.name);
    setSprintGoal(sprint.goal || "");
    setStartDate(sprint.startDate ? new Date(sprint.startDate) : now);
    setEndDate(sprint.endDate ? new Date(sprint.endDate) : fallbackEnd);
  }, [sprint]);

  if (!sprint) return null;

  const onSubmit = async () => {
    setFormError(null);
    const name = sprintName.trim();
    const goal = sprintGoal.trim();

    if (!name) {
      setFormError(t("backlogView.modal.errors.nameRequired"));
      return;
    }
    if (!startDate || !endDate) {
      setFormError(t("backlogView.modal.errors.dateRequired"));
      return;
    }

    if (startDate > endDate) {
      setFormError(t("backlogView.modal.errors.dateOrder"));
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        goal,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
      };

      const result =
        mode === "start"
          ? await startSprint(sprint.id, payload)
          : await updateSprint(sprint.id, payload);

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

        <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sprintName">
              {t("backlogView.modal.fields.name")}
            </Label>
            <Input
              id="sprintName"
              value={sprintName}
              onChange={(event) => setSprintName(event.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 w-full">
              <Label>{t("backlogView.modal.fields.startDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full pl-3 text-left font-normal h-10"
                  >
                    {startDate ? (
                      format(startDate, "PPP", { locale: dateLocale })
                    ) : (
                      <span>{t("backlogView.modal.fields.startDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) =>
                      date > new Date("2100-01-01") || date < new Date()
                    }
                    locale={dateLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5 w-full">
              <Label>{t("backlogView.modal.fields.endDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full pl-3 text-left font-normal h-10"
                  >
                    {endDate ? (
                      format(endDate, "PPP", { locale: dateLocale })
                    ) : (
                      <span>{t("backlogView.modal.fields.endDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) =>
                      date > new Date("2100-01-01") || date < (startDate || new Date())
                    }
                    locale={dateLocale}
                  />
                </PopoverContent>
              </Popover>
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
              value={sprintGoal}
              onChange={(event) => setSprintGoal(event.target.value)}
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
