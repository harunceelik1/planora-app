// ─── Layout Constants ─────────────────────────────────────────────────────────
export const DAY_MS   = 24 * 60 * 60 * 1000;
export const ROW_H    = 36;   // px per lane row
export const SPRINT_H = 44;   // px for sprint header row
export const HEADER_H = 56;   // px for dual date header
export const LEFT_W   = 280;  // px left label panel
export const DAY_W    = 28;   // px per day column

// ─── Status / Priority Styling ────────────────────────────────────────────────
export const STATUS_STYLES: Record<string, { bar: string; dot: string; badge: string }> = {
  DONE:        { bar: "bg-emerald-500 border-emerald-600/50", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  IN_PROGRESS: { bar: "bg-sky-500 border-sky-600/50",         dot: "bg-sky-500",     badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"                 },
  CANCELLED:   { bar: "bg-slate-400 border-slate-500/50",     dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"             },
  TODO:        { bar: "bg-amber-400 border-amber-500/50",     dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"          },
};

export const PRIORITY_STRIPE: Record<string, string> = {
  HIGHEST: "bg-red-600",
  HIGH:    "bg-orange-500",
  MEDIUM:  "bg-sky-500",
  LOW:     "bg-slate-400",
  LOWEST:  "bg-slate-300",
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type LanedItem = {
  issue: {
    id: string;
    number: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string |Date| null;
    assignee?: { name: string } | null;
    sprintId?: string | null;
    createdAt: string;
  };
  startDay: number;
  endDay: number;
  durationDays: number;
  lane: number;
};

export type SprintGroup = {
  sprint: {
    id: string;
    name: string;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
  label: string;
  startDay: number;
  endDay: number;
  laneCount: number;
  items: LanedItem[];
};

export type TimelineData = {
  minDate: Date;
  maxDate: Date;
  totalDays: number;
  months: Array<{ label: string; startDay: number; days: number }>;
  mondayTicks: number[];
  groups: SprintGroup[];
};