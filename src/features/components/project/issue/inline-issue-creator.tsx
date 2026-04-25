"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, CornerDownLeft, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { createIssue } from "@/actions/issue-creator";

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
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const disableEditing = () => setIsEditing(false);

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
        await mutate(`/api/project/${projectId}`);
        if (isSprint) disableEditing();
      }
    } catch (e) {
      console.error(e);
      toast.error("AI request failed");
    }
    setIsAiLoading(false);
  };

  // ─── BACKLOG MODE ───────────────────────────────────────────────────────────

  if (!isSprint) {
    if (isEditing) {
      return (
        <form
          ref={formRef}
          action={onSubmit}
          className={cn(
            // container
            "relative w-full flex items-center gap-1 px-3 py-1.5 rounded-xl",
            // light
            "bg-white border border-indigo-200 ring-2 ring-indigo-100 shadow-sm",
            // dark
            "dark:bg-slate-800 dark:border-indigo-700/60 dark:ring-indigo-900/50 dark:shadow-none",
            "transition-all duration-150",
            className,
          )}
        >
          {/* leading icon */}
          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            ) : (
              <Plus className="h-4 w-4 text-indigo-500" />
            )}
          </span>

          {/* input */}
          <Input
            ref={inputRef}
            name="title"
            disabled={isLoading}
            onKeyDown={onKeyDown}
            placeholder="What needs to be done?"
            className={cn(
              "h-10 flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent",
              "text-sm text-slate-800 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            )}
            autoComplete="off"
          />

          {/* action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* AI split */}
            <Button
              type="button"
              onClick={handleAiSplit}
              size="sm"
              variant="ghost"
              disabled={isAiLoading}
              className={cn(
                "h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg",
                "text-slate-500 dark:text-slate-400",
                "hover:text-emerald-700 hover:bg-emerald-50",
                "dark:hover:text-emerald-300 dark:hover:bg-emerald-950/40",
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

            {/* submit */}
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              disabled={isLoading}
              className={cn(
                "h-8 px-2.5 gap-1 text-xs font-semibold rounded-lg",
                "text-slate-500 dark:text-slate-400",
                "hover:text-indigo-700 hover:bg-indigo-50",
                "dark:hover:text-indigo-300 dark:hover:bg-indigo-950/50",
                "transition-colors",
              )}
            >
              <span className="hidden sm:inline">Enter</span>
              <CornerDownLeft className="h-3.5 w-3.5" />
            </Button>

            {/* close */}
            <Button
              type="button"
              onClick={disableEditing}
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0 rounded-lg",
                "text-slate-400 dark:text-slate-500",
                "hover:text-red-500 hover:bg-red-50",
                "dark:hover:text-red-400 dark:hover:bg-red-950/40",
                "transition-colors",
              )}
            >
              <X className="h-4 w-4" />
            </Button>
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
          "border border-dashed border-slate-200 dark:border-slate-700/60",
          "bg-slate-50/50 dark:bg-slate-800/30",
          "hover:border-indigo-300 hover:bg-indigo-50/40",
          "dark:hover:border-indigo-700/60 dark:hover:bg-indigo-950/20",
          "transition-colors duration-150",
          className,
        )}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-200/60 dark:bg-slate-700/60 mr-2.5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
          <Plus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
        </span>
        <span className="text-sm text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
          "flex items-center gap-2 px-3 py-2 mx-2 mb-2 rounded-b-xl",
          "border border-t-0 border-slate-200 dark:border-slate-700/60",
          "bg-white dark:bg-slate-800/60",
          "animate-in slide-in-from-top-1 duration-150",
        )}
      >
        <Input
          ref={inputRef}
          name="title"
          placeholder="Task title…"
          className={cn(
            "h-8 text-sm border-slate-200 dark:border-slate-600",
            "bg-transparent dark:bg-slate-700/40",
            "text-slate-800 dark:text-slate-100",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "focus-visible:ring-1 focus-visible:ring-indigo-500",
          )}
          autoComplete="off"
          onKeyDown={onKeyDown}
          disabled={isLoading}
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            type="submit"
            disabled={isLoading}
            size="sm"
            className="h-8 w-8 p-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CornerDownLeft className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            type="button"
            onClick={disableEditing}
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              "text-slate-400 dark:text-slate-500",
              "hover:text-red-500 hover:bg-red-50",
              "dark:hover:text-red-400 dark:hover:bg-red-950/40",
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
          "text-slate-400 dark:text-slate-500",
          "hover:text-slate-700 hover:bg-slate-100",
          "dark:hover:text-slate-300 dark:hover:bg-slate-700/50",
          "transition-colors duration-150",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Create issue
      </Button>
    </div>
  );
}