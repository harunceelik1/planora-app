"use client";

import { useState } from "react"; // 1. State ekle
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react"; // 2. Ikonları ekle
import { columns } from "./columns";
import { Issue, Project } from "@/types/project";
import { InlineIssueCreator } from "../issue/inline-issue-creator";
import { DataTable } from "../project-data/data-table";

interface BacklogViewProps {
  project: Project;
  issues: Issue[];
}

export default function BacklogView({ project, issues }: BacklogViewProps) {
  // 👇 3. Açık/Kapalı durumunu tutan state
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-4 w-full h-full p-6 bg-slate-50/50 min-h-screen">
      {/* ÜST BAŞLIK ALANI (Tıklanabilir) */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {/* 👇 Başlığı butona çevirdik */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-slate-600 transition-colors group"
          >
            {/* Açık/Kapalı ikon değişimi */}
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-slate-500 group-hover:text-slate-800" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-800" />
            )}
            Backlog
            <span className="text-xs font-medium text-slate-400 font-normal ml-2">
              {issues.length} tasks
            </span>
          </button>
        </div>

        {/* Create Task Butonu (Opsiyonel, zaten aşağıda var) */}
        {/* <Button...> ... </Button> */}
      </div>

      {/* 👇 LİSTE GÖRÜNÜMÜ (State true ise göster) */}
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
            <DataTable columns={columns} data={issues} />
          </div>
        </div>
      )}

      {/* Kapalıyken sadece ince bir çizgi veya boşluk gösterebilirsin */}
      {!isExpanded && <div className="h-4 border-b border-slate-200"></div>}
    </div>
  );
}
