"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { createIssue } from "@/actions/issue-creator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IssueLabelList, normalizeIssueLabels } from "./issue-labels";

interface CreateIssueDialogProps {
  projectId: string;
  sprintId?: string;
  trigger?: React.ReactNode;
}

export function CreateIssueDialog({
  projectId,
  sprintId,
  trigger,
}: CreateIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [labelsInput, setLabelsInput] = useState("");

  const previewLabels = normalizeIssueLabels(
    labelsInput
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean),
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("projectId", projectId);
    if (sprintId) formData.append("sprintId", sprintId);

    const result = await createIssue(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Gorev olusturuldu!");
      setLabelsInput("");
      setOpen(false);
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setLabelsInput("");
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            className="h-8 w-full justify-start px-2 text-xs text-muted-foreground hover:text-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Gorev olustur
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Gorev Olustur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Gorev Basligi</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ne yapilmasi gerekiyor?"
              required
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="labels">Etiketler</Label>
            <Input
              id="labels"
              name="labels"
              value={labelsInput}
              onChange={(event) => setLabelsInput(event.target.value)}
              placeholder="bug, ui, urgent"
            />
            <p className="text-xs text-muted-foreground">
              Virgulle ayirarak birden fazla etiket ekleyebilirsin.
            </p>
            {previewLabels.length > 0 ? (
              <IssueLabelList labels={previewLabels} />
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setLabelsInput("");
                setOpen(false);
              }}
            >
              Iptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Olustur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
