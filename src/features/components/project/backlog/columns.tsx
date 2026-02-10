"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Issue, Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Radix UI veya kendi Checkbox bileşenin
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IssueAssigneeSelector } from "./issue-assignee-selector";

export const columns = (
  members: Project["members"],
  projectKey: string,
  projectId: string,
): ColumnDef<Issue>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] rounded-full border-slate-300"
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center w-6">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="rounded-full border-slate-300 "
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "TASK NAME",
    cell: ({ row }) => {
      const issue = row.original;
      if (!issue) return null;

      return (
        <div className="flex flex-col items-start gap-0.5 py-1">
          <span className="text-[14px] font-bold text-slate-800 leading-none">
            {issue.title}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
            <span>
              {projectKey}-{issue.number}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "PRIORITY",
    cell: ({ row }) => {
      const priority = row.original?.priority || "MEDIUM";
      return (
        <Badge
          variant="secondary"
          className="bg-amber-50 text-amber-600 border-amber-100 px-2 py-0.5 text-[10px] font-bold"
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: "ASSIGNEE",
    cell: ({ row }) => {
      const issue = row.original;
      const users = members?.map((m) => m.user || m) || [];

      return (
        // 🔥 issue.assigneeId değiştiğinde bu div'in içindekiler tamamen yeniden oluşturulur.
        <div key={issue.id + (issue.assigneeId || "none")}>
          <IssueAssigneeSelector
            issue={issue}
            members={users}
            projectId={projectId}
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 outline-none">
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
