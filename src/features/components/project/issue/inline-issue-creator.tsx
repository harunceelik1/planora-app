"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, PlusCircle, CornerDownLeft } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { createIssue } from "@/actions/issue-creator";

interface InlineIssueCreatorProps {
  projectId: string;
  sprintId?: string;
  isSprint?: boolean;
  className?: string; // Dışarıdan stil ezmek istersek
}

export function InlineIssueCreator({
  projectId,
  sprintId,
  isSprint = false,
  className,
}: InlineIssueCreatorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();

  const enableEditing = () => {
    setIsEditing(true);
    // State değiştikten sonra odaklanmak için kısa bir gecikme
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const disableEditing = () => {
    // Eğer içeride yazı varsa yanlışlıkla kapatmayı engellemek isteyebilirsin
    // ama şimdilik direkt kapatıyoruz.
    setIsEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Eğer form açıksa VE tıklanan yer formun içinde değilse
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        disableEditing();
      }
    };

    // Sadece edit modundaysak dinleyiciyi ekle
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Temizlik: Component kapanırken veya edit modu biterken dinleyiciyi kaldır
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);
  // Dışarı tıklandığında kapatmak için (Opsiyonel ama UX için iyi)
  // useOnClickOutside hook'u kullanılabilir, şimdilik basit tutuyoruz.

  const onSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string;

    if (!title || title.trim() === "") {
      return disableEditing();
    }

    setIsLoading(true);

    formData.append("projectId", projectId);
    if (sprintId) formData.append("sprintId", sprintId);

    const result = await createIssue(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task added to backlog");
      formRef.current?.reset();

      // Sprint modunda değilsek input açık kalsın (seri ekleme)
      // Sprint modundaysak kapansın (yer kaplamasın)
      if (isSprint) {
        disableEditing();
      } else {
        inputRef.current?.focus();
      }

      await mutate(`/api/project/${projectId}`);
    }

    setIsLoading(false);
  };

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiDisabledUntil, setIsAiDisabledUntil] = useState<number | null>(null);

  const handleAiSplit = async () => {
    const title = inputRef.current?.value || "";
    if (!title || title.trim() === "") {
      toast.warn("Please enter a task title first.");
      return;
    }

    // Prevent if temporarily disabled due to rate limit
    if (isAiDisabledUntil && isAiDisabledUntil > Date.now()) {
      const wait = Math.ceil((isAiDisabledUntil - Date.now()) / 1000);
      toast.warn(`AI is rate-limited. Try again in ${wait}s`);
      return;
    }

    setIsAiLoading(true);

    try {
      const locale = (typeof navigator !== "undefined" && navigator.language && navigator.language.startsWith("tr")) ? "tr" : "en";
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
        // clear input if created
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

  // --- RENDER ---

  // BACKLOG MODU: Kart Görünümü (Hedef Tasarım)
  if (!isSprint) {
    if (isEditing) {
      return (
        <form
          ref={formRef}
          action={onSubmit}
          className={cn(
            "relative w-full bg-white rounded-xl shadow-md border border-blue-200 ring-2 ring-blue-100 transition-all flex items-center p-1",
            className,
          )}
        >
          {/* Sol İkon (Aktifken Mavi) */}
          <div className="absolute left-4 text-blue-600">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PlusCircle className="h-5 w-5" />
            )}
          </div>

          <Input
            ref={inputRef}
            name="title"
            disabled={isLoading}
            onKeyDown={onKeyDown}
            placeholder="What needs to be done?"
            className="h-12 pl-12 pr-20 border-0 shadow-none focus-visible:ring-0 bg-transparent text-base placeholder:text-slate-400"
            autoComplete="off"
          />

          {/* Sağdaki Aksiyon Butonları */}
          <div className="flex items-center gap-1 pr-2">
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            >
              <span className="text-xs font-semibold mr-1">Enter</span>
              <CornerDownLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              onClick={handleAiSplit}
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
              disabled={isAiLoading}
            >
              <span className="text-xs font-semibold mr-1">AI ile Alt Görevlere Böl</span>
              {isAiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            </Button>
            <Button
              type="button"
              onClick={disableEditing}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      );
    }

    // Backlog Kapalı Durum (Input gibi görünen Div)
    return (
      <div
        onClick={enableEditing}
        className={cn(
          "relative w-full bg-white rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-text flex items-center h-14 px-4 group",
          className,
        )}
      >
        <Plus className="h-5 w-5 text-slate-400 mr-3 group-hover:text-slate-600 transition-colors" />
        <span className="text-slate-500 font-medium text-sm group-hover:text-slate-600">
          Quickly add a new task...
        </span>
      </div>
    );
  }

  // --- SPRINT MODU (Eski kompakt yapı ama biraz makyajlı) ---

  if (isEditing) {
    return (
      <form
        ref={formRef}
        action={onSubmit}
        className="p-2 flex items-center gap-2 bg-white border-x border-b rounded-b-lg mx-2 mb-2 animate-in slide-in-from-top-1"
      >
        <Input
          ref={inputRef}
          name="title"
          placeholder="Task title..."
          className="h-8 text-sm border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500"
          autoComplete="off"
          onKeyDown={onKeyDown}
          disabled={isLoading}
        />
        <div className="flex items-center gap-1">
          <Button
            type="submit"
            disabled={isLoading}
            size="sm"
            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CornerDownLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            onClick={disableEditing}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-1 px-2 mx-2 mb-2">
      <Button
        onClick={enableEditing}
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-slate-800 hover:bg-slate-100 h-8 px-2 text-xs font-medium transition-all"
      >
        <Plus className="mr-2 h-3.5 w-3.5" /> Create issue
      </Button>
    </div>
  );
}
