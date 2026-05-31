"use client";

import { useState, useEffect, use } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Settings, Users } from "lucide-react"; // Loader2 kaldırıldı, kullanılmıyordu
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChangeOwnerDialog } from "@/features/components/project/project-data/change-owner-dialog";
import { useUpdateProject } from "@/hooks/useUpdateProject";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl"; // 👈 İthalat eklendi

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MembersList } from "@/features/components/project/member-list";

import { ProjectIconPicker } from "@/features/components/project/project-data/project-icon-picker";

interface SettingsPageProps {
  params: Promise<{ projectId: string }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectSettingsPage({ params }: SettingsPageProps) {
  const t = useTranslations("ProjectSettings"); // 👈 Çeviri kancası (Hook)
  const { projectId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { updateProject, isUpdating } = useUpdateProject(projectId);

  const {
    data: project,
    isLoading,
    mutate,
  } = useSWR(`/api/project/${projectId}`, fetcher);

  // --- STATE TANIMLARI ---
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [image, setImage] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (project) {
      setName((prev) => prev || project.projectName || "");
      setKey((prev) => prev || project.projectKey || "");
      setImage((prev) => prev || project.image || "");
      setIcon((prev) => prev || project.icon || "Layout");
      setColor((prev) => prev || project.color || "#3357FF");
    }
  }, [isLoading, project]); // project dependency eklendi

  // ✅ DÜZELTİLMİŞ LOGIC: Sadece state günceller, DB'ye yazmaz.
  const handleIconUpdate = (newData: {
    image?: string;
    icon?: string;
    color?: string;
  }) => {
    if (newData.image !== undefined) setImage(newData.image);
    if (newData.icon !== undefined) setIcon(newData.icon);
    if (newData.color !== undefined) setColor(newData.color);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProject({ name, key, image, icon, color });
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );

  if (!project) return <div className="p-8">{t("notFound")}</div>; // "Proje bulunamadı"

  const formattedMembers =
    project?.members?.map((m: any) => ({
      id: m.userId,
      role: m.role,
      user: m.user,
    })) || [];

  return (
    <div className="container max-w-6xl py-10 px-4 md:px-8">
      {/* BAŞLIK */}
      <div className="space-y-0.5 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Separator className="my-6" />

      <Tabs
        defaultValue="general"
        className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12"
      >
        {/* SOL MENÜ */}
        <aside className="md:w-1/4">
          <TabsList className="flex md:flex-col justify-start w-full h-auto bg-transparent p-0 gap-2">
            <TabsTrigger
              value="general"
              className="cursor-pointer w-full justify-start px-3 py-2 h-9 text-sm font-medium rounded-md hover:bg-muted data-[state=active]:bg-muted data-[state=active]:text-primary transition-all"
            >
              <Settings className="mr-2 h-4 w-4" /> {t("tabs.general")}
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="cursor-pointer w-full justify-start px-3 py-2 h-9 text-sm font-medium rounded-md hover:bg-muted data-[state=active]:bg-muted data-[state=active]:text-primary transition-all"
            >
              <Users className="mr-2 h-4 w-4" /> {t("tabs.members")}
            </TabsTrigger>
          </TabsList>
        </aside>

        {/* SAĞ İÇERİK */}
        <div className="flex-1 md:max-w-2xl">
          {/* --- TAB: GENEL --- */}
          <TabsContent value="general" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{t("General.title")}</CardTitle>
                <CardDescription>{t("General.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  {/* İKON SEÇİCİ */}
                  <div className="flex flex-col gap-3">
                    <Label>{t("form.projectLook")}</Label>
                    <ProjectIconPicker
                      image={image || null}
                      currentIcon={icon}
                      currentColor={color}
                      name={name}
                      onChange={handleIconUpdate}
                    />
                  </div>

                  {/* İSİM VE ANAHTAR */}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{t("form.projectName")}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="key">{t("form.projectKey")}</Label>
                      <div className="relative">
                        <Input
                          id="key"
                          value={key}
                          onChange={(e) => setKey(e.target.value.toUpperCase())}
                          disabled={isUpdating}
                          maxLength={5}
                          className="uppercase font-mono"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                          {t("form.maxChar", { count: 5 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ALAN SAHİBİ */}
                  <div className="grid gap-2">
                    <Label>{t("form.owner")}</Label>
                    <ChangeOwnerDialog
                      projectId={project.id}
                      currentOwnerId={project.ownerId || ""}
                      trigger={
                        <div className="flex items-center justify-between px-3 h-10 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.owner?.image || ""} />
                              <AvatarFallback className="text-[10px]">
                                {project.owner?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {project.owner?.name}
                            </span>
                          </div>
                          <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {t("form.change")}
                          </span>
                        </div>
                      }
                    />
                  </div>

                  {/* KAYDET BUTONU */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isUpdating ? (
                        <Spinner className="size-8" />
                      ) : (
                        t("form.save")
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB: ÜYELER --- */}
          <TabsContent value="members" className="space-y-6 mt-0">
            <div className="mb-4">
              <h3 className="text-lg font-medium">{t("Members.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Members.description")}
              </p>
            </div>
            <MembersList
              projectId={projectId}
              members={formattedMembers}
              currentUserId={session?.user?.id || ""}
              ownerId={project?.ownerId || ""}
              onUpdate={() => mutate()}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
