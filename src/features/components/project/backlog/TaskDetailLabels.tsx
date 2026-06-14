"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { IssueLabelBadge } from "../issue/issue-labels";

interface TaskDetailLabelsProps {
  labels: string[];
  labelInput: string;
  onLabelInputChange: (value: string) => void;
  onAddLabel: () => void;
  onRemoveLabel: (label: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TaskDetailLabels({
  labels,
  labelInput,
  onLabelInputChange,
  onAddLabel,
  onRemoveLabel,
  onKeyDown,
}: TaskDetailLabelsProps) {
  const t = useTranslations("TaskDetail");

  return (
    <div className="space-y-1.5 pt-2">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {t("labels.labels")}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {labels.map((label) => (
          <IssueLabelBadge
            key={label}
            label={label}
            onRemove={() => onRemoveLabel(label)}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={labelInput}
          onChange={(e) => onLabelInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("placeholders.addLabel")}
          className="h-8 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onAddLabel}
          className="h-8"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
