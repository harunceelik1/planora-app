"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TaskDetailDescriptionProps {
  description: string;
  isEditing: boolean;
  originalDescription: string;
  onDescriptionChange: (value: string) => void;
  onEditingChange: (value: boolean) => void;
  onSave: () => void;
}

export function TaskDetailDescription({
  description,
  isEditing,
  originalDescription,
  onDescriptionChange,
  onEditingChange,
  onSave,
}: TaskDetailDescriptionProps) {
  const t = useTranslations("TaskDetail");

  const handleCancel = () => {
    onDescriptionChange(originalDescription);
    onEditingChange(false);
  };

  return (
    <div className="space-y-2">
      {/* Üst küçük başlık: text-slate-500 yerine Shadcn'in sönük metin rengi verildi */}
      <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
        {t("labels.description")}
      </label>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            // Textarea bileşeni tamamen Shadcn input focus stillerine bağlandı
            className="min-h-32 text-sm bg-background border-input text-foreground focus-visible:ring-2 focus-visible:ring-ring/10 focus-visible:border-muted-foreground/40 resize-none transition-all p-3.5"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="text-xs font-medium h-8"
            >
              {t("buttons.cancel")}
            </Button>
            <Button 
              size="sm" 
              onClick={onSave}
              className="text-xs font-medium h-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("buttons.save")}
            </Button>
          </div>
        </div>
      ) : (
        /* Düzenleme Modu Dışı: `TaskDetailSheet` içinde zaten bir dış kutu (wrapper) 
          eklediğimiz için, buradaki ekstra border'ı ve çiğ arka planı kaldırdık. 
          Böylece temiz, basık olmayan, pürüzsüz bir alan elde ettik.
        */
        <div
          onClick={() => onEditingChange(true)}
          className={cn(
            "min-h-24 p-1.5 rounded-lg text-sm transition-all cursor-text text-foreground/90",
            "hover:bg-muted/40 hover:text-foreground"
          )}
        >
          {description ? (
            <p className="whitespace-pre-wrap leading-relaxed text-sm">
              {description}
            </p>
          ) : (
            <span className="text-muted-foreground/50 italic text-sm select-none">
              {t("placeholders.addDescription")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}