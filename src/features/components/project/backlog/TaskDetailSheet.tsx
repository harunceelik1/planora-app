"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useSWRConfig } from "swr";
import { useTranslations, useFormatter } from "next-intl";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Flag,
  Maximize2,
  Calendar as CalendarIcon,
  Zap,
  Send,
} from "lucide-react";
import { Issue } from "@/types/project";
import { createComment, updateIssueData } from "@/actions/issue-actions";

interface TaskDetailSheetProps {
  task: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function TaskDetailSheet({
  task,
  isOpen,
  onClose,
  currentUser,
}: TaskDetailSheetProps) {
  const t = useTranslations("TaskDetail");
  const formatI18n = useFormatter();
  const router = useRouter();
  const params = useParams();
  const { mutate } = useSWRConfig();

  const currentProjectId = params?.projectId;

  const [status, setStatus] = useState("TODO");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<any[]>([]);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setStatus(task.status || "TODO");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setLocalComments(task.comments || []);
    }
  }, [task]);

  if (!task) return null;

  const refreshData = () => {
    router.refresh();
    if (currentProjectId) {
      mutate(`/api/project/${currentProjectId}`);
    }
  };

  const handleUpdateDueDate = async (date: Date | undefined) => {
    setDueDate(date);
    const dateString = date ? date.toISOString() : null;
    const result = await updateIssueData(task.id, { dueDate: dateString });
    if (result.success) refreshData();
  };

  const handleSaveDescription = async () => {
    setIsEditingDesc(false);
    const result = await updateIssueData(task.id, { description });
    if (result.success) refreshData();
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !currentUser?.id) return;
    const textToSend = commentText;
    setCommentText("");

    const result = await createComment(task.id, textToSend, currentUser.id);
    if (result.success && result.data) {
      setLocalComments((prev) => [...prev, result.data]);
      refreshData();
    } else {
      setCommentText(textToSend);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col h-full bg-white border-l shadow-2xl">
        <SheetHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 h-16 shrink-0">
          <SheetTitle className="sr-only">
            {t("taskDetails")}: {task.title}
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 border-none font-mono text-xs rounded-sm px-2 py-0.5"
            >
              {task.id.slice(0, 8)}...
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-slate-100 rounded-full"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {task.title || t("noTitle")}
            </h2>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t("labels.status")}
              </label>
              <Select
                value={status}
                onValueChange={async (val) => {
                  setStatus(val);
                  const res = await updateIssueData(task.id, { status: val });
                  if (res.success) refreshData();
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-9 bg-white border-slate-200">
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t("labels.priority")}
                </label>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {t(`priorities.${task.priority?.toLowerCase() || "low"}`)}
                  </span>
                </div>
              </div>

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
                      onSelect={handleUpdateDueDate}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t("labels.storyPoints")}
                </label>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-slate-600">
                    {task.storyPoints || t("placeholders.estimate")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t("labels.description")}
              </label>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDescription(task.description || "");
                        setIsEditingDesc(false);
                      }}
                    >
                      {t("buttons.cancel")}
                    </Button>
                    <Button size="sm" onClick={handleSaveDescription}>
                      {t("buttons.save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="min-h-[120px] p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-sm text-slate-600 cursor-text hover:bg-slate-50 transition-colors"
                >
                  {description ? (
                    <p className="whitespace-pre-wrap">{description}</p>
                  ) : (
                    <span className="text-slate-400">
                      {t("placeholders.addDescription")}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t("activityAndComments")}
              </h3>
              <div className="space-y-5">
                {localComments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={comment.user?.image} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                        {comment.user?.name ? comment.user.name.charAt(0) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {comment.user?.name || t("unknownUser")}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatI18n.dateTime(new Date(comment.createdAt), {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 border-t bg-white">
          <div className="flex gap-3 items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.image || undefined} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {currentUser?.name
                  ? currentUser.name.charAt(0).toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendComment();
                }}
                placeholder={t("placeholders.addComment")}
                className="w-full text-sm rounded-full border border-slate-200 pl-4 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              size="icon"
              className="rounded-full bg-blue-600 hover:bg-blue-700 h-9 w-9"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
