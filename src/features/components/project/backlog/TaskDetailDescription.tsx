"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TaskDetailDescriptionProps {
  description: string;
  isEditing: boolean;
  originalDescription: string;
  onDescriptionChange: (value: string) => void;
  onEditingChange: (value: boolean) => void;
  onSave: () => void;
}

export function TaskDetailDescription({
  description,
  isEditing,
  originalDescription,
  onDescriptionChange,
  onEditingChange,
  onSave,
}: TaskDetailDescriptionProps) {
  const t = useTranslations("TaskDetail");

  const handleCancel = () => {
    onDescriptionChange(originalDescription);
    onEditingChange(false);
  };

  return (
    <div className="space-y-1.5 pt-2">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {t("labels.description")}
      </label>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-30 text-sm"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              {t("buttons.cancel")}
            </Button>
            <Button size="sm" onClick={onSave}>
              {t("buttons.save")}
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => onEditingChange(true)}
          className="min-h-30 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-200 cursor-text hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          {description ? (
            <p className="whitespace-pre-wrap">{description}</p>
          ) : (
            <span className="text-slate-400">
              {t("placeholders.addDescription")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
