"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, X } from "lucide-react";
import { Issue } from "@/types/project";

interface TaskDetailHeaderProps {
  task: Issue;
  onClose: () => void;
  onDeleteClick: () => void;
}

export function TaskDetailHeader({
  task,
  onClose,
  onDeleteClick,
}: TaskDetailHeaderProps) {
  return (
    // bg-white ve h-16 temizlendi, dışarıdaki SheetHeader ile çakışmaması için w-full ve flex yapısı optimize edildi
    <div className="flex items-center justify-between w-full gap-4 bg-transparent select-none">
      <div className="flex items-center gap-1.5">
        {/* ID Badge Alanı: Tamamen Shadcn'in "secondary" temasına emanet edildi, hardcoded slate renkleri atıldı */}
        <Badge
          variant="secondary"
          className="font-mono text-[11px] font-medium tracking-tight rounded-md border-none px-2.5 py-0.5 bg-muted text-muted-foreground"
        >
          {task.id.slice(0, 8)}...
        </Badge>
        
        {/* Silme Butonu: Shadcn'in "destructive" mantığına çekilerek karanlık modda tam uyum yakalandı */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={onDeleteClick}
        >
          <Trash2 className="h-4 w-4 stroke-[2]" />
        </Button>
      </div>

      {/* Kapatma Butonu: Maximize2 ikonu yerine asıl işlevi olan X (Kapat) ikonu getirildi */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        onClick={onClose}
      >
      </Button>
    </div>
  );
}