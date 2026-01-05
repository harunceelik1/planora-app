"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Plus, Loader2 } from "lucide-react";
import { createIssue } from "@/hooks/useCreateIssue";

interface CreateIssueDialogProps {
  projectId: string;
  sprintId?: string; // Eğer direkt sprint içine ekleyeceksek
  trigger?: React.ReactNode; // Özel buton göndermek istersek
}

export function CreateIssueDialog({
  projectId,
  sprintId,
  trigger,
}: CreateIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Project ve Sprint ID'yi gizlice ekle
    formData.append("projectId", projectId);
    if (sprintId) formData.append("sprintId", sprintId);

    const result = await createIssue(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Görev oluşturuldu!");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-blue-600 h-8 text-xs px-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Görev oluştur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Görev Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Görev Başlığı</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ne yapılması gerekiyor?"
              required
              autoFocus
            />
          </div>

          {/* İleride buraya Açıklama, Öncelik vb. eklenebilir */}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
