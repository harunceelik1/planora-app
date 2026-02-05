"use client";

import { useState, useRef, ElementRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { useSWRConfig } from "swr";
import { CornerDownLeft } from "lucide-react";
import { createIssue } from "@/actions/issue-creator";

interface InlineIssueCreatorProps {
  projectId: string;
  sprintId?: string; // Hangi listenin altına ekleniyor?
  isSprint?: boolean; // Tasarım farkı için (Sprint kutusu içi mi, backlog mu?)
}

export function InlineIssueCreator({
  projectId,
  sprintId,
  isSprint = false,
}: InlineIssueCreatorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  const onSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string;

    if (!title || title.trim() === "") {
      return disableEditing();
    }

    setIsLoading(true);

    // Server Action çağırıyoruz
    // createIssue fonksiyonunu biraz güncellememiz gerekebilir (aşağıda bakacağız)
    // Şimdilik FormData ile gönderiyoruz.

    // ProjectID ve SprintID'yi manuel ekle (Input hidden yerine)
    formData.append("projectId", projectId);
    if (sprintId) formData.append("sprintId", sprintId);

    const result = await createIssue(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Görev oluşturuldu");
      formRef.current?.reset();
      // Jira'da input kapanmaz, seri ekleme için açık kalır.
      // Kapatmak istersen: disableEditing();
      await mutate(`/api/project/${projectId}`);

      inputRef.current?.focus();
    }

    setIsLoading(false);
  };

  if (isEditing) {
    return (
      <form
        ref={formRef}
        action={onSubmit}
        className={cn(
          "p-2 flex items-center gap-2  bg-white animate-in fade-in slide-in-from-top-2",
          isSprint ? "border-x  rounded-b-lg mx-2 mb-2" : "border-t"
        )}
      >
        <Input
          ref={inputRef}
          id="title"
          name="title"
          placeholder="Ne yapılması gerekiyor?"
          className="h-8 text-sm bg-transparent border-none focus-visible:ring-0 px-2"
          autoComplete="off"
          onKeyDown={onKeyDown}
          disabled={isLoading}
        />
        <div className="flex items-center gap-1">
          <Button
            type="submit"
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="h-6 px-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <span>Oluştur</span> <CornerDownLeft />
              </div>
            )}
          </Button>
          <Button
            type="button"
            onClick={disableEditing}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  // Kapalıyken Görünen Buton
  return (
    <div
      className={cn(isSprint ? "p-1 bg-slate-50 rounded-b-lg" : "p-0 border-t")}
    >
      <Button
        onClick={enableEditing}
        variant="ghost"
        className={cn(
          "w-full justify-start text-muted-foreground hover:text-blue-600 h-9 px-4 text-xs font-medium transition-colors",
          !isSprint && "rounded-none h-10"
        )}
      >
        <Plus className="mr-2 h-4 w-4" /> Görev oluştur
      </Button>
    </div>
  );
}
