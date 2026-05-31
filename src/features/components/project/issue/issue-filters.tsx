"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Issue, ProjectMember } from "@/types/project";
import { normalizeIssueLabels } from "./issue-labels";

export type IssueFilterState = {
  query: string;
  assigneeId: string;
  priority: string;
  label: string;
};

export const DEFAULT_ISSUE_FILTERS: IssueFilterState = {
  query: "",
  assigneeId: "all",
  priority: "all",
  label: "all",
};

export function filterIssues(issues: Issue[], filters: IssueFilterState) {
  const query = filters.query.trim().toLocaleLowerCase("tr-TR");

  return issues.filter((issue) => {
    const searchable = [
      issue.title,
      issue.description || "",
      issue.assignee?.name || "",
      ...(issue.labels || []),
    ]
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    const matchesQuery = !query || searchable.includes(query);
    const matchesAssignee =
      filters.assigneeId === "all" || issue.assigneeId === filters.assigneeId;
    const matchesPriority =
      filters.priority === "all" || issue.priority === filters.priority;
    const matchesLabel =
      filters.label === "all" ||
      normalizeIssueLabels(issue.labels).some(
        (label) => label.toLocaleLowerCase("tr-TR") === filters.label,
      );

    return matchesQuery && matchesAssignee && matchesPriority && matchesLabel;
  });
}

interface IssueFiltersProps {
  filters: IssueFilterState;
  onChange: (next: IssueFilterState) => void;
  issues: Issue[];
  members: ProjectMember[];
  resultCount: number;
}

export function IssueFilters({
  filters,
  onChange,
  issues,
  members,
  resultCount,
}: IssueFiltersProps) {
  const allLabels = Array.from(
    new Set(
      issues.flatMap((issue) =>
        normalizeIssueLabels(issue.labels).map((label) =>
          label.toLocaleLowerCase("tr-TR"),
        ),
      ),
    ),
  )
    .map((lowerLabel) =>
      issues
        .flatMap((issue) => normalizeIssueLabels(issue.labels))
        .find((label) => label.toLocaleLowerCase("tr-TR") === lowerLabel) || lowerLabel,
    )
    .sort((a, b) => a.localeCompare(b, "tr"));

  const hasActiveFilters =
    filters.query !== DEFAULT_ISSUE_FILTERS.query ||
    filters.assigneeId !== DEFAULT_ISSUE_FILTERS.assigneeId ||
    filters.priority !== DEFAULT_ISSUE_FILTERS.priority ||
    filters.label !== DEFAULT_ISSUE_FILTERS.label;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm  ">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.query}
            onChange={(event) =>
              onChange({ ...filters, query: event.target.value })
            }
            placeholder="Görevlerde ara..."
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-auto">
          <Select
            value={filters.assigneeId}
            onValueChange={(assigneeId) => onChange({ ...filters, assigneeId })}
          >
            <SelectTrigger className="min-w-[170px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm kişiler</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.user.id} value={member.user.id}>
                  {member.user.name || member.user.email || "Bilinmeyen kullanıcı"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(priority) => onChange({ ...filters, priority })}
          >
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm öncelikler</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="HIGHEST">Highest</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.label}
            onValueChange={(label) => onChange({ ...filters, label })}
          >
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm etiketler</SelectItem>
              {allLabels.map((label) => (
                <SelectItem
                  key={label}
                  value={label.toLocaleLowerCase("tr-TR")}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>{resultCount} görev gösteriliyor</span>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(DEFAULT_ISSUE_FILTERS)}
            className="h-8 gap-1 px-2 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Filtreleri temizle
          </Button>
        ) : null}
      </div>
    </div>
  );
}
