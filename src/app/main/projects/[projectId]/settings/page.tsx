"use client";

import { useState, useEffect, use } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Loader2, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeOwnerDialog } from "@/features/components/project/project-data/change-owner-dialog";
import { useUpdateProject } from "@/hooks/useUpdateProject";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  const { projectId } = use(params);
  const router = useRouter();
  const { updateProject, isUpdating } = useUpdateProject(projectId);

  // Veriyi çek (mutate fonksiyonunu da aldık)
  const {
    data: project,
    isLoading,
    mutate,
  } = useSWR(`/api/project/${projectId}`, fetcher);

  // --- STATE TANIMLARI ---
  const [name, setName] = useState("");
  const [key, setKey] = useState("");

  // 👇 YENİ STATE'LER (Monday tarzı için)
  const [image, setImage] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");

  // Veri gelince state'leri doldur
  // Veri gelince state'leri doldur
  // Sadece sayfa ilk açıldığında çalışır, sonrasında senin seçimlerine karışmaz.
  useEffect(() => {
    if (project) {
      // Sadece state boşsa doldur (veya ilk yüklemede)
      // Bu sayede senin seçtiğin rengi ezmez.
      setName((prev) => prev || project.projectName || "");
      setKey((prev) => prev || project.projectKey || "");
      setImage((prev) => prev || project.image || "");
      setIcon((prev) => prev || project.icon || "Layout");
      setColor((prev) => prev || project.color || "#3357FF");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // ✅ Sadece yükleme bitince 1 kere çalışır.
  const handleIconUpdate = async (newData: {
    image?: string;
    icon?: string;
    color?: string;
  }) => {
    // 1. STATE'LERİ GÜNCELLE (Anlık değişim için)
    if (newData.image !== undefined) setImage(newData.image);
    if (newData.icon !== undefined) setIcon(newData.icon);
    if (newData.color !== undefined) setColor(newData.color);

    // 2. YENİ VERİYİ HAZIRLA
    const optimisticData = {
      ...project,
      image: newData.image ?? image,
      icon: newData.icon ?? icon,
      color: newData.color ?? color,
    };

    // 3. SWR CACHE'İNİ GÜNCELLE (revalidate: false ÇOK ÖNEMLİ)
    // false demezsen gider sunucudan eski veriyi çeker yine bozulur.
    await mutate(optimisticData, false);

    try {
      // 4. SESSİZ KAYIT (Toast yok)
      await updateProject(
        {
          name,
          key,
          image: newData.image ?? image,
          icon: newData.icon ?? icon,
          color: newData.color ?? color,
        },
        { showToast: false }
      );
    } catch (error) {
      // Hata olursa cache'i geri al (rollback) ve uyar
      mutate();
      toast.error("Kaydedilemedi");
    }
  };

  // 👇 FORMU KAYDETME (BU HALA TOAST GÖSTERSİN)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Burada options vermiyoruz, varsayılan (true) çalışır ve toast çıkar
    await updateProject({ name, key, image, icon, color });
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );

  if (!project) return <div className="p-8">Proje bulunamadı.</div>;

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
        <h2 className="text-2xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-muted-foreground">
          Proje ayarlarını ve ekip üyeliklerini buradan yönetin.
        </p>
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
              <Settings className="mr-2 h-4 w-4" /> Genel
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className=" cursor-pointer w-full justify-start px-3 py-2 h-9 text-sm font-medium rounded-md hover:bg-muted data-[state=active]:bg-muted data-[state=active]:text-primary transition-all"
            >
              <Users className="mr-2 h-4 w-4" /> Üyeler ve Erişim
            </TabsTrigger>
          </TabsList>
        </aside>

        {/* SAĞ İÇERİK */}
        <div className="flex-1 md:max-w-2xl">
          {/* --- TAB: GENEL --- */}
          <TabsContent value="general" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Proje Kimliği</CardTitle>
                <CardDescription>
                  Projenizin görünür adı, simgesi ve temel ayarları.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  {/* 👇 BURAYI DEĞİŞTİRDİK: YENİ İKON SEÇİCİ */}
                  <div className="flex flex-col gap-3">
                    <Label>Proje Görünümü</Label>
                    <ProjectIconPicker
                      // 1. Resim (Boşsa null gönderiyoruz)
                      image={image || null}
                      // 2. 👇 HATA BURADAYDI: İsimleri eşleştirdik
                      currentIcon={icon} // State adı 'icon', Prop adı 'currentIcon'
                      currentColor={color} // State adı 'color', Prop adı 'currentColor'
                      name={name}
                      // 3. Değişiklik Fonksiyonu
                      onChange={handleIconUpdate}
                    />
                  </div>

                  {/* İSİM VE ANAHTAR */}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Proje Adı</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="key">Proje Anahtarı</Label>
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
                          Max 5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ALAN SAHİBİ */}
                  <div className="grid gap-2">
                    <Label>Alan Sahibi</Label>
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
                            Değiştir
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
                        "Değişiklikleri Kaydet"
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
              <h3 className="text-lg font-medium">Ekip Yönetimi</h3>
              <p className="text-sm text-muted-foreground">
                Projenize kimlerin erişebileceğini ve yetkilerini buradan
                kontrol edin.
              </p>
            </div>
            <MembersList
              projectId={projectId}
              members={formattedMembers}
              currentUserId={project?.ownerId || ""}
              ownerId={project?.ownerId || ""}
              onUpdate={() => mutate()}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
