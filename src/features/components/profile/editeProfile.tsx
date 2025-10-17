"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  initialName: string;
  initialImage: string;
  initials: string;
};

type Form = { name: string };

export default function EditProfileDialog({
  initialName,
  initialImage,
  initials,
}: Props) {
  const [preview, setPreview] = React.useState<string>(initialImage);
  const { register, handleSubmit, reset } = useForm<Form>({
    defaultValues: { name: initialName },
  });

  function onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      // kapatılırken resetle
      reset({ name: initialName });
      setPreview(initialImage);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  }

  const onSubmit = (data: Form) => {
    console.log("would save:", { ...data, image: preview });
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Profili Güncelle</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Update profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={preview}
                className="object-cover rounded-full"
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
                <Button type="button">Upload</Button>
              </label>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                // onClick={() => setPreview("")}
              >
                Remove
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Recommended size 1:1, up to 10MB.
          </p>

          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...register("name")} placeholder="Name" />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
