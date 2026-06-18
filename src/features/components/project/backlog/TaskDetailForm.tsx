"use client";

import { useTranslations, useFormatter } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Flag,
  Calendar as CalendarIcon,
  Zap,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Issue } from "@/types/project";

interface TaskDetailFormProps {
  task: Issue;
  status: string;
  priority: string;
  dueDate: Date | undefined;
  storyPoints: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onDueDateChange: (date: Date | undefined) => void;
  onStoryPointsChange: (value: string) => void;
}

export function TaskDetailForm({
  task,
  status,
  priority,
  dueDate,
  storyPoints,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onStoryPointsChange,
}: TaskDetailFormProps) {
  const t = useTranslations("TaskDetail");
  const formatI18n = useFormatter();

  return (
    // Tüm alanları 2 sütunlu, dengeli bir grid yapısına toplayarak görsel bütünlük sağladık
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
          {t("labels.status")}
        </label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full h-8 text-xs font-medium bg-muted/40 hover:bg-muted/70 border-input text-foreground transition-colors justify-start gap-2 shadow-xs">
            <SelectValue placeholder={t("placeholders.selectStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO" className="text-xs">{t("statuses.todo")}</SelectItem>
            <SelectItem value="IN_PROGRESS" className="text-xs">
              {t("statuses.inProgress")}
            </SelectItem>
            <SelectItem value="DONE" className="text-xs">{t("statuses.done")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ASSIGNEE (ATANAN) - Görseldeki görünmezlik problemi çözüldü */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
          {t("labels.assignee")}
        </label>
        <div className="flex items-center gap-2 h-8 px-3 rounded-md bg-muted/20 border border-border/40 select-none">
          <Avatar className="h-5 w-5 border border-border/60 shrink-0">
            <AvatarImage src={task.assignee?.image || undefined} />
            <AvatarFallback className="bg-muted text-muted-foreground text-[9px] font-bold">
              {task.assignee ? task.assignee.name?.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
          {/* text-slate-700 silindi, text-foreground ve kontrastlı muted yapısı getirildi */}
          <span className={cn(
            "text-xs font-medium tracking-tight truncate",
            task.assignee ? "text-foreground" : "text-muted-foreground/60"
          )}>
            {task.assignee ? task.assignee.name : t("unassigned")}
          </span>
        </div>
      </div>

      {/* PRIORITY (ÖNCELİK) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
          {t("labels.priority")}
        </label>
        <Select value={priority} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-full h-8 text-xs font-medium bg-muted/40 hover:bg-muted/70 border-input text-foreground transition-colors justify-start gap-2 shadow-xs">
            <Flag
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform",
                priority === "HIGH" || priority === "HIGHEST"
                  ? "text-red-500 fill-red-500/20"
                  : priority === "MEDIUM"
                    ? "text-amber-500 fill-amber-500/20"
                    : "text-blue-500 fill-blue-500/20",
              )}
            />
            <SelectValue placeholder={t("placeholders.selectPriority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW" className="text-xs">{t("priorities.low")}</SelectItem>
            <SelectItem value="MEDIUM" className="text-xs">{t("priorities.medium")}</SelectItem>
            <SelectItem value="HIGH" className="text-xs">{t("priorities.high")}</SelectItem>
            <SelectItem value="HIGHEST" className="text-xs">{t("priorities.urgent")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DUE DATE (TESLİM TARİHİ) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
          {t("labels.dueDate")}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-8 text-xs font-medium bg-muted/40 hover:bg-muted/70 border-input text-foreground transition-colors justify-start gap-2 shadow-xs",
                !dueDate && "text-muted-foreground/60",
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">
                {dueDate ? (
                  formatI18n.dateTime(dueDate, { dateStyle: "medium" })
                ) : (
                  t("placeholders.pickDate")
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={onDueDateChange}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* STORY POINTS */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider block">
          {t("labels.storyPoints")}
        </label>
        <Select value={storyPoints} onValueChange={onStoryPointsChange}>
          <SelectTrigger className="w-full h-8 text-xs font-medium bg-muted/40 hover:bg-muted/70 border-input text-foreground transition-colors justify-start gap-2 shadow-xs">
            <Zap className="h-3.5 w-3.5 shrink-0 text-orange-500 fill-orange-500/10" />
            <SelectValue placeholder={t("placeholders.estimate")} />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 5, 8, 13, 21].map((point) => (
              <SelectItem key={point} value={point.toString()} className="text-xs">
                {point}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}