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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Flag,
  Calendar as CalendarIcon,
  Zap,
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
    <>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {t("labels.status")}
        </label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-50 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 dark:text-slate-100">
            <SelectValue placeholder={t("placeholders.selectStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">{t("statuses.todo")}</SelectItem>
            <SelectItem value="IN_PROGRESS">
              {t("statuses.inProgress")}
            </SelectItem>
            <SelectItem value="DONE">{t("statuses.done")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        {/* ASSIGNEE */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t("labels.assignee")}
          </label>
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border">
              <AvatarImage src={task.assignee?.image || undefined} />
              <AvatarFallback className="bg-blue-600 text-white text-[10px] font-medium">
                {task.assignee ? task.assignee.name?.charAt(0) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700">
              {task.assignee ? task.assignee.name : t("unassigned")}
            </span>
          </div>
        </div>

        {/* PRIORITY */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t("labels.priority")}
          </label>
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger className="h-8 border-dashed bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full justify-start gap-2 shadow-none dark:text-slate-100">
              <Flag
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  priority === "HIGH" || priority === "HIGHEST"
                    ? "text-red-500 fill-red-500"
                    : priority === "MEDIUM"
                      ? "text-amber-500 fill-amber-500"
                      : "text-blue-500 fill-blue-500",
                )}
              />
              <SelectValue placeholder={t("placeholders.selectPriority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{t("priorities.low")}</SelectItem>
              <SelectItem value="MEDIUM">
                {t("priorities.medium")}
              </SelectItem>
              <SelectItem value="HIGH">
                {t("priorities.high")}
              </SelectItem>
              <SelectItem value="HIGHEST">
                {t("priorities.urgent")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DUE DATE */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t("labels.dueDate")}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-xs border-dashed",
                  !dueDate && "text-slate-500",
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {dueDate ? (
                  formatI18n.dateTime(dueDate, { dateStyle: "medium" })
                ) : (
                  <span>{t("placeholders.pickDate")}</span>
                )}
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
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t("labels.storyPoints")}
          </label>
          <Select value={storyPoints} onValueChange={onStoryPointsChange}>
            <SelectTrigger className="h-8 border-dashed bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full justify-start gap-2 shadow-none dark:text-slate-100">
              <Zap className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              <SelectValue placeholder={t("placeholders.estimate")} />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 5, 8, 13, 21].map((point) => (
                <SelectItem key={point} value={point.toString()}>
                  {point}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
