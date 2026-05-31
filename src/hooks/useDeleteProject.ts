"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify"; // Kullandığınız toast kütüphanesi
import { ROUTES } from "@/constants/routest";

export function useDeleteProject() {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const deleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Silme işlemi başarısız oldu.");
      }

      toast.success("Proje başarıyla silindi.");

      // Projeler listesini kontrol et: eğer hiç proje yoksa ana sayfaya, aksi halde /main/projects'e yönlendir
      try {
        const projectsRes = await fetch("/api/project");
        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          const hasProjects = Array.isArray(projects) && projects.length > 0;
          if (hasProjects) {
            router.push(ROUTES.PROJECTS.LIST);
          } else {
            router.push(ROUTES.MAIN);
          }
        } else {
          // Eğer projeler alınamazsa varsayılan olarak listeye yönlendir
          router.push(ROUTES.PROJECTS.LIST);
        }
      } catch (err) {
        console.error("Proje kontrolü sırasında hata:", err);
        router.push(ROUTES.PROJECTS.LIST);
      }

      router.refresh(); // Server componentleri yenile

      return true; // İşlem başarılı
    } catch (error) {
      toast.error("Proje silinirken bir hata oluştu.");
      console.error(error);
      return false; // İşlem başarısız
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteProject, isDeleting };
}
