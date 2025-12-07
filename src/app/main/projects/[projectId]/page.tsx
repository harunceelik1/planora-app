"use client";

import { Spinner } from "@/components/ui/spinner";
import { ProjectActions } from "@/features/components/project/proejct-actions/actions";
import { AddMemberDialog } from "@/features/components/project/project-data/add-member-dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import useSWR from "swr";
import * as Icons from "lucide-react";
interface ProjectDetailsPageProps {
  params: Promise<{ projectId: string }>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);

  // API 404 (Bulunamadı) veya 500 dönerse hata fırlat
  if (!res.ok) {
    const error = new Error("Proje bulunamadı");
    throw error;
  }

  return res.json();
};

export default function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const router = useRouter();
  const { projectId } = use(params);
  const RenderIcon = ({
    iconName,
    className,
  }: {
    iconName: string;
    className?: string;
  }) => {
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.Layout;
    return <IconComponent className={className} />;
  };
  const {
    data: project,
    isLoading,
    error,
  } = useSWR(`/api/project/${projectId}`, fetcher, {
    shouldRetryOnError: false, // 404 alırsa tekrar tekrar deneme
    revalidateOnFocus: true, // Sekmeye geri dönünce kontrol et
  });

  // 1. YÖNLENDİRME (useEffect)
  useEffect(() => {
    // Yükleme bitti ama Hata varsa veya Proje yoksa
    if (!isLoading && (error || !project)) {
      // replace: Geçmişe kaydetmeden direkt değiştir (Geri tuşu sorunu olmasın)
      router.replace("/main/projects");
    }
  }, [isLoading, error, project, router]);

  // 2. YÜKLENİYOR EKRANI
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8 text-blue-600" />
      </div>
    );
  }

  // 3. KORUMA BLOĞU (Çok Önemli!)
  // Eğer hata varsa veya proje yoksa, ASLA aşağıdaki return kısmına geçme.
  // Sadece yönlendirme bitene kadar boş bir ekran veya mesaj göster.
  if (error || !project) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Spinner className="size-8 " />
        <p className="text-muted-foreground font-medium animate-pulse">
          Proje bulunamadı, ana sayfaya yönlendiriliyorsunuz...
        </p>
      </div>
    );
  }

  // 4. ANA İÇERİK (Sadece Proje VARSA burası çalışır)
  return (
    <main className="p-8 h-screen gap-6 flex flex-col">
      <nav>
        <h2 className="text-muted-foreground text-sm mb-2">
          <Link href={"/main/projects"} className="hover:underline">
            Alan
          </Link>
          <span className="mx-2">/</span>
          <span>{project.projectKey}</span>
        </h2>

        <div className="flex flex-row items-center">
          <div className="mr-3">
            {project.image ? (
              // DURUM A: Özel Resim Varsa
              <div className="relative h-8 w-8 rounded-md overflow-hidden border border-slate-200">
                <Image
                  src={project.image}
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : project.icon && project.color ? (
              // DURUM B: İkon + Renk Varsa (Monday Tarzı)
              <div
                className="h-8 w-8 rounded-md flex items-center justify-center border border-black/5 shadow-sm"
                style={{ backgroundColor: project.color }}
              >
                <RenderIcon
                  iconName={project.icon}
                  className="h-5 w-5 text-white"
                />
              </div>
            ) : (
              // DURUM C: Hiçbiri Yoksa (Varsayılan Logo)
              <div className="relative h-8 w-8">
                <Image
                  src={"/images/logo.png"}
                  alt="Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <p className="items-center justify-center flex pl-2 font-bold text-xl text-gray-800 dark:text-gray-100">
            {project.projectName}
          </p>

          <div className="ml-4 flex flex-row items-center gap-1">
            <AddMemberDialog
              projectId={project.id}
              projectName={project.projectName}
            />

            <ProjectActions
              projectId={project.id}
              projectName={project.projectName}
            />
          </div>
        </div>
      </nav>

      <div className="flex-1 bg-slate-50 dark:bg-slate-900/20 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
        Proje Panosu
      </div>
    </main>
  );
}
