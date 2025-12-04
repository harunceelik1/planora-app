"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { MoreHorizontal, RefreshCw } from "lucide-react"; // İkonlar
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeOwnerDialog } from "@/features/components/project/project-data/change-owner-dialog";

interface SettingsPageProps {
  params: Promise<{ projectId: string }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectSettingsPage({ params }: SettingsPageProps) {
  const { projectId } = use(params);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  // Veriyi çek
  const { data: project, isLoading } = useSWR(
    `/api/project/${projectId}`,
    fetcher
  );

  // Form State'leri
  const [name, setName] = useState("");
  const [key, setKey] = useState("");

  // Veri gelince state'i güncelle
  useEffect(() => {
    if (project) {
      setName(project.projectName);
      setKey(project.projectKey);
    }
  }, [project]);

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );

  if (!project) return <div className="p-8">Proje bulunamadı.</div>;

  return (
    <div className="flex flex-col items-center py-10 px-4 bg-white dark:bg-background min-h-screen">
      {/* 1. ÜST HEADER (Breadcrumb ve Başlık) */}
      <div className="w-full max-w-[600px] mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-md text-muted-foreground mb-1">
              <Link href={"/main/projects"} className="hover:underline">
                Alan
              </Link>
              <span> / </span>
              <Link
                href={`/main/projects/${projectId}`}
                className="hover:underline"
              >
                {project.projectName}
              </Link>{" "}
              / Alan ayarları
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              Ayrıntılar
            </h1>
          </div>
          {/* Sağ üstteki üç nokta menüsü */}
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* 2. ORTA KISIM: İKON VE FORM */}
      <div className="w-full max-w-[600px] space-y-8">
        {/* İKON ALANI (Ortalanmış) */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="relative h-24 w-24 border-1 rounded-lg flex items-center justify-center ">
              <Image src="/images/logo.png" alt="Logo" width={64} height={64} />
            </div>
          </div>

          <Button
            variant="outline"
            className="h-8 text-xs font-medium bg-white dark:bg-transparent"
          >
            Simgeyi değiştir
          </Button>
        </div>

        {/* FORM ALANI */}
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Gerekli alanlar yıldız işaretiyle belirtilmiştir *
          </p>

          {/* Input: Ad */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
            >
              Ad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus-visible:ring-blue-600 focus-visible:ring-2"
            />
          </div>

          {/* Input: Anahtar (Disabled) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label
                htmlFor="key"
                className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide"
              >
                Alan anahtarı <span className="text-red-500">*</span>
              </Label>
              {/* Bilgi ikonu eklenebilir */}
            </div>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              className="h-10 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus-visible:ring-blue-600 focus-visible:ring-2"
            />
          </div>

          {/* Alan Sahibi (Custom Div) */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
              Alan sahibi
            </Label>
            <ChangeOwnerDialog
              projectId={project.id}
              currentOwnerId={project.ownerId} // Mevcut sahibin ID'si
              trigger={
                <div className="flex items-center justify-between px-3 h-10 border border-slate-300 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={project.owner?.image || ""} />
                      <AvatarFallback className="text-[9px]">
                        {getInitials(project.owner?.name || "", "")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {project.owner?.name}
                    </span>
                  </div>

                  <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Değiştir
                  </span>
                </div>
              }
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Alan liderinizin alandaki biletlere erişimi olduğundan emin olun.
            </p>
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/main/projects/${projectId}`)}
              className="font-medium text-muted-foreground hover:bg-slate-100"
            >
              İptal
            </Button>
            <Button
              disabled={isSaving}
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4"
            >
              {isSaving ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
