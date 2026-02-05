"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Issue, Project } from "@/types/project";
import { CheckCircle2, Circle } from "lucide-react";
import { IssueAssigneeSelector } from "./issue-assignee-selector"; // <-- Yeni bileşeni import et

// Project tipindeki members yapısını aynen kullanıyoruz
interface IssueItemProps {
  issue: Issue;
  projectKey: string;
  members: Project["members"];
}

export function IssueItem({ issue, projectKey, members }: IssueItemProps) {
  // BacklogView'dan gelen "ProjectMember" listesini,
  // AssigneeSelector'ın istediği sade "User" listesine çeviriyoruz.
  const users = members.map((m) => m.user);

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
    <div className="group flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-600 border-b border-slate-100 last:border-0">
      {/* SOL TARAFI: İkon, Key, Başlık */}
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className="shrink-0 pt-0.5">{getStatusIcon(issue.status)}</div>

        <span className="text-xs font-mono text-muted-foreground min-w-[60px]">
          {projectKey}-{issue.number}
        </span>

        <span className="text-sm font-medium truncate text-slate-700 group-hover:text-slate-900">
          {issue.title}
        </span>
      </div>

      {/* SAĞ TARAFI: Atanan Kişi ve Öncelik */}
      <div className="flex items-center gap-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity pl-4">
        {/* --- YENİ ATAMA BİLEŞENİ --- */}
        <div onClick={(e) => e.stopPropagation()}>
          {/* stopPropagation: Satıra tıklayınca detay açılmasın, sadece atama yapılsın diye */}
          <IssueAssigneeSelector issue={issue} members={users} />
        </div>

        {/* Öncelik İkonu */}
        <div
          className={`w-2 h-2 rounded-full ring-2 ring-white
            ${
              issue.priority === "HIGH" || issue.priority === "HIGHEST"
                ? "bg-red-500"
                : issue.priority === "MEDIUM"
                ? "bg-yellow-500"
                : "bg-blue-400"
            }`}
          title={`Öncelik: ${issue.priority}`}
        />
      </div>
    </div>
  );
}
