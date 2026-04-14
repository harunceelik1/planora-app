"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Issue, Project, Sprint } from "@/types/project";
import { useSession } from "next-auth/react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useTranslations } from "next-intl";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSprint,
  moveIssueToSprint,
  completeSprint,
} from "@/actions/sprint-actions";
import BacklogGroup from "./BacklogGroup";
import SprintGroup from "./SprintGroup";
import StartSprintModal from "./StartSprintModal";
import { TaskDetailSheet } from "./TaskDetailSheet";

type ProjectWithSprints = Project & { sprints?: Sprint[] };

interface BacklogViewProps {
  project: ProjectWithSprints;
  issues: Issue[];
}

export default function BacklogView({
  project,
  issues: initialIssues,
}: BacklogViewProps) {
  const { data: session } = useSession();
  const { mutate } = useSWRConfig();
  const t = useTranslations("ProjectDetails");

  const [isMounted, setIsMounted] = useState(false);
  const [issues, setIssues] = useState<Issue[]>(initialIssues || []);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [creatingSprint, setCreatingSprint] = useState(false);
  const [sprintModal, setSprintModal] = useState<{
    sprint: Sprint;
    mode: "start" | "settings";
  } | null>(null);
  const [confirmSprint, setConfirmSprint] = useState<Sprint | null>(null);

  const sprints = project.sprints || [];
  const projectApiKey = `/api/project/${project.id}`;
  const backlogIssues = issues.filter((issue) => !issue.sprintId);

  useEffect(() => {
    setIsMounted(true);
    if (!isUpdating) setIssues(initialIssues || []);
  }, [initialIssues, isUpdating]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    const targetSprintId =
      destination.droppableId === "backlog" ? null : destination.droppableId;

    setIssues((current) => {
      const newIssues = [...current];
      const draggedIndex = newIssues.findIndex(
        (issue) => String(issue.id) === String(draggableId),
      );
      if (draggedIndex === -1) return current;

      const [draggedItem] = newIssues.splice(draggedIndex, 1);
      const updatedIssue = { ...draggedItem, sprintId: targetSprintId as any };

      const targetList = newIssues.filter((issue) =>
        targetSprintId === null
          ? !issue.sprintId
          : String(issue.sprintId) === String(targetSprintId),
      );
      const otherIssues = newIssues.filter((issue) =>
        targetSprintId === null
          ? !!issue.sprintId
          : String(issue.sprintId) !== String(targetSprintId),
      );

      targetList.splice(destination.index, 0, updatedIssue);
      return [...otherIssues, ...targetList];
    });

    if (destination.droppableId !== source.droppableId) {
      setIsUpdating(true);
      try {
        await moveIssueToSprint(draggableId, targetSprintId);
        await mutate(projectApiKey);
      } catch (error) {
        console.error("Kart taşınırken hata oluştu:", error);
        await mutate(projectApiKey);
      } finally {
        setTimeout(() => setIsUpdating(false), 300);
      }
    }
  };

  const handleMoveToSprint = async (
    issueId: string,
    targetSprintId: string | null,
  ) => {
    setIsUpdating(true);
    setIssues((current) =>
      current.map((issue) =>
        String(issue.id) === String(issueId)
          ? { ...issue, sprintId: targetSprintId as any }
          : issue,
      ),
    );
    try {
      await moveIssueToSprint(issueId, targetSprintId);
      await mutate(projectApiKey);
    } catch {
      await mutate(projectApiKey);
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  const handleCreateSprint = async () => {
    setCreatingSprint(true);
    try {
      const res = await createSprint(project.id);
      if (res.success) await mutate(projectApiKey);
    } finally {
      setCreatingSprint(false);
    }
  };

  const openSprintModal = (sprint: Sprint, mode: "start" | "settings") =>
    setSprintModal({ sprint, mode });
  const closeSprintModal = () => setSprintModal(null);
  const openCompleteSprintConfirm = (sprint: Sprint) =>
    setConfirmSprint(sprint);
  const closeCompleteSprintConfirm = () => setConfirmSprint(null);

  const handleCompleteSprint = async (sprintId: string) => {
    setIsUpdating(true);
    try {
      const res = await completeSprint(sprintId);
      if (!res.success) {
        toast.error(res.error || t("backlogView.toast.sprintCompleteFailed"));
      } else {
        toast.success(t("backlogView.toast.sprintCompleted"));
      }
      await mutate(projectApiKey);
    } catch (error) {
      console.error(error);
      toast.error(t("backlogView.toast.sprintCompleteFailed"));
    } finally {
      setConfirmSprint(null);
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-8 w-full h-full p-6 bg-transparent overflow-y-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        {sprints.length > 0 && (
          <div className="flex flex-col gap-6">
            {sprints.map((sprint) => (
              <SprintGroup
                key={sprint.id}
                sprint={sprint}
                issues={issues.filter(
                  (issue) => String(issue.sprintId) === String(sprint.id),
                )}
                projectKey={project.projectKey}
                onOpenSprintModal={(mode: "start" | "settings") =>
                  openSprintModal(sprint, mode)
                }
                onCompleteSprint={() => openCompleteSprintConfirm(sprint)}
                onSelectIssue={setSelectedIssue}
              />
            ))}
          </div>
        )}

        <BacklogGroup
          issues={backlogIssues}
          project={project}
          sprints={sprints}
          creatingSprint={creatingSprint}
          onCreateSprint={handleCreateSprint}
          onSelectIssue={setSelectedIssue}
          onMoveIssue={handleMoveToSprint}
        />
      </DragDropContext>

      <TaskDetailSheet
        task={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        currentUser={session?.user}
      />

      <StartSprintModal
        sprint={sprintModal?.sprint ?? null}
        mode={sprintModal?.mode ?? "start"}
        onClose={closeSprintModal}
        onSuccess={() => mutate(projectApiKey)}
      />

      <Dialog
        open={!!confirmSprint}
        onOpenChange={(open) => !open && closeCompleteSprintConfirm()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("backlogView.confirmCompleteSprint.title")}
            </DialogTitle>
            <DialogDescription>
              {t.rich("backlogView.confirmCompleteSprint.description", {
                sprintName: confirmSprint?.name || "",
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeCompleteSprintConfirm}
            >
              {t("backlogView.confirmCompleteSprint.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() =>
                confirmSprint && handleCompleteSprint(confirmSprint.id)
              }
            >
              {t("backlogView.confirmCompleteSprint.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
