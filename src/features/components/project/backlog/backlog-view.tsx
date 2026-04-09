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
  ClipboardList,
  Play,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

// ==========================================
// ANA BİLEŞEN
// ==========================================
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

  // İşlem Kilitleri
  const [isUpdating, setIsUpdating] = useState(false);
  const [creatingSprint, setCreatingSprint] = useState(false);
  const [sprintToStart, setSprintToStart] = useState<Sprint | null>(null);

  const sprints = project.sprints || [];
  const projectApiKey = `/api/project/${project.id}`;
  const backlogIssues = issues.filter((i) => !i.sprintId);

  useEffect(() => {
    setIsMounted(true);
    if (!isUpdating) setIssues(initialIssues || []);
  }, [initialIssues, isUpdating]);

  // Sürükle Bırak Mantığı
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

    // Optimistic UI Güncellemesi
    setIssues((current) => {
      const newIssues = [...current];
      const draggedIndex = newIssues.findIndex(
        (i) => String(i.id) === String(draggableId),
      );
      if (draggedIndex === -1) return current;

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

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-8 w-full h-full p-6 bg-transparent overflow-y-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* SPRINT LİSTESİ */}
        {sprints.length > 0 && (
          <div className="flex flex-col gap-6">
            {sprints.map((sprint) => (
              <SprintGroup
                key={sprint.id}
                sprint={sprint}
                issues={issues.filter(
                  (i) => String(i.sprintId) === String(sprint.id),
                )}
                projectKey={project.projectKey}
                onStartSprint={() => setSprintToStart(sprint)}
                onSelectIssue={setSelectedIssue}
              />
            ))}
          </div>
        )}

        {/* BACKLOG ALANI */}
        <BacklogGroup
          issues={backlogIssues}
          project={project}
          sprints={sprints}
          t={t}
          creatingSprint={creatingSprint}
          onCreateSprint={handleCreateSprint}
          onSelectIssue={setSelectedIssue}
          onMoveIssue={handleMoveToSprint}
        />
      </DragDropContext>

      {/* MODALLAR VE ÇEKMECELER */}
      <TaskDetailSheet
        task={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        currentUser={session?.user}
      />

      <StartSprintModal
        sprint={sprintToStart}
        onClose={() => setSprintToStart(null)}
        onSuccess={() => mutate(projectApiKey)}
      />
    </div>
  );
}

// ==========================================
// ALT BİLEŞENLER (MODÜLLER)
// ==========================================

// 1. SPRINT ALANI BİLEŞENİ
const SprintGroup = ({
  sprint,
  issues,
  projectKey,
  onStartSprint,
  onSelectIssue,
}: any) => {
  const isActive = sprint.status === "ACTIVE";

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* SPRINT BAŞLIĞI (Daha temiz ve belirgin) */}
      <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-slate-500" />
            {sprint.name}
          </h3>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="text-[10px] uppercase font-bold"
          >
            {isActive ? "Aktif" : "Planlanmadı"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ({issues.length} görev)
          </span>
        </div>

        {/* SPRINT BAŞLAT BUTONU (Yukarıda ve düzenli) */}
        <div className="flex items-center gap-2">
          {!isActive && (
            <Button
              size="sm"
              className="h-8 bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={issues.length === 0}
              onClick={onStartSprint}
            >
              <Play className="w-3 h-3 mr-1.5 fill-current" />
              Sprint'i Başlat
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SPRINT İÇERİĞİ (Sürükle bırak alanı) */}
      <Droppable droppableId={String(sprint.id)} type="task">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn(
              "min-h-[100px] w-full flex flex-col gap-2 p-3 transition-colors",
              snapshot.isDraggingOver ? "bg-blue-50/50" : "bg-transparent",
            )}
          >
            {issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center select-none opacity-60">
                <ClipboardList className="w-6 h-6 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">
                  Bu sprint boş
                </p>
                <p className="text-xs text-slate-400">
                  Backlog'dan görev sürükleyin
                </p>
              </div>
            ) : (
              issues.map((issue: any, index: number) => (
                <SprintIssueCard
                  key={issue.id}
                  issue={issue}
                  index={index}
                  projectKey={projectKey}
                  onClick={() => onSelectIssue(issue)}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

// 2. BACKLOG ALANI BİLEŞENİ
const BacklogGroup = ({
  issues,
  project,
  sprints,
  t,
  creatingSprint,
  onCreateSprint,
  onSelectIssue,
  onMoveIssue,
}: any) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col mt-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-bold outline-none"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          Backlog
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {issues.length} görev
          </span>
        </button>
        <Button
          onClick={onCreateSprint}
          disabled={creatingSprint}
          variant="secondary"
          size="sm"
        >
          {creatingSprint ? "Oluşturuluyor..." : "Sprint Oluştur"}
        </Button>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mb-4">
            <InlineIssueCreator
              projectId={project.id}
              isSprint={false}
              className="border-none bg-transparent shadow-none"
            />
          </div>

          {issues.length > 0 && (
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
                {issues.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
                    {t("backlogView.backlog.emptyTitle")}
                  </p>
                ) : (
                  issues.map((issue: any, index: number) => (
                    <BacklogItemCard
                      key={issue.id}
                      issue={issue}
                      index={index}
                      project={project}
                      sprints={sprints}
                      t={t}
                      onEdit={() => onSelectIssue(issue)}
                      onMove={onMoveIssue}
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
  );
};

// 3. SPRINT BAŞLATMA MODALI BİLEŞENİ
const StartSprintModal = ({
  sprint,
  onClose,
  onSuccess,
}: {
  sprint: Sprint | null;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sprint) return;
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const sprintData = Object.fromEntries(formData.entries());
      console.log("Sprint Başlatılıyor:", sprintData, "ID:", sprint.id);
      // await startSprintAction(sprint.id, sprintData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!sprint} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sprint'i Başlat</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sprintName">Sprint Adı</Label>
            <Input
              id="sprintName"
              name="sprintName"
              defaultValue={sprint?.name}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Başlangıç</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">Bitiş</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sprintGoal">Sprint Hedefi</Label>
            <Input
              id="sprintGoal"
              name="sprintGoal"
              placeholder="Örn: Hataları çözmek"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Başlatılıyor..." : "Başlat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ==========================================
// KART BİLEŞENLERİ (Değişmedi, sadece alta taşındı)
// ==========================================

const SprintIssueCard = ({ issue, index, projectKey, onClick }: any) => {
  return (
    <Draggable draggableId={String(issue.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "flex items-center gap-3 py-2.5 px-3 bg-white border rounded-lg cursor-grab active:cursor-grabbing",
            snapshot.isDragging
              ? "border-primary shadow-xl z-50 ring-1 ring-primary opacity-90"
              : "border-slate-200 hover:border-slate-300 shadow-sm",
          )}
          onClick={onClick}
        >
          <GripVertical size={14} className="text-slate-300" />
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
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
  const badgeStyle =
    {
      LOW: "bg-blue-50 text-blue-600",
      MEDIUM: "bg-amber-50 text-amber-600",
      HIGH: "bg-orange-50 text-orange-600",
      HIGHEST: "bg-red-50 text-red-600",
    }[priority as string] || "bg-amber-50 text-amber-600";
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
                "px-2 py-0.5 text-[10px] font-bold border-transparent",
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </Draggable>
  );
};
