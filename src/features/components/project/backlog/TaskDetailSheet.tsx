"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSWRConfig } from "swr";
import { useTranslations, useFormatter } from "next-intl";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";

import { Comment, Issue } from "@/types/project";
import {
  createComment,
  deleteIssue,
  updateIssueData,
} from "@/actions/issue-actions";
import { normalizeIssueLabels } from "../issue/issue-labels";

import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskDetailForm } from "./TaskDetailForm";
import { TaskDetailDescription } from "./TaskDetailDescription";
import { TaskDetailLabels } from "./TaskDetailLabels";
import { TaskActivitySection } from "./TaskActivitySection";
import { CommentInput } from "./CommentInput";
import { TaskDeleteDialog } from "./TaskDeleteDialog";

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
  const { data: session } = useSession();
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
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [priority, setPriority] = useState("LOW");
  const [storyPoints, setStoryPoints] = useState<string>("");
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setStatus(task.status || "TODO");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setLocalComments(
        (task.comments || []).map((comment) => {
          if (
            currentUser?.id &&
            comment.user?.id === currentUser.id &&
            comment.user
          ) {
            return {
              ...comment,
              user: {
                ...comment.user,
                image: currentUser.image || comment.user.image,
              },
            };
          }
          return comment;
        }),
      );

      setPriority(task.priority || "LOW");
      setStoryPoints(task.storyPoints?.toString() || "");
      setLabels(normalizeIssueLabels(task.labels));
      setLabelInput("");
    }
    // load activities for the task
    (async () => {
      if (!task) return;
      setLoadingActivities(true);
      try {
        const res = await fetch(`/api/issues/${task.id}/activities`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setActivities(json.data);
        } else {
          setActivities([]);
        }
      } catch (err) {
        console.error("Failed to load activities", err);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, [task, currentUser]);

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

  const persistLabels = async (nextLabels: string[]) => {
    setLabels(nextLabels);
    const result = await updateIssueData(task.id, { labels: nextLabels });
    if (result.success) {
      refreshData();
      return true;
    }

    setLabels(normalizeIssueLabels(task.labels));
    toast.error(result.error || "Etiketler güncellenemedi.");
    return false;
  };

  const handleAddLabel = async () => {
    const nextValue = labelInput.trim();
    if (!nextValue) return;

    const nextLabels = normalizeIssueLabels([...labels, nextValue]);
    if (nextLabels.length === labels.length) {
      setLabelInput("");
      return;
    }

    const success = await persistLabels(nextLabels);
    if (success) setLabelInput("");
  };

  const handleRemoveLabel = async (labelToRemove: string) => {
    const nextLabels = labels.filter((label) => label !== labelToRemove);
    await persistLabels(nextLabels);
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
            <TaskDetailHeader
              task={task}
              onClose={onClose}
              onDeleteClick={() => setIsDeleteDialogOpen(true)}
            />
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {task.title || t("noTitle")}
              </h2>

              <TaskDetailForm
                task={task}
                status={status}
                priority={priority}
                dueDate={dueDate}
                storyPoints={storyPoints}
                onStatusChange={async (val) => {
                  setStatus(val);
                  const res = await updateIssueData(task.id, { status: val });
                  if (res.success) refreshData();
                }}
                onPriorityChange={async (val) => {
                  setPriority(val);
                  const res = await updateIssueData(task.id, { priority: val });
                  if (res.success) refreshData();
                }}
                onDueDateChange={handleUpdateDueDate}
                onStoryPointsChange={async (val) => {
                  setStoryPoints(val);
                  const res = await updateIssueData(task.id, {
                    storyPoints: parseInt(val),
                  });
                  if (res.success) refreshData();
                }}
              />

              <TaskDetailDescription
                description={description}
                isEditing={isEditingDesc}
                originalDescription={task.description || ""}
                onDescriptionChange={setDescription}
                onEditingChange={setIsEditingDesc}
                onSave={handleSaveDescription}
              />

              <TaskDetailLabels
                labels={labels}
                labelInput={labelInput}
                onLabelInputChange={setLabelInput}
                onAddLabel={handleAddLabel}
                onRemoveLabel={handleRemoveLabel}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddLabel();
                }}
              />

              <TaskActivitySection
                activities={activities}
                comments={localComments}
                loadingActivities={loadingActivities}
                currentUser={currentUser}
              />
            </div>
          </div>

          <CommentInput
            commentText={commentText}
            currentUser={currentUser}
            onCommentChange={setCommentText}
            onSendComment={handleSendComment}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendComment();
            }}
          />
        </SheetContent>
      </Sheet>

      <TaskDeleteDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isDeleting}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteTask}
      />
    </>
  );
}
