"use client";

import { useState, useEffect } from "react";
import { Issue, Project, Sprint } from "@/types/project";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Pen,
  Trash,
  Copy,
  ArrowRight,
  ClipboardList, // İkon için eklendi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import { InlineIssueCreator } from "../issue/inline-issue-creator";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { IssueAssigneeSelector } from "./issue-assignee-selector";
import { useSession } from "next-auth/react";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { createSprint, moveIssueToSprint } from "@/actions/sprint-actions";
import { useTranslations } from "next-intl";
import { useSWRConfig } from "swr";

type ProjectWithSprints = Project & { sprints?: Sprint[] };

interface BacklogViewProps {
  project: ProjectWithSprints;
  issues: Issue[];
}

export default function BacklogView({
  project,
  issues: initialIssues,
}: BacklogViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: session } = useSession();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Kilit mekanizması (Sunucu ile senkronizasyon için)
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [issues, setIssues] = useState<Issue[]>(initialIssues || []);
  const sprints = project.sprints || [];
  const { mutate } = useSWRConfig();
  const projectApiKey = `/api/project/${project.id}`;
  const [creatingSprint, setCreatingSprint] = useState(false);

  const t = useTranslations("ProjectDetails");

  useEffect(() => {
    setIsMounted(true);
    // İşlem devam ederken dışarıdan gelen eski verinin ekranı ezmesini engelliyoruz
    if (!isUpdating) {
      setIssues(initialIssues || []);
    }
  }, [initialIssues, isUpdating]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const targetSprintId =
      destination.droppableId === "backlog" ? null : destination.droppableId;

    // 1. ANINDA GÖRÜNTÜ GÜNCELLEMESİ (Optimistic UI)
    setIssues((currentIssues) => {
      const newIssues = [...currentIssues];
      const draggedIndex = newIssues.findIndex(
        (i) => String(i.id) === String(draggableId),
      );
      if (draggedIndex === -1) return currentIssues;

      const [draggedItem] = newIssues.splice(draggedIndex, 1);
      const updatedIssue = { ...draggedItem, sprintId: targetSprintId as any };

      const targetList = newIssues.filter((i) =>
        targetSprintId === null
          ? !i.sprintId
          : String(i.sprintId) === String(targetSprintId),
      );

      const otherIssues = newIssues.filter((i) =>
        targetSprintId === null
          ? !!i.sprintId
          : String(i.sprintId) !== String(targetSprintId),
      );

      targetList.splice(destination.index, 0, updatedIssue);
      return [...otherIssues, ...targetList];
    });

    if (destination.droppableId !== source.droppableId) {
      setIsUpdating(true);
      try {
        const result = await moveIssueToSprint(draggableId, targetSprintId);
        if (!result.success) {
          await mutate(projectApiKey);
        }
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
      const result = await moveIssueToSprint(issueId, targetSprintId);
      if (!result.success) {
        await mutate(projectApiKey);
      }
    } catch (error) {
      console.error("Kart taşınırken hata:", error);
      await mutate(projectApiKey);
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  const handleCreateSprint = async () => {
    setCreatingSprint(true);
    try {
      const result = await createSprint(project.id);
      if (result.success) {
        await mutate(projectApiKey);
      }
    } finally {
      setCreatingSprint(false);
    }
  };

  const backlogIssues = issues.filter((i) => !i.sprintId);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6 bg-transparent overflow-y-auto">
      {sprints.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border bg-card/40 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("backlogView.noSprints.title")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {t("backlogView.noSprints.description")}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCreateSprint}
            disabled={creatingSprint}
            className="shrink-0"
          >
            {creatingSprint
              ? t("backlogView.noSprints.creating")
              : t("backlogView.noSprints.createButton")}
          </Button>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* --- SPRINT ALANLARI --- */}
        {sprints.length > 0 && (
          <div className="flex flex-col gap-4">
            {sprints.map((sprint) => {
              const sprintIssues = issues.filter(
                (i) => String(i.sprintId) === String(sprint.id),
              );
              return (
                <div key={sprint.id} className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      {sprint.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-bold"
                    >
                      Planlanmadı
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({sprintIssues.length} görev)
                    </span>
                    <div className="ml-auto">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* DÜZELTİLEN DROPPABLE ALANI */}
                  <Droppable droppableId={String(sprint.id)} type="task">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                          "min-h-[120px] w-full rounded-xl flex flex-col gap-2 transition-all border-2",
                          snapshot.isDraggingOver
                            ? "bg-blue-50/80 border-blue-400 border-dashed p-4"
                            : sprintIssues.length === 0
                              ? "border-slate-200 border-dashed bg-transparent p-4"
                              : "border-transparent bg-transparent py-2",
                        )}
                      >
                        {sprintIssues.length === 0 ? (
                          // BOŞ STATE (DROPPABLE İÇİNDE OLMALI!)
                          <div className="flex flex-col items-center justify-center h-full w-full py-4 pointer-events-none select-none text-center">
                            <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center mb-3">
                              <ClipboardList className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="font-semibold text-slate-700 text-sm mb-1">
                              Bu sprintte henüz görev yok
                            </p>
                            <p className="text-xs text-slate-500">
                              Backlog'dan görevleri buraya sürükleyin veya yeni
                              bir görev oluşturun.
                            </p>
                          </div>
                        ) : (
                          sprintIssues.map((issue, index) => (
                            <SprintIssueCard
                              key={issue.id}
                              issue={issue}
                              index={index}
                              projectKey={project.projectKey}
                              onClick={() => setSelectedIssue(issue)}
                            />
                          ))
                        )}
                        {/* HAYATİ ÖNEM TAŞIYAN PLACEHOLDER */}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        )}

        {/* --- BACKLOG --- */}
        <div className="flex flex-col mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-lg font-bold outline-none mb-4"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
            Backlog
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {backlogIssues.length} görev
            </span>
          </button>

          {isExpanded && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="mb-4">
                <InlineIssueCreator
                  projectId={project.id}
                  isSprint={false}
                  className="border-none bg-transparent shadow-none"
                />
              </div>

              {backlogIssues.length > 0 && (
                <div className="grid grid-cols-[30px_30px_minmax(200px,1fr)_120px_150px_50px] gap-2 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <div></div>
                  <div></div>
                  <div>GÖREV ADI</div>
                  <div>ÖNCELİK</div>
                  <div>ATANAN</div>
                  <div className="text-right pr-2">İŞLEMLER</div>
                </div>
              )}

              <Droppable droppableId="backlog" type="task">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-col gap-1 min-h-[150px] rounded-xl pb-10 transition-colors",
                      snapshot.isDraggingOver &&
                        "bg-slate-50/80 ring-1 ring-slate-200",
                    )}
                  >
                    {backlogIssues.length === 0 ? (
                      <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
                        {t("backlogView.backlog.emptyTitle")}
                      </p>
                    ) : (
                      backlogIssues.map((issue, index) => (
                        <BacklogItemCard
                          key={issue.id}
                          issue={issue}
                          index={index}
                          project={project}
                          sprints={sprints}
                          t={t}
                          onEdit={() => setSelectedIssue(issue)}
                          onMove={handleMoveToSprint}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      </DragDropContext>

      <TaskDetailSheet
        task={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        currentUser={session?.user}
      />
    </div>
  );
}

// --- ALT BİLEŞENLER ---

const SprintIssueCard = ({ issue, index, projectKey, onClick }: any) => {
  return (
    <Draggable draggableId={String(issue.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "flex items-center gap-3 py-3 px-4 bg-white border rounded-xl cursor-grab active:cursor-grabbing",
            snapshot.isDragging
              ? "border-primary shadow-2xl z-50 ring-2 ring-primary opacity-90"
              : "border-slate-200 hover:border-slate-300 shadow-sm",
          )}
          onClick={onClick}
        >
          <GripVertical size={16} className="text-slate-300" />
          <span className="text-xs font-mono text-slate-400 shrink-0">
            {projectKey}-{issue.number}
          </span>
          <span className="text-sm font-medium text-slate-700 truncate">
            {issue.title}
          </span>
        </div>
      )}
    </Draggable>
  );
};

const BacklogItemCard = ({
  issue,
  index,
  project,
  sprints,
  t,
  onEdit,
  onMove,
}: any) => {
  const priority = issue.priority || "MEDIUM";
  const colorMap: any = {
    LOW: "bg-blue-50 text-blue-600 border-blue-200",
    MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
    HIGH: "bg-orange-50 text-orange-600 border-orange-200",
    HIGHEST: "bg-red-50 text-red-600 border-red-200",
  };
  const badgeStyle = colorMap[priority] || colorMap.MEDIUM;
  const users = project.members?.map((m: any) => m.user || m) || [];

  return (
    <Draggable draggableId={String(issue.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "grid grid-cols-[30px_30px_minmax(200px,1fr)_120px_150px_50px] gap-2 items-center px-4 py-3 bg-white rounded-xl border group",
            snapshot.isDragging
              ? "shadow-2xl border-primary z-50 ring-2 ring-primary opacity-90"
              : "border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all",
          )}
        >
          <div
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-slate-300 opacity-0 group-hover:opacity-100 flex justify-center transition-opacity"
          >
            <GripVertical size={16} />
          </div>
          <div className="flex justify-center">
            <Checkbox className="rounded-full border-slate-300 w-5 h-5" />
          </div>
          <div
            className="flex flex-col items-start gap-0.5 overflow-hidden cursor-pointer"
            onClick={onEdit}
          >
            <span className="text-sm font-semibold text-slate-700 leading-none truncate w-full">
              {issue.title}
            </span>
            <div className="text-[11px] font-medium text-slate-400 mt-1">
              {project.projectKey}-{issue.number}
            </div>
          </div>
          <div>
            <Badge
              variant="secondary"
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold border",
                badgeStyle,
              )}
            >
              {priority}
            </Badge>
          </div>
          <div>
            <IssueAssigneeSelector
              issue={issue}
              members={users}
              projectId={project.id}
            />
          </div>
          <div className="flex justify-end pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 outline-none">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {t("backlogView.table.actions")}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(String(issue.id))
                  }
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />{" "}
                  {t("backlogView.table.copy_id")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pen className="mr-2 h-3.5 w-3.5" />{" "}
                  {t("backlogView.table.edit_task")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {sprints?.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="mr-2 h-3.5 w-3.5" />{" "}
                      {t("backlogView.table.move_to_sprint")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {sprints.map((s: any) => (
                          <DropdownMenuItem
                            key={s.id}
                            onClick={() => onMove(issue.id, s.id)}
                          >
                            {s.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash className="mr-2 h-3.5 w-3.5" />{" "}
                  {t("backlogView.table.delete_task")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </Draggable>
  );
};
