"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Issue } from "@/types/project";
import { AlertCircle, CheckCircle2, Circle } from "lucide-react";

interface IssueItemProps {
  issue: Issue;
  projectKey: string;
}

export function IssueItem({ issue, projectKey }: IssueItemProps) {
  // Duruma göre ikon belirleme
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "IN_PROGRESS":
        return <Circle className="w-4 h-4 text-blue-600 fill-blue-100" />;
      default: // TODO
        return <Circle className="w-4 h-4 text-slate-400 border-dashed" />;
    }
  };

  return (
    <div className="group flex items-center justify-between p-3  bg-white hover:bg-slate-50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-600">
      {/* SOL TARAFI: İkon, Key, Başlık */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="shrink-0 pt-0.5">{getStatusIcon(issue.status)}</div>

        <span className="text-xs font-mono text-muted-foreground min-w-[60px]">
          {projectKey}-{issue.number}
        </span>

        <span className="text-sm font-medium truncate text-slate-700 group-hover:text-slate-900">
          {issue.title}
        </span>
      </div>

      {/* SAĞ TARAFI: Atanan Kişi, Öncelik vb. */}
      <div className="flex items-center gap-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        {/* Atanan Kişi */}
        {issue.assignee ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={issue.assignee.image || ""} />
            <AvatarFallback className="text-[9px]">
              {getInitials(issue.assignee.name, "")}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
            <span className="text-[10px] text-slate-400">?</span>
          </div>
        )}

        {/* Öncelik İkonu (Basitçe renkli bir div şimdilik) */}
        <div
          className={`w-2 h-2 rounded-full 
            ${
              issue.priority === "HIGH"
                ? "bg-red-500"
                : issue.priority === "MEDIUM"
                ? "bg-yellow-500"
                : "bg-blue-400"
            }`}
          title={issue.priority}
        />
      </div>
    </div>
  );
}
