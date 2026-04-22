"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useSWRConfig } from "swr";
import { useTranslations, useFormatter } from "next-intl";
import { toast } from "react-toastify";

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
  Trash2,
} from "lucide-react";
import { Comment, Issue } from "@/types/project";
import {
  createComment,
  deleteIssue,
  updateIssueData,
} from "@/actions/issue-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskDetailSheetProps {
  task: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (taskId: string) => void;
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
  onDeleted,
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
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Burada state'lerimiz duruyor, süper.
  const [priority, setPriority] = useState("LOW");
  const [storyPoints, setStoryPoints] = useState<string>("");

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setStatus(task.status || "TODO");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setLocalComments(task.comments || []);

      setPriority(task.priority || "LOW");
      setStoryPoints(task.storyPoints?.toString() || "");
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
      setLocalComments((prev) => [...prev, result.data as unknown as Comment]);
      refreshData();
    } else {
      setCommentText(textToSend);
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    const result = await deleteIssue(task.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error || t("deleteDialog.error"));
      return;
    }

    toast.success(t("deleteDialog.success"));
    setIsDeleteDialogOpen(false);
    onDeleted?.(task.id);
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-125 w-full p-0 flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
          <SheetHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between space-y-0 h-16 shrink-0 bg-white dark:bg-slate-950">
            <SheetTitle className="sr-only">
              {t("taskDetails")}: {task.title}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-none font-mono text-xs rounded-sm px-2 py-0.5"
              >
                {task.id.slice(0, 8)}...
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              onClick={onClose}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
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

              {/* PRIORITY - DÜZELTİLEN KISIM */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t("labels.priority")}
                </label>
                <Select
                  value={priority} // task.priority'den priority state'ine geçtik
                  onValueChange={async (val) => {
                    setPriority(val); // UI anında güncelleniyor
                    const res = await updateIssueData(task.id, {
                      priority: val,
                    });
                    if (res.success) refreshData();
                  }}
                >
                  <SelectTrigger className="h-8 border-dashed bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full justify-start gap-2 shadow-none dark:text-slate-100">
                    <Flag
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        // İkon rengini de state'e bağladık
                        priority === "HIGH" || priority === "HIGHEST"
                          ? "text-red-500 fill-red-500"
                          : priority === "MEDIUM"
                            ? "text-amber-500 fill-amber-500"
                            : "text-blue-500 fill-blue-500",
                      )}
                    />
                    <SelectValue
                      placeholder={t("placeholders.selectPriority")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t("priorities.low")}</SelectItem>
                    <SelectItem value="MEDIUM">
                      {t("priorities.medium")}
                    </SelectItem>
                    <SelectItem value="HIGH">{t("priorities.high")}</SelectItem>
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
                      onSelect={handleUpdateDueDate}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* STORY POINTS - DÜZELTİLEN KISIM */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t("labels.storyPoints")}
                </label>
                <Select
                  value={storyPoints} // task.storyPoints'den storyPoints state'ine geçtik
                  onValueChange={async (val) => {
                    setStoryPoints(val); // UI anında güncelleniyor
                    const res = await updateIssueData(task.id, {
                      storyPoints: parseInt(val),
                    });
                    if (res.success) refreshData();
                  }}
                >
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

            {/* DESCRIPTION */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t("labels.description")}
              </label>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-30 text-sm"
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
                  className="min-h-30 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-200 cursor-text hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
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

            {/* COMMENTS */}
            <div className="space-y-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("activityAndComments")}
              </h3>
              <div className="space-y-5">
                {localComments.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={comment.user?.image || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                        {comment.user?.name ? comment.user.name.charAt(0) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {comment.user?.name || t("unknownUser")}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-400">
                          {formatI18n.dateTime(new Date(comment.createdAt), {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COMMENT INPUT */}
        <div className="shrink-0 p-4 border-t border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800">
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
                className="w-full text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pl-4 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={(event) => {
                event.preventDefault();
                if (!isDeleting) {
                  handleDeleteTask();
                }
              }}
            >
              {isDeleting
                ? t("deleteDialog.deleting")
                : t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
