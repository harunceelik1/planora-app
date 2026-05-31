"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, CornerDownLeft, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { createIssue } from "@/actions/issue-creator";
import { IssueLabelList, normalizeIssueLabels } from "./issue-labels";

interface InlineIssueCreatorProps {
  projectId: string;
  sprintId?: string;
  isSprint?: boolean;
  className?: string;
}

export function InlineIssueCreator({
  projectId,
  sprintId,
  isSprint = false,
  className,
}: InlineIssueCreatorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiDisabledUntil, setIsAiDisabledUntil] = useState<number | null>(null);
  const [labelsInput, setLabelsInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const disableEditing = () => {
    setLabelsInput("");
    setIsEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") disableEditing();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        disableEditing();
      }
    };
    if (isEditing) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const onSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string;
    if (!title || title.trim() === "") return disableEditing();

    setIsLoading(true);
    formData.append("projectId", projectId);
    if (sprintId) formData.append("sprintId", sprintId);

    const result = await createIssue(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task added to backlog");
      formRef.current?.reset();
      setLabelsInput("");
      if (isSprint) {
        disableEditing();
      } else {
        inputRef.current?.focus();
      }
      await mutate(`/api/project/${projectId}`);
    }
    setIsLoading(false);
  };

  const handleAiSplit = async () => {
    const title = inputRef.current?.value || "";
    if (!title || title.trim() === "") {
      toast.warn("Please enter a task title first.");
      return;
    }
    if (isAiDisabledUntil && isAiDisabledUntil > Date.now()) {
      const wait = Math.ceil((isAiDisabledUntil - Date.now()) / 1000);
      toast.warn(`AI is rate-limited. Try again in ${wait}s`);
      return;
    }

    setIsAiLoading(true);
    try {
      const locale =
        typeof navigator !== "undefined" &&
        navigator.language &&
        navigator.language.startsWith("tr")
          ? "tr"
          : "en";
      const res = await fetch(`/api/ai/decompose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, projectId, sprintId: sprintId || null, locale }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        if (res.status === 429) {
          const retry = data?.retryAfter || Number(res.headers.get("Retry-After")) || 60;
          setIsAiDisabledUntil(Date.now() + retry * 1000);
          toast.error(`AI rate limit. Try again in ${retry}s`);
        } else {
          toast.error(data.error || "AI split failed");
        }
      } else {
        toast.success(`${data.createdCount || 0} subtasks created by AI`);
        formRef.current?.reset();
        setLabelsInput("");
        await mutate(`/api/project/${projectId}`);
        if (isSprint) disableEditing();
      }
    } catch (e) {
      console.error(e);
      toast.error("AI request failed");
    }
    setIsAiLoading(false);
  };

  const previewLabels = normalizeIssueLabels(
    labelsInput
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean),
  );

  // ─── BACKLOG MODE ───────────────────────────────────────────────────────────

  if (!isSprint) {
    if (isEditing) {
      return (
        <form
          ref={formRef}
          action={onSubmit}
          className={cn(
            "relative w-full rounded-xl px-3 py-2",
            "bg-card border border-border shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-ring",
            "transition-all duration-150",
            className,
          )}
        >
          <div className="flex items-center gap-1">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Plus className="h-4 w-4 text-primary" />
              )}
            </span>

            <Input
              ref={inputRef}
              name="title"
              disabled={isLoading}
              onKeyDown={onKeyDown}
              placeholder="What needs to be done?"
              className={cn(
                "h-10 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0",
                "text-foreground placeholder:text-muted-foreground",
              )}
              autoComplete="off"
            />

            <div className="flex flex-shrink-0 items-center gap-1">
              <Button
                type="button"
                onClick={handleAiSplit}
                size="sm"
                variant="ghost"
                disabled={isAiLoading}
                className={cn(
                  "h-8 px-2.5 gap-1.5 rounded-lg text-xs font-medium",
                  "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  "disabled:opacity-50 transition-colors",
                )}
              >
                {isAiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">AI Split</span>
              </Button>

              <Button
                type="submit"
                size="sm"
                variant="ghost"
                disabled={isLoading}
                className={cn(
                  "h-8 px-2.5 gap-1 rounded-lg text-xs font-semibold",
                  "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  "transition-colors",
                )}
              >
                <span className="hidden sm:inline">Enter</span>
                <CornerDownLeft className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setLabelsInput("");
                  disableEditing();
                }}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 w-8 rounded-lg p-0",
                  "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  "transition-colors",
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-1 border-t border-border pt-2">
            <Input
              name="labels"
              value={labelsInput}
              onChange={(event) => setLabelsInput(event.target.value)}
              placeholder="Quick labels: bug, ui, urgent"
              className="h-8 border-0 bg-transparent px-4 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground"
            />
            {previewLabels.length > 0 ? (
              <IssueLabelList labels={previewLabels} className="mt-2" />
            ) : null}
          </div>
        </form>
      );
    }

    // Backlog — closed / trigger state
    return (
      <div
        onClick={enableEditing}
        className={cn(
          "relative w-full flex items-center h-11 px-3 rounded-xl cursor-text group",
          "border border-dashed border-border bg-muted/30",
          "hover:border-primary/40 hover:bg-accent/40",
          "transition-colors duration-150",
          className,
        )}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted group-hover:bg-primary/20 transition-colors mr-2.5">
          <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </span>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          Add a task…
        </span>
      </div>
    );
  }

  // ─── SPRINT MODE ────────────────────────────────────────────────────────────

  if (isEditing) {
    return (
      <form
        ref={formRef}
        action={onSubmit}
        className={cn(
          "mx-2 mb-2 flex flex-col gap-2 rounded-b-xl px-3 py-2",
          "border border-t-0 border-border bg-card",
          "animate-in slide-in-from-top-1 duration-150",
        )}
      >
        <Input
          ref={inputRef}
          name="title"
          placeholder="Task title…"
          className={cn(
            "h-8 text-sm border-input bg-transparent",
            "text-foreground placeholder:text-muted-foreground",
            "focus-visible:ring-1 focus-visible:ring-ring",
          )}
          autoComplete="off"
          onKeyDown={onKeyDown}
          disabled={isLoading}
        />
        <Input
          name="labels"
          value={labelsInput}
          onChange={(event) => setLabelsInput(event.target.value)}
          placeholder="Labels: bug, ui"
          className={cn(
            "h-8 text-xs border-input bg-transparent",
            "text-foreground placeholder:text-muted-foreground",
            "focus-visible:ring-1 focus-visible:ring-ring",
          )}
        />
        {previewLabels.length > 0 ? (
          <IssueLabelList labels={previewLabels} />
        ) : null}
        <div className="flex flex-shrink-0 items-center gap-1 self-end">
          <Button
            type="submit"
            disabled={isLoading}
            size="sm"
            className="h-8 w-8 p-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CornerDownLeft className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setLabelsInput("");
              disableEditing();
            }}
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-colors",
            )}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  // Sprint — closed trigger
  return (
    <div className="px-2 pb-2 mx-2">
      <Button
        onClick={enableEditing}
        variant="ghost"
        className={cn(
          "w-full justify-start h-8 px-2.5 gap-2 rounded-lg text-xs font-medium",
          "text-muted-foreground hover:text-foreground hover:bg-accent",
          "transition-colors duration-150",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Create issue
      </Button>
    </div>
  );
}