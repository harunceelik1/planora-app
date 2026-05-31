"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const LABEL_TONES = [
  "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
  "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
  "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-300",
];

export function normalizeIssueLabels(labels: string[] | null | undefined) {
  const seen = new Set<string>();

  return (labels || [])
    .map((label) => label.trim())
    .filter(Boolean)
    .filter((label) => {
      const key = label.toLocaleLowerCase("tr-TR");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function getLabelTone(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }

  return LABEL_TONES[hash % LABEL_TONES.length];
}

interface IssueLabelBadgeProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function IssueLabelBadge({
  label,
  removable = false,
  onRemove,
  className,
}: IssueLabelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none",
        getLabelTone(label),
        className,
      )}
    >
      <span className="truncate">{label}</span>
      {removable ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          aria-label={`${label} etiketini kaldır`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </span>
  );
}

export function IssueLabelList({
  labels,
  limit,
  className,
}: {
  labels: string[] | null | undefined;
  limit?: number;
  className?: string;
}) {
  const normalized = normalizeIssueLabels(labels);
  const visible = typeof limit === "number" ? normalized.slice(0, limit) : normalized;
  const hiddenCount = normalized.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((label) => (
        <IssueLabelBadge key={label} label={label} />
      ))}
      {hiddenCount > 0 ? (
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}
