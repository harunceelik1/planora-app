import { Issue, Project, Sprint } from "@/types/project";
import { DAY_MS, SprintGroup, TimelineData } from "../../../../types/timeline.types";

// ─── Date Helpers ─────────────────────────────────────────────────────────────
export const toDay    = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays  = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS);
export const diffDays = (a: Date, b: Date) =>
  Math.round((toDay(b).getTime() - toDay(a).getTime()) / DAY_MS);
export const clamp = (n: number, min = 1) => Math.max(min, n);

// ─── Lane Assignment ──────────────────────────────────────────────────────────
export function assignLanes<T extends { startDay: number; endDay: number }>(
  items: T[],
): (T & { lane: number })[] {
  const laneEnds: number[] = [];
  return items.map((item) => {
    let lane = laneEnds.findIndex((end) => end < item.startDay);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = item.endDay;
    return { ...item, lane };
  });
}

// ─── Main Data Builder ────────────────────────────────────────────────────────
export function buildTimelineData(
  project: Project,
  formatMonthLabel: (date: Date) => string,
): TimelineData | null {
  const issues  = project.issues  ?? [];
  const sprints = project.sprints ?? [];
  const sprintMap = new Map<string, Sprint>(sprints.map((s) => [s.id, s]));

  // Sabitler
  const MIN_DAYS       = 90;  // Canvas her zaman en az 90 gün gösterir
  const PAD_LEFT       = 14;  // En erken tarihten önce 14 gün boşluk
  const PAD_RIGHT      = 30;  // En geç tarihten sonra 30 gün boşluk
  const DEFAULT_DURATION = 7; // dueDate yoksa varsayılan bar uzunluğu (gün)

  const today = toDay(new Date());
  const allDates: Date[] = [today]; // Bugünü her zaman dahil et

  for (const s of sprints) {
    if (s.startDate) allDates.push(new Date(s.startDate));
    if (s.endDate)   allDates.push(new Date(s.endDate));
  }

  type Raw = { issue: Issue; sprintId: string | null; start: Date; end: Date };
  const rawItems: Raw[] = [];

  for (const issue of issues) {
    const sprint      = issue.sprintId ? sprintMap.get(issue.sprintId) : undefined;
    const dueDate     = issue.dueDate     ? new Date(issue.dueDate)     : null;
    const sprintStart = sprint?.startDate ? new Date(sprint.startDate) : null;
    const sprintEnd   = sprint?.endDate   ? new Date(sprint.endDate)   : null;
    const createdAt   = new Date(issue.createdAt);

    const start = toDay(sprintStart || createdAt);

    // dueDate yoksa: sprintEnd varsa onu kullan, yoksa start + DEFAULT_DURATION
    const rawEnd = dueDate || sprintEnd || addDays(start, DEFAULT_DURATION);
    const end    = toDay(rawEnd < start ? addDays(start, DEFAULT_DURATION) : rawEnd);

    allDates.push(start, end);
    rawItems.push({ issue, sprintId: issue.sprintId ?? null, start, end });
  }

  if (allDates.length === 0) return null;

  const sorted = [...allDates].sort((a, b) => a.getTime() - b.getTime());

  // Ham min/max
  const rawMin = toDay(sorted[0]);
  const rawMax = toDay(sorted[sorted.length - 1]);

  // Padding uygula
  let minDate = addDays(rawMin, -PAD_LEFT);
  let maxDate = addDays(rawMax,  PAD_RIGHT);

  // Minimum 90 gün garantisi
  if (diffDays(minDate, maxDate) < MIN_DAYS) {
    maxDate = addDays(minDate, MIN_DAYS);
  }

  const totalDays = clamp(diffDays(minDate, maxDate) + 1);

  // Month bands
  const months: TimelineData["months"] = [];
  let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cur <= maxDate) {
    const startDay  = Math.max(0, diffDays(minDate, cur));
    const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    const endBound  = nextMonth > maxDate ? addDays(maxDate, 1) : nextMonth;
    const days      = clamp(diffDays(new Date(Math.max(cur.getTime(), minDate.getTime())), endBound));
    months.push({ label: formatMonthLabel(cur), startDay, days });
    cur = nextMonth;
  }

  // Monday ticks
  const mondayTicks: number[] = [];
  for (let i = 0; i < totalDays; i++) {
    if (addDays(minDate, i).getDay() === 1) mondayTicks.push(i);
  }

  // Group by sprint
  const grouped = new Map<string | null, Raw[]>();
  grouped.set(null, []);
  for (const s of sprints) grouped.set(s.id, []);
  for (const item of rawItems) {
    const key = item.sprintId && sprintMap.has(item.sprintId) ? item.sprintId : null;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const groups: SprintGroup[] = [];

  for (const [key, items] of grouped.entries()) {
    if (items.length === 0) continue;
    const sprint = key ? (sprintMap.get(key) ?? null) : null;
    const label  = sprint?.name ?? "No Sprint";

    const groupStart = sprint?.startDate
      ? toDay(new Date(sprint.startDate))
      : items.reduce((mn, i) => (i.start < mn ? i.start : mn), items[0].start);
    const groupEnd = sprint?.endDate
      ? toDay(new Date(sprint.endDate))
      : items.reduce((mx, i) => (i.end > mx ? i.end : mx), items[0].end);

    const startDay = diffDays(minDate, groupStart);
    const endDay   = diffDays(minDate, groupEnd);

    const sortedItems = [...items].sort((a, b) => a.start.getTime() - b.start.getTime());
    const laned = assignLanes(
      sortedItems.map((item) => ({
        issue: {
          ...item.issue,
          assignee: item.issue.assignee
            ? { name: item.issue.assignee.name ?? "Unassigned" }
            : null,
          dueDate: item.issue.dueDate ? item.issue.dueDate : null,
        },
        startDay:     diffDays(minDate, item.start),
        endDay:       diffDays(minDate, item.end),
        durationDays: clamp(diffDays(item.start, item.end) + 1),
        lane: 0,
      })),
    );

    const laneCount = laned.length > 0 ? Math.max(...laned.map((i) => i.lane)) + 1 : 1;
    groups.push({ sprint, label, startDay, endDay, laneCount, items: laned });
  }

  return { minDate, maxDate, totalDays, months, mondayTicks, groups };
}