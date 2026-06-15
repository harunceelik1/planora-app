"use client";

import { Flag, GripVertical } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Issue } from "@/types/project";
import { IssueLabelList } from "../issue/issue-labels";

interface SprintIssueCardProps {
  issue: Issue;
  index: number;
  projectKey: string;
  onClick: () => void;
  disabled?: boolean;
}

// Shadcn temasıyla uyumlu, gözü yormayan premium öncelik renkleri
const priorityStyles: Record<string, string> = {
  LOW: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  MEDIUM: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  HIGH: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  HIGHEST: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function SprintIssueCard({
  issue,
  index,
  projectKey,
  onClick,
  disabled = false,
}: SprintIssueCardProps) {
  const priority = issue.priority || "MEDIUM";
  const badgeStyle = priorityStyles[priority] || priorityStyles.MEDIUM;

  return (
    <Draggable
      draggableId={String(issue.id)}
      index={index}
      isDragDisabled={disabled}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            // Ana Kart Yapısı: Tamamen Shadcn değişkenlerine bağlandı (bg-card, border-border, text-card-foreground)
            "group grid grid-cols-[24px_minmax(220px,1fr)_104px] items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-xs",
            "transition-all duration-200",
            
            // Tıklanabilir Kart Durumu (Hover & Active)
            !disabled && "cursor-pointer hover:border-muted-foreground/30 hover:bg-accent/40 active:bg-accent/60",
            
            // Sürüklenme Anı (Dragging) Görsel İyileştirmesi
            snapshot.isDragging && "z-50 border-primary/40 bg-card shadow-xl ring-2 ring-primary/10 select-none",
            
            // Devre Dışı (Disabled) Durumu
            disabled && "cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground/60 opacity-60"
          )}
          onClick={() => !disabled && onClick()}
        >
          {/* Sürükleme Kulpu (Drag Handle) */}
          <div
            {...provided.dragHandleProps}
            className={cn(
              "flex justify-center text-muted-foreground/30 transition-all",
              disabled 
                ? "cursor-not-allowed opacity-20" 
                : "cursor-grab opacity-0 group-hover:opacity-100 active:cursor-grabbing text-muted-foreground/60"
            )}
          >
            <GripVertical size={15} />
          </div>

          {/* İçerik Alanı */}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {issue.title}
            </p>
            <p className="mt-0.5 font-mono text-[11px] font-medium text-muted-foreground/80">
              {projectKey}-{issue.number}
            </p>
            <IssueLabelList labels={issue.labels} limit={2} className="mt-1.5" />
          </div>

          {/* Sağ Alan - Öncelik Badge */}
          <div className="flex justify-end select-none">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors",
                badgeStyle,
              )}
            >
              <Flag className="h-2.5 w-2.5 stroke-[2.5]" />
              {priority}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}