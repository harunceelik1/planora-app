"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Issue, Project } from "@/types/project";
import { InlineIssueCreator } from "../issue/inline-issue-creator";
import { DataTable } from "../project-data/data-table";
import { columns } from "./columns";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { useSession } from "next-auth/react";

// 👇 1. Sheet bileşenini import et (yolu kendi dosyana göre ayarla)

interface BacklogViewProps {
  project: Project;
  issues: Issue[];
}

export default function BacklogView({ project, issues }: BacklogViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: session } = useSession();
  // 👇 2. Seçili görevi tutacak State'i ekle
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const getColumns = columns(
    project.members,
    project.projectKey,
    project.id,
    (issue) => setSelectedIssue(issue), // 👈 Edit butonuna tıklandığında seçili görevi güncelle
  );

  return (
    <div className="flex flex-col gap-4 w-full h-full p-6 bg-slate-50/50 min-h-screen">
      {/* ÜST BAŞLIK ALANI */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-slate-600 transition-colors group"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-slate-500 group-hover:text-slate-800" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-800" />
            )}
            Backlog
            <span className="text-xs font-medium text-slate-400  ml-2">
              {issues.length} tasks
            </span>
          </button>
        </div>
      </div>

      {/* LİSTE GÖRÜNÜMÜ */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {/* HIZLI EKLEME ALANI */}
          <div className="">
            <div className="p-1">
              <InlineIssueCreator
                projectId={project.id}
                isSprint={false}
                className="border-0 shadow-none bg-transparent"
              />
            </div>
          </div>

          {/* TABLO ALANI */}
          <div className="">
            {/* 👇 3. DataTable'a tıklama özelliği gönderiyoruz */}
            <DataTable columns={getColumns} data={issues} />
          </div>
        </div>
      )}

      {!isExpanded && <div className="h-4 border-b border-slate-200"></div>}

      {/* 👇 4. Sheet Bileşenini en sona ekle */}
      <TaskDetailSheet
        task={selectedIssue} // Seçili görevi gönder
        isOpen={!!selectedIssue} // Doluysa true, boşsa false
        onClose={() => setSelectedIssue(null)} // Kapanınca sıfırla
        currentUser={session?.user}
      />
    </div>
  );
}
